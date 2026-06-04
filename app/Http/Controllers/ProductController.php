<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $filters = request()->only(['search', 'seller_search', 'sort', 'dir']);
        $query = Product::with(['category', 'seller'])->filter($filters, ['name', 'code', 'type', 'category.name']);
        
        if (!empty($filters['seller_search'])) {
            $query->whereHas('seller', function($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['seller_search'] . '%');
            });
        }
        
        $products = $query->paginate(15)->withQueryString();
        $categories = Category::all();
        $sellers = Seller::where('is_active', true)->get();
        return Inertia::render('Products/Index', ['products' => $products, 'categories' => $categories, 'sellers' => $sellers, 'filters' => $filters]);
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $data = $request->only('name', 'code', 'category_id', 'type', 'cost_price', 'stock');

        if ($request->type === 'kantin') {
            $data['selling_price'] = $request->selling_price;
            $data['seller_id'] = null;
        } else {
            $data['seller_id'] = $request->seller_id;
            // selling_price will be automatically calculated by Product model boot saving logic
        }

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $data = $request->only('name', 'code', 'category_id', 'type', 'cost_price', 'stock');

        if ($request->type === 'kantin') {
            $data['selling_price'] = $request->selling_price;
            $data['seller_id'] = null;
        } else {
            $data['seller_id'] = $request->seller_id;
            // selling_price will be automatically calculated by Product model boot saving logic
        }
        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
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

    public function forceIncrement(Product $product)
    {
        $product->increment('stock', 1);
        return redirect()->back()->with('success', "Stok {$product->name} berhasil ditambah 1 secara paksa.");
    }
}
