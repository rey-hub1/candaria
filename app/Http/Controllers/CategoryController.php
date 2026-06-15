<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

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
        $request->merge(['prefix' => $this->resolvePrefix($request)]);

        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'prefix' => ['required', 'string', 'max:5', Rule::unique('categories', 'prefix')],
        ], [
            'prefix.unique' => 'Prefix ini sudah dipakai kategori lain. Pakai prefix berbeda.',
        ]);

        Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'prefix' => $request->prefix,
        ]);

        return redirect()->route('categories.index')->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(Request $request, Category $category)
    {
        $request->merge(['prefix' => $this->resolvePrefix($request)]);

        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'prefix' => ['required', 'string', 'max:5', Rule::unique('categories', 'prefix')->ignore($category->id)],
        ], [
            'prefix.unique' => 'Prefix ini sudah dipakai kategori lain. Pakai prefix berbeda.',
        ]);

        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'prefix' => $request->prefix,
        ]);

        return redirect()->route('categories.index')->with('success', 'Kategori berhasil diubah.');
    }

    /**
     * Prefix dari input (kalau diisi) atau huruf pertama nama, selalu UPPERCASE
     * agar pengecekan unik konsisten (mis. "mk" == "MK").
     */
    private function resolvePrefix(Request $request): string
    {
        $prefix = $request->prefix ?: substr((string) $request->name, 0, 1);

        return strtoupper(trim($prefix));
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
