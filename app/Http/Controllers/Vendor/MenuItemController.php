<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MenuItemController extends Controller
{
    public function index(Request $request)
    {
        $vendor = $request->user()->vendor;

        $menuItems = $vendor->menuItems()
            ->with('optionGroups.options')
            ->orderBy('name')
            ->get();

        return Inertia::render('Vendor/Menu/Index', [
            'menuItems' => $menuItems,
        ]);
    }

    public function store(Request $request)
    {
        $vendor = $request->user()->vendor;

        $data = $this->validatePayload($request);

        DB::transaction(function () use ($vendor, $request, $data) {
            $menuItem = $vendor->menuItems()->create($data['menu']);

            if ($request->hasFile('image')) {
                $menuItem->update(['image' => $request->file('image')->store('menu-items', 'public')]);
            }

            $this->syncOptionGroups($menuItem, $data['option_groups']);
        });

        return back()->with('success', 'Menu berhasil ditambahkan.');
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $this->authorizeOwner($request, $menuItem);

        $data = $this->validatePayload($request);

        DB::transaction(function () use ($menuItem, $request, $data) {
            $menuItem->update($data['menu']);

            if ($request->hasFile('image')) {
                $menuItem->update(['image' => $request->file('image')->store('menu-items', 'public')]);
            }

            $this->syncOptionGroups($menuItem, $data['option_groups']);
        });

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
        if ($request->has('option_groups')) {
            $groups = collect($request->input('option_groups'))->map(function ($group) {
                if (($group['max_select'] ?? null) === '') {
                    $group['max_select'] = null;
                }

                return $group;
            })->all();

            $request->merge(['option_groups' => $groups]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:100',
            'is_active' => 'sometimes|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'option_groups' => 'nullable|array',
            'option_groups.*.name' => 'required_with:option_groups|string|max:255',
            'option_groups.*.type' => 'required_with:option_groups|in:single,multiple',
            'option_groups.*.is_required' => 'sometimes|boolean',
            'option_groups.*.min_select' => 'nullable|integer|min:0',
            'option_groups.*.max_select' => 'nullable|integer|min:0',
            'option_groups.*.options' => 'required_with:option_groups|array|min:1',
            'option_groups.*.options.*.name' => 'required|string|max:255',
            'option_groups.*.options.*.price_delta' => 'nullable|numeric',
            'option_groups.*.options.*.is_default' => 'sometimes|boolean',
        ]);

        return [
            'menu' => [
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'category' => $validated['category'] ?? null,
                'is_active' => $request->boolean('is_active', true),
            ],
            'option_groups' => $validated['option_groups'] ?? [],
        ];
    }

    private function syncOptionGroups(MenuItem $menuItem, array $optionGroups): void
    {
        $menuItem->optionGroups()->delete();

        foreach ($optionGroups as $i => $group) {
            $optionGroup = $menuItem->optionGroups()->create([
                'name' => $group['name'],
                'type' => $group['type'],
                'is_required' => (bool) ($group['is_required'] ?? false),
                'min_select' => $group['min_select'] ?? 0,
                'max_select' => $group['max_select'] ?? null,
                'sort_order' => $i,
            ]);

            foreach ($group['options'] as $j => $option) {
                $optionGroup->options()->create([
                    'name' => $option['name'],
                    'price_delta' => $option['price_delta'] ?? 0,
                    'is_default' => (bool) ($option['is_default'] ?? false),
                    'sort_order' => $j,
                ]);
            }
        }
    }
}
