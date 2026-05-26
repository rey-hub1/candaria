<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Seller;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'seller'])->get();
        $categories = Category::all();
        $sellers = Seller::where('is_active', true)->get();
        return view('products.index', compact('products', 'categories', 'sellers'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:products,code',
            'category_id' => 'required|exists:categories,id',
            'type' => 'required|in:kantin,siswa',
            'cost_price' => 'required|numeric|min:0',
            'selling_price' => 'required_if:type,kantin|nullable|numeric|min:0',
            'seller_id' => 'required_if:type,siswa|nullable|exists:sellers,id',
            'stock' => 'required|integer|min:0',
        ]);

        $data = $request->only('name', 'code', 'category_id', 'type', 'cost_price', 'stock');

        if ($request->type === 'kantin') {
            $data['selling_price'] = $request->selling_price;
            $data['seller_id'] = null;
        } else {
            // For siswa, Product model boot saving logic automatically sets: selling_price = cost_price + 500
            $data['seller_id'] = $request->seller_id;
            $data['selling_price'] = $request->cost_price + 500;
        }

        Product::create($data);

        return redirect()->route('products.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:products,code,' . $product->id,
            'category_id' => 'required|exists:categories,id',
            'type' => 'required|in:kantin,siswa',
            'cost_price' => 'required|numeric|min:0',
            'selling_price' => 'required_if:type,kantin|nullable|numeric|min:0',
            'seller_id' => 'required_if:type,siswa|nullable|exists:sellers,id',
            'stock' => 'required|integer|min:0',
        ]);

        $data = $request->only('name', 'code', 'category_id', 'type', 'cost_price', 'stock');

        if ($request->type === 'kantin') {
            $data['selling_price'] = $request->selling_price;
            $data['seller_id'] = null;
        } else {
            $data['seller_id'] = $request->seller_id;
            $data['selling_price'] = $request->cost_price + 500;
        }

        $product->update($data);

        return redirect()->route('products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        // Check if there are transactions with this product
        if ($product->transactionItems()->count() > 0) {
            return redirect()->route('products.index')->with('error', 'Produk tidak bisa dihapus karena sudah memiliki riwayat transaksi.');
        }

        $product->delete();
        return redirect()->route('products.index')->with('success', 'Produk berhasil dihapus.');
    }
}
