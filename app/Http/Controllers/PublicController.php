<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\FeatureFlag;
use App\Models\Product;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class PublicController extends Controller
{
    // Landing page with popular products
    public function welcome()
    {
        // Wajah publik dimatikan → langsung ke login (root jangan dibikin 404).
        if (! FeatureFlag::enabled('public_menu')) {
            return redirect()->route('login');
        }

        $popularProducts = Product::with('category:id,name')
            ->select(['id', 'category_id', 'name', 'selling_price', 'stock', 'image', 'code'])
            ->where('stock', '>', 0)
            ->withSum('transactionItems', 'quantity')
            ->orderByDesc('transaction_items_sum_quantity')
            ->take(8)
            ->get();

        return Inertia::render('Welcome', [
            'popularProducts' => $popularProducts,
            'menuCount' => Product::where('stock', '>', 0)->count(),
            'minPrice' => (int) Product::where('stock', '>', 0)->min('selling_price'),
            'canLogin' => Route::has('login'),
        ]);
    }

    // Public catalog. Client-side search/sort over a column-trimmed list —
    // appropriate for a canteen's catalog size and gives instant filtering.
    public function menu()
    {
        $products = Product::with('category:id,name')
            ->select(['id', 'category_id', 'name', 'selling_price', 'stock', 'image', 'code', 'type'])
            ->withSum('transactionItems', 'quantity')
            ->orderBy('name')
            ->get();

        $categories = Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Menu', [
            'products' => $products,
            'categories' => $categories,
            'canLogin' => Route::has('login'),
        ]);
    }
}
