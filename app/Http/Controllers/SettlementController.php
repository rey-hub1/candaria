<?php

namespace App\Http\Controllers;

use App\Models\Seller;
use App\Models\SellerSettlement;
use App\Models\TransactionItem;
use App\Models\Cashbook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\SettlementsReportExport;
use Maatwebsite\Excel\Facades\Excel;

class SettlementController extends Controller
{
    // View all sellers and their balances
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'sort', 'dir', 'start_date', 'end_date', 'preset']);
        
        $startDate = $filters['start_date'] ?? null;
        $endDate = $filters['end_date'] ?? null;

        // Use a subquery to calculate earnings and payments
        $query = Seller::withCount('products')
            ->select('sellers.*')
            ->selectSub(function($query) use ($startDate, $endDate) {
                $query->selectRaw('COALESCE(SUM(transaction_items.profit_seller), 0)')
                    ->from('transaction_items')
                    ->join('products', 'products.id', '=', 'transaction_items.product_id')
                    ->whereColumn('products.seller_id', 'sellers.id');

                if ($startDate) {
                    $query->whereDate('transaction_items.created_at', '>=', $startDate);
                }
                if ($endDate) {
                    $query->whereDate('transaction_items.created_at', '<=', $endDate);
                }
            }, 'total_earnings')
            ->selectSub(function($query) use ($startDate, $endDate) {
                $query->selectRaw('COALESCE(SUM(total_amount), 0)')
                    ->from('seller_settlements')
                    ->whereColumn('seller_id', 'sellers.id');

                if ($startDate) {
                    $query->whereDate('seller_settlements.created_at', '>=', $startDate);
                }
                if ($endDate) {
                    $query->whereDate('seller_settlements.created_at', '<=', $endDate);
                }
            }, 'total_paid')
            ->with(['products' => fn ($q) => $q->where('type', 'siswa')->where('stock', '>', 0)->orderBy('name')])
            ->filter($filters, ['name', 'class']);

        if ($request->input('export')) {
            $allSellers = $query->get();
            $totalUnpaidAll = 0;
            foreach ($allSellers as $seller) {
                $seller->unpaid_amount = $seller->total_earnings - $seller->total_paid;
                $totalUnpaidAll += $seller->unpaid_amount;
            }

            if ($request->input('export') === 'pdf') {
                $pdf = Pdf::loadView('reports.settlements_pdf', [
                    'sellers' => $allSellers,
                    'startDate' => $startDate,
                    'endDate' => $endDate,
                    'totalUnpaid' => $totalUnpaidAll,
                ])->setPaper('a4', 'portrait');
                return $pdf->stream('laporan-pembayaran-penitip-' . now()->format('Y-m-d') . '.pdf');
            }

            if ($request->input('export') === 'xlsx') {
                return Excel::download(new SettlementsReportExport($allSellers, $startDate, $endDate, $totalUnpaidAll), 'laporan-pembayaran-penitip-' . now()->format('Y-m-d') . '.xlsx');
            }
        }

        $sellers = $query->paginate(15)->withQueryString();

        // Calculate total unpaid across all sellers for summary
        $totalUnpaid = 0;
        foreach ($sellers as $seller) {
            $seller->unpaid_amount = $seller->total_earnings - $seller->total_paid;
            $totalUnpaid += $seller->unpaid_amount;
        }

        return Inertia::render('Settlements/Index', [
            'sellers' => $sellers,
            'filters' => $filters,
            'totalUnpaid' => $totalUnpaid
        ]);
    }

    // Show the ledger (mutasi/rincian) for a specific seller
    public function show(Request $request, $id)
    {
        $seller = Seller::findOrFail($id);

        // Calculate total earnings
        $totalEarnings = TransactionItem::whereHas('product', function($q) use ($id) {
            $q->where('seller_id', $id);
        })->sum('profit_seller');

        // Calculate total paid
        $totalPaid = SellerSettlement::where('seller_id', $id)->sum('total_amount');
        
        $seller->unpaid_amount = $totalEarnings - $totalPaid;
        $seller->total_earnings = $totalEarnings;
        $seller->total_paid = $totalPaid;

        // Get all sales (earnings) — join instead of whereHas subquery
        $sales = TransactionItem::with(['product:id,name', 'transaction:id,transaction_code'])
            ->join('products', 'products.id', '=', 'transaction_items.product_id')
            ->where('products.seller_id', $id)
            ->select(
                'transaction_items.id',
                'transaction_items.created_at',
                DB::raw("'sale' as type"),
                'transaction_items.profit_seller as amount',
                'transaction_items.quantity',
                'transaction_items.product_id',
                'transaction_items.transaction_id'
            )
            ->latest('transaction_items.created_at')
            ->get();

        // Get all payouts (settlements)
        $payouts = SellerSettlement::where('seller_id', $id)
            ->select(
                'id',
                'created_at',
                DB::raw("'payout' as type"),
                'total_amount as amount',
                DB::raw("NULL as quantity"),
                DB::raw("NULL as product_id"),
                DB::raw("NULL as transaction_id"),
                'notes'
            )
            ->latest()
            ->get();

        // Merge — both already sorted desc, use sortByDesc for final merge
        $ledger = $sales->concat($payouts)->sortByDesc('created_at')->values();

        return Inertia::render('Settlements/Show', [
            'seller' => $seller,
            'ledger' => $ledger
        ]);
    }

    // Process partial or full payment
    public function store(Request $request)
    {
        $request->validate([
            'seller_id' => 'required|exists:sellers,id',
            'amount' => 'required|numeric|min:1',
            'notes' => 'nullable|string|max:255'
        ]);

        $sellerId = $request->input('seller_id');
        $amountToPay = $request->input('amount');

        try {
            DB::beginTransaction();

            $seller = Seller::findOrFail($sellerId);

            // Create settlement record (Payout)
            $settlement = SellerSettlement::create([
                'seller_id' => $sellerId,
                'user_id' => Auth::id(),
                'total_amount' => $amountToPay,
                'settlement_date' => Carbon::now(),
                'notes' => $request->input('notes') ?? "Pencairan dana untuk {$seller->name}"
            ]);

            // Create Cashbook entry for expense (Credit)
            Cashbook::create([
                'date' => now()->toDateString(),
                'description' => 'Pencairan Penitip: ' . $seller->name,
                'type' => 'credit',
                'amount' => $amountToPay,
                'source' => 'settlement',
                'reference_id' => $settlement->id,
                'user_id' => Auth::id(),
            ]);

            // Update seller_settlement_id in transaction_items using FIFO
            $unpaidItems = TransactionItem::whereHas('product', function($q) use ($sellerId) {
                $q->where('seller_id', $sellerId);
            })->whereNull('seller_settlement_id')
              ->where('profit_seller', '>', 0)
              ->orderBy('created_at', 'asc')
              ->get();

            $remainingAmount = $amountToPay;
            $itemsToUpdate = [];

            foreach ($unpaidItems as $item) {
                if ($remainingAmount >= $item->profit_seller) {
                    $itemsToUpdate[] = $item->id;
                    $remainingAmount -= $item->profit_seller;
                } else {
                    // Stop if remaining amount cannot fully cover the next item
                    break;
                }
            }

            if (!empty($itemsToUpdate)) {
                TransactionItem::whereIn('id', $itemsToUpdate)->update([
                    'seller_settlement_id' => $settlement->id
                ]);
            }

            DB::commit();

            return redirect()->back()
                ->with('success', "Berhasil mencairkan dana sebesar Rp" . number_format($amountToPay, 0, ',', '.') . " ke {$seller->name}.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage());
        }
    }
}
