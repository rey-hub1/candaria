<?php

namespace App\Http\Controllers;

use App\Models\Seller;
use App\Models\SellerSettlement;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class SettlementController extends Controller
{
    // View unpaid amounts and settlement history
    public function index()
    {
        // Get all sellers with their unpaid amounts
        $sellers = Seller::select('sellers.*')
            ->selectSub(function($query) {
                $query->selectRaw('COALESCE(SUM(transaction_items.profit_seller), 0)')
                    ->from('transaction_items')
                    ->join('products', 'products.id', '=', 'transaction_items.product_id')
                    ->whereColumn('products.seller_id', 'sellers.id')
                    ->whereNull('transaction_items.seller_settlement_id');
            }, 'unpaid_amount')
            ->get();

        // Get past settlements
        $settlements = SellerSettlement::with(['seller', 'user'])
            ->latest()
            ->paginate(15);

        return view('settlements.index', compact('sellers', 'settlements'));
    }

    // Process payment / mark as paid
    public function store(Request $request)
    {
        $request->validate([
            'seller_id' => 'required|exists:sellers,id',
            'notes' => 'nullable|string|max:500'
        ]);

        $sellerId = $request->input('seller_id');
        $seller = Seller::findOrFail($sellerId);

        try {
            DB::beginTransaction();

            // Find all unpaid transaction items for this seller
            $unpaidItems = TransactionItem::whereHas('product', function($q) use ($sellerId) {
                    $q->where('seller_id', $sellerId);
                })
                ->whereNull('seller_settlement_id')
                ->lockForUpdate()
                ->get();

            if ($unpaidItems->isEmpty()) {
                return redirect()->route('settlements.index')->with('error', 'Tidak ada uang titipan yang harus dibayar untuk siswa ini.');
            }

            // Sum up the unpaid amount
            $totalAmount = $unpaidItems->sum('profit_seller');

            // Create settlement record
            $settlement = SellerSettlement::create([
                'seller_id' => $sellerId,
                'user_id' => Auth::id(),
                'total_amount' => $totalAmount,
                'settlement_date' => Carbon::now(),
                'notes' => $request->input('notes') ?? "Pembayaran penitipan untuk {$seller->name}"
            ]);

            // Update items to link to settlement
            foreach ($unpaidItems as $item) {
                $item->update([
                    'seller_settlement_id' => $settlement->id
                ]);
            }

            DB::commit();

            return redirect()->route('settlements.index')
                ->with('success', "Berhasil melakukan pembayaran sebesar Rp" . number_format($totalAmount, 0, ',', '.') . " ke siswa {$seller->name}.");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('settlements.index')
                ->with('error', 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage());
        }
    }

    // View specific settlement details
    public function show(SellerSettlement $settlement)
    {
        $settlement->load(['seller', 'user', 'transactionItems.product.category']);
        return view('settlements.show', compact('settlement'));
    }
}
