<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\MarketplaceCategory;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuItemController extends Controller
{
    public function index(Request $request)
    {
        $vendor = $request->user()->vendor;

        $menuItems = $vendor->menuItems()
            ->orderBy('name')
            ->get();

        return Inertia::render('Vendor/Menu/Index', [
            'menuItems' => $menuItems,
            'categories' => MarketplaceCategory::type('menu')->active()->ordered()->pluck('name'),
        ]);
    }

    public function store(Request $request)
    {
        $vendor = $request->user()->vendor;

        $data = $this->validatePayload($request);

        $menuItem = $vendor->menuItems()->create($data);

        if ($request->hasFile('image')) {
            $menuItem->update(['image' => $request->file('image')->store('menu-items', 'public')]);
        }

        return back()->with('success', 'Menu berhasil ditambahkan.');
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $this->authorizeOwner($request, $menuItem);

        $data = $this->validatePayload($request);

        $menuItem->update($data);

        if ($request->hasFile('image')) {
            $menuItem->update(['image' => $request->file('image')->store('menu-items', 'public')]);
        }

        return back()->with('success', 'Menu berhasil diperbarui.');
    }

    public function destroy(Request $request, MenuItem $menuItem)
    {
        $this->authorizeOwner($request, $menuItem);

        $menuItem->delete();

        return back()->with('success', 'Menu berhasil dihapus.');
    }

    public function toggleActive(Request $request, MenuItem $menuItem)
    {
        $this->authorizeOwner($request, $menuItem);

        $menuItem->update(['is_active' => ! $menuItem->is_active]);

        return back()->with('success', $menuItem->is_active ? 'Menu diaktifkan.' : 'Menu dinonaktifkan.');
    }

    private function authorizeOwner(Request $request, MenuItem $menuItem): void
    {
        abort_unless($menuItem->vendor_id === $request->user()->vendor->id, 403);
    }

    private function validatePayload(Request $request): array
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:100',
            'is_active' => 'sometimes|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        return [
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'category' => $validated['category'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ];
    }
}
