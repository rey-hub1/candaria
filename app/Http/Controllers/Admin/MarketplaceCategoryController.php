<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MarketplaceCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MarketplaceCategoryController extends Controller
{
    private const TYPES = ['vendor', 'menu'];

    public function index()
    {
        $categories = MarketplaceCategory::ordered()->get()->groupBy('type');

        return Inertia::render('Admin/MarketplaceCategories/Index', [
            'vendorCategories' => $categories->get('vendor', collect())->values(),
            'menuCategories' => $categories->get('menu', collect())->values(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);

        MarketplaceCategory::create($data);

        return back()->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(Request $request, MarketplaceCategory $marketplaceCategory)
    {
        $data = $this->validatePayload($request, $marketplaceCategory);

        $marketplaceCategory->update($data);

        return back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(MarketplaceCategory $marketplaceCategory)
    {
        $marketplaceCategory->delete();

        return back()->with('success', 'Kategori berhasil dihapus.');
    }

    private function validatePayload(Request $request, ?MarketplaceCategory $category = null): array
    {
        return $request->validate([
            'type' => ['required', Rule::in(self::TYPES)],
            'name' => [
                'required', 'string', 'max:100',
                Rule::unique('marketplace_categories', 'name')
                    ->where('type', $request->input('type'))
                    ->ignore($category?->id),
            ],
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);
    }
}
