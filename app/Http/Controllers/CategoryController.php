<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $filters = request()->only(['search', 'sort', 'dir']);
        $categories = Category::withCount('products')->filter($filters, ['name', 'slug'])->paginate(15)->withQueryString();
        return Inertia::render('Categories/Index', ['categories' => $categories, 'filters' => $filters]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'prefix' => 'nullable|string|max:5',
        ]);

        $prefix = $request->prefix ?: strtoupper(substr($request->name, 0, 1));

        Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'prefix' => $prefix,
        ]);

        return redirect()->route('categories.index')->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'prefix' => 'nullable|string|max:5',
        ]);

        $prefix = $request->prefix ?: strtoupper(substr($request->name, 0, 1));

        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'prefix' => $prefix,
        ]);

        return redirect()->route('categories.index')->with('success', 'Kategori berhasil diubah.');
    }

    public function destroy(Category $category)
    {
        if ($category->products()->count() > 0) {
            return redirect()->route('categories.index')->with('error', 'Kategori tidak bisa dihapus karena masih memiliki produk.');
        }

        $category->delete();
        return redirect()->route('categories.index')->with('success', 'Kategori berhasil dihapus.');
    }
}
