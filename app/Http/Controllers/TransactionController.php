<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Cashbook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TransactionController extends Controller
{
    // List all transactions (for reports/history)
    public function index()
    {
        // Passive Deletion: Hapus transaksi yang lebih tua dari 7 hari
        $sevenDaysAgo = now()->subDays(7);
        $oldTransactions = Transaction::where('created_at', '<', $sevenDaysAgo)->get(['id']);
        if ($oldTransactions->isNotEmpty()) {
            $oldIds = $oldTransactions->pluck('id')->toArray();
            
            // Hapus juga riwayat di buku kas (opsional, tapi disarankan agar data sinkron jika transaksi dibuang total)
            \App\Models\Cashbook::where('source', 'transaction')->whereIn('reference_id', $oldIds)->delete();
            
            // Hapus transaksi (item akan terhapus otomatis berkat onDelete('cascade'))
            Transaction::whereIn('id', $oldIds)->delete();
        }

        $filters = request()->only(['search', 'sort', 'dir', 'start_date', 'end_date']);
        $query = Transaction::with(['user', 'items.product'])->filter($filters, ['transaction_code']);

        if (!empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        $transactions = $query->latest()->paginate(15)->withQueryString();
        return Inertia::render('Transactions/Index', ['transactions' => $transactions, 'filters' => $filters]);
    }

    // Cashier interface
    public function create(Request $request)
    {
        $search = $request->input('search');
        
        $query = Product::where('stock', '>', 0)
            ->with(['category', 'seller']);
            
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('code', 'like', "{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
            $query->orderByRaw("CASE WHEN code LIKE ? THEN 1 ELSE 2 END", ["{$search}%"]);
        }
        
        // Limit to 50 for performance
        $products = $query->take(50)->get();
        
        // Use 'code' column as prefix since 'prefix' column might be null
        $prefixes = \App\Models\Category::select('code')->whereNotNull('code')->distinct()->pluck('code')->values();

        return Inertia::render('Transactions/Create', [
            'products' => $products,
            'search' => $search,
            'prefixes' => $prefixes
        ]);
    }

    // Checkout / Store Transaction
    public function checkout(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'paid_amount' => 'required|numeric|min:0',
        ]);

        $items = $request->input('items');
        $paidAmount = $request->input('paid_amount');
        
        $totalAmount = 0;
        
        // Validate total amount and stock first
        $itemIds = array_column($items, 'id');
        $products = Product::whereIn('id', $itemIds)->get()->keyBy('id');
        
        $cartItems = [];
        foreach ($items as $item) {
            if (!isset($products[$item['id']])) continue;
            
            $product = $products[$item['id']];
            if ($product->stock < $item['quantity']) {
                return redirect()->back()->with('error', "Stok {$product->name} tidak cukup.");
            }
            $subtotal = $product->selling_price * $item['quantity'];
            $totalAmount += $subtotal;
            $cartItems[] = [
                'product' => $product,
                'quantity' => $item['quantity']
            ];
        }

        if ($paidAmount < $totalAmount) {
            return redirect()->back()->with('error', 'Uang bayar kurang dari total belanja.');
        }

        $changeAmount = $paidAmount - $totalAmount;

        try {
            DB::beginTransaction();

            // Generate sequential 5-digit transaction code daily
            $today = now()->toDateString();
            $latest = Transaction::whereDate('created_at', $today)
                ->orderBy('id', 'desc')
                ->first();
                
            $nextNumber = $latest ? ((int)$latest->transaction_code) + 1 : 1;
            $transactionCode = str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
            
            // Ensure uniqueness for today
            while (Transaction::whereDate('created_at', $today)->where('transaction_code', $transactionCode)->exists()) {
                $nextNumber++;
                $transactionCode = str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
            }

            // Create Transaction
            $transaction = Transaction::create([
                'transaction_code' => $transactionCode,
                'user_id' => Auth::id(),
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'change_amount' => $changeAmount,
            ]);

            // Save items and deduct stock
            foreach ($cartItems as $cItem) {
                $product = $cItem['product'];
                $qty = $cItem['quantity'];

                $lockedProduct = Product::lockForUpdate()->findOrFail($product->id);

                if ($lockedProduct->stock < $qty) {
                    throw new \Exception("Stok produk {$lockedProduct->name} tidak mencukupi.");
                }

                // Deduct stock
                $lockedProduct->decrement('stock', $qty);

                // Calculate profits
                $costPrice = $lockedProduct->cost_price;
                $sellingPrice = $lockedProduct->selling_price;

                if ($lockedProduct->type === 'siswa') {
                    $profitKantin = ($sellingPrice - $costPrice) * $qty;
                    $profitSeller = $costPrice * $qty; // uang untuk siswa
                } else {
                    $profitKantin = ($sellingPrice - $costPrice) * $qty;
                    $profitSeller = 0;
                }

                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'cost_price' => $costPrice,
                    'selling_price' => $sellingPrice,
                    'profit_kantin' => $profitKantin,
                    'profit_seller' => $profitSeller,
                    'seller_settlement_id' => null, // unpaid by default
                ]);
            }

            // Create Cashbook entry for income (Debit)
            Cashbook::create([
                'date' => now()->toDateString(),
                'description' => 'Penjualan ' . $transaction->transaction_code,
                'type' => 'debit',
                'amount' => $transaction->total_amount,
                'source' => 'transaction',
                'reference_id' => $transaction->id,
                'user_id' => Auth::id(),
            ]);

            DB::commit();

            return redirect()->route('transactions.show', $transaction->id)
                ->with('success', 'Transaksi berhasil disimpan!')
                ->with('print_modal', true);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    // View transaction receipt / detail
    public function show($id)
    {
        $transaction = Transaction::with(['user', 'items.product.seller'])->findOrFail($id);
        $printModal = session()->get('print_modal', false);
        return Inertia::render('Transactions/Show', [
            'transaction' => $transaction,
            'printModal' => (bool) $printModal,
        ]);
    }

    // Void / Cancel Transaction
    public function destroy($id)
    {
        $transaction = Transaction::with('items')->findOrFail($id);
        
        // Check if any item has been settled
        foreach ($transaction->items as $item) {
            if ($item->seller_settlement_id !== null) {
                return redirect()->back()->with('error', 'Transaksi tidak dapat dibatalkan karena keuntungan sudah dicairkan ke penitip.');
            }
        }

        try {
            DB::beginTransaction();

            // Reverse stock
            foreach ($transaction->items as $item) {
                $product = Product::lockForUpdate()->find($item->product_id);
                if ($product) {
                    $product->increment('stock', $item->quantity);
                }
            }

            // Remove Cashbook entry
            \App\Models\Cashbook::where('source', 'transaction')
                ->where('reference_id', $transaction->id)
                ->delete();

            // Delete transaction (items will be cascade deleted)
            $transaction->delete();

            DB::commit();

            return redirect()->route('transactions.index')->with('success', 'Transaksi berhasil dibatalkan (void). Stok telah dikembalikan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan saat membatalkan transaksi: ' . $e->getMessage());
        }
    }
}
