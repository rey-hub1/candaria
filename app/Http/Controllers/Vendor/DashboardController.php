<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $vendor = $request->user()->vendor;

        return Inertia::render('Vendor/Dashboard', [
            'vendor' => $vendor,
            'stats' => [
                'menu_count' => $vendor ? $vendor->menuItems()->count() : 0,
                'active_menu_count' => $vendor ? $vendor->menuItems()->active()->count() : 0,
            ],
        ]);
    }

    public function profile(Request $request)
    {
        return Inertia::render('Vendor/Profile', [
            'vendor' => $request->user()->vendor,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $vendor = $request->user()->vendor;

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'is_open' => 'required|boolean',
            'max_orders_per_slot' => 'nullable|integer|min:1',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $data = $request->only('name', 'description', 'category', 'phone', 'address', 'is_open', 'max_orders_per_slot');

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('vendors', 'public');
        }

        $vendor->update($data);

        return back()->with('success', 'Profil toko berhasil diperbarui.');
    }
}
