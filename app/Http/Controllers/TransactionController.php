<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    // List all transactions (for reports/history)
    public function index()
    {
        $transactions = Transaction::with(['user', 'items.product'])
            ->latest()
            ->paginate(15);
        return view('transactions.index', compact('transactions'));
    }

    // Cashier interface
    public function create(Request $request)
    {
        $search = $request->input('search');
        
        $productsQuery = Product::query()->where('stock', '>', 0);
        
        if ($search) {
            $productsQuery->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }
        
        $products = $productsQuery->with(['category', 'seller'])->take(12)->get();
        $cart = session()->get('cart', []);
        
        // Calculate totals
        $totalAmount = 0;
        foreach ($cart as $id => $item) {
            $totalAmount += $item['selling_price'] * $item['quantity'];
        }

        return view('transactions.create', compact('products', 'cart', 'totalAmount', 'search'));
    }

    // Add product to cart
    public function addToCart(Request $request)
    {
        $productId = $request->input('product_id');
        $quantity = $request->input('quantity', 1);

        $product = Product::findOrFail($productId);

        if ($product->stock < $quantity) {
            return redirect()->back()->with('error', 'Stok tidak mencukupi.');
        }

        $cart = session()->get('cart', []);

        // If product already in cart, increment quantity if stock allows
        if (isset($cart[$productId])) {
            $newQty = $cart[$productId]['quantity'] + $quantity;
            if ($product->stock < $newQty) {
                return redirect()->back()->with('error', 'Stok tidak mencukupi untuk jumlah tersebut.');
            }
            $cart[$productId]['quantity'] = $newQty;
        } else {
            $cart[$productId] = [
                'name' => $product->name,
                'code' => $product->code,
                'type' => $product->type,
                'cost_price' => $product->cost_price,
                'selling_price' => $product->selling_price,
                'quantity' => $quantity,
                'stock' => $product->stock
            ];
        }

        session()->put('cart', $cart);

        return redirect()->back()->with('success', 'Produk ditambahkan ke keranjang.');
    }

    // Update cart quantity
    public function updateCart(Request $request)
    {
        $productId = $request->input('product_id');
        $quantity = $request->input('quantity');

        if ($quantity <= 0) {
            return $this->removeFromCart($productId);
        }

        $product = Product::findOrFail($productId);
        if ($product->stock < $quantity) {
            return redirect()->back()->with('error', "Stok hanya tersedia {$product->stock} pcs.");
        }

        $cart = session()->get('cart', []);
        if (isset($cart[$productId])) {
            $cart[$productId]['quantity'] = $quantity;
            session()->put('cart', $cart);
        }

        return redirect()->back()->with('success', 'Keranjang diperbarui.');
    }

    // Remove item from cart
    public function removeFromCart($productId)
    {
        $cart = session()->get('cart', []);
        if (isset($cart[$productId])) {
            unset($cart[$productId]);
            session()->put('cart', $cart);
        }
        return redirect()->back()->with('success', 'Produk dihapus dari keranjang.');
    }

    // Clear cart
    public function clearCart()
    {
        session()->forget('cart');
        return redirect()->back()->with('success', 'Keranjang dikosongkan.');
    }

    // Checkout / Store Transaction
    public function checkout(Request $request)
    {
        $cart = session()->get('cart', []);
        if (empty($cart)) {
            return redirect()->back()->with('error', 'Keranjang kosong.');
        }

        $request->validate([
            'paid_amount' => 'required|numeric|min:0',
        ]);

        $totalAmount = 0;
        foreach ($cart as $id => $item) {
            $totalAmount += $item['selling_price'] * $item['quantity'];
        }

        $paidAmount = $request->input('paid_amount');
        if ($paidAmount < $totalAmount) {
            return redirect()->back()->with('error', 'Uang bayar kurang dari total belanja.');
        }

        $changeAmount = $paidAmount - $totalAmount;

        try {
            DB::beginTransaction();

            // Generate sequential transaction code (e.g., 001, 002)
            $latest = Transaction::orderBy('transaction_code', 'desc')->first();
            $nextNumber = $latest && preg_match('/^(\d{3,})$/', $latest->transaction_code) ? ((int)$latest->transaction_code) + 1 : 1;
            $transactionCode = str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
            // Ensure uniqueness (unlikely but double‑check)
            while (Transaction::where('transaction_code', $transactionCode)->exists()) {
                $nextNumber++;
                $transactionCode = str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
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
            foreach ($cart as $productId => $item) {
                $product = Product::lockForUpdate()->findOrFail($productId);

                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Stok produk {$product->name} tidak mencukupi.");
                }

                // Deduct stock
                $product->decrement('stock', $item['quantity']);

                // Calculate profits
                $qty = $item['quantity'];
                $costPrice = $item['cost_price'];
                $sellingPrice = $item['selling_price'];

                if ($item['type'] === 'siswa') {
                    $profitKantin = 500 * $qty;
                    $profitSeller = $costPrice * $qty; // uang untuk siswa
                } else {
                    $profitKantin = ($sellingPrice - $costPrice) * $qty;
                    $profitSeller = 0;
                }

                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $productId,
                    'quantity' => $qty,
                    'cost_price' => $costPrice,
                    'selling_price' => $sellingPrice,
                    'profit_kantin' => $profitKantin,
                    'profit_seller' => $profitSeller,
                    'seller_settlement_id' => null, // unpaid by default
                ]);
            }

            DB::commit();
            session()->forget('cart');

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
        return view('transactions.show', compact('transaction'));
    }
}
