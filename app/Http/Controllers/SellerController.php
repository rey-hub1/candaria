<?php

namespace App\Http\Controllers;

use App\Models\Seller;
use Illuminate\Http\Request;

class SellerController extends Controller
{
    public function index()
    {
        $sellers = Seller::withCount('products')->get();
        return view('sellers.index', compact('sellers'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'class' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        Seller::create([
            'name' => $request->name,
            'class' => $request->class,
            'phone' => $request->phone,
            'is_active' => true,
        ]);

        return redirect()->route('sellers.index')->with('success', 'Penitip baru berhasil didaftarkan.');
    }

    public function update(Request $request, Seller $seller)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'class' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'required|boolean',
        ]);

        $seller->update($request->only('name', 'class', 'phone', 'is_active'));

        return redirect()->route('sellers.index')->with('success', 'Data penitip berhasil diubah.');
    }

    public function destroy(Seller $seller)
    {
        if ($seller->products()->count() > 0) {
            return redirect()->route('sellers.index')->with('error', 'Penitip tidak bisa dihapus karena masih memiliki produk titipan.');
        }

        $seller->delete();
        return redirect()->route('sellers.index')->with('success', 'Data penitip berhasil dihapus.');
    }
}
