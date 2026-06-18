<?php

namespace App\Http\Controllers;

use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

use Inertia\Inertia;

class SellerController extends Controller
{
    public function index()
    {
        $filters = request()->only(['search', 'sort', 'dir']);
        $sellers = Seller::withCount('products')->filter($filters, ['name', 'phone', 'class'])->paginate(15)->withQueryString();
        return Inertia::render('Sellers/Index', ['sellers' => $sellers, 'filters' => $filters]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'class' => 'nullable|string|max:100',
            'phone' => ['nullable', 'string', 'max:20', 'unique:sellers,phone'],
        ], [
            'phone.unique' => 'Nomor telepon ini sudah dipakai penitip lain.',
        ]);

        $seller = Seller::create([
            'name' => $request->name,
            'class' => $request->class,
            'phone' => $request->phone,
            'is_active' => true,
        ]);

        if ($request->phone) {
            \App\Models\User::firstOrCreate(
                ['phone' => $request->phone],
                [
                    'name' => $request->name,
                    'password' => \Illuminate\Support\Facades\Hash::make('candaria123'),
                    'role' => 'penitip',
                    'must_change_password' => true,
                ]
            );
        }

        return redirect()->route('sellers.index')->with('success', 'Penitip baru berhasil didaftarkan.');
    }

    public function update(Request $request, Seller $seller)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'class' => 'nullable|string|max:100',
            'phone' => ['nullable', 'string', 'max:20', Rule::unique('sellers', 'phone')->ignore($seller->id)],
            'is_active' => 'required|boolean',
        ], [
            'phone.unique' => 'Nomor telepon ini sudah dipakai penitip lain.',
        ]);

        $oldPhone = $seller->phone;

        $seller->update($request->only('name', 'class', 'phone', 'is_active'));

        if ($request->phone) {
            $user = \App\Models\User::where('phone', $oldPhone ?: $request->phone)->first();
            if ($user) {
                $user->update([
                    'name' => $request->name,
                    'phone' => $request->phone,
                ]);
            } else {
                \App\Models\User::create([
                    'name' => $request->name,
                    'phone' => $request->phone,
                    'password' => \Illuminate\Support\Facades\Hash::make('candaria123'),
                    'role' => 'penitip',
                    'must_change_password' => true,
                ]);
            }
        }

        return redirect()->route('sellers.index')->with('success', 'Data penitip berhasil diubah.');
    }

    public function destroy(Seller $seller)
    {
        if ($seller->products()->count() > 0) {
            return redirect()->route('sellers.index')->with('error', 'Penitip tidak bisa dihapus karena masih memiliki produk titipan.');
        }

        if (\App\Models\SellerSettlement::where('seller_id', $seller->id)->count() > 0) {
            return redirect()->route('sellers.index')->with('error', 'Penitip tidak bisa dihapus karena sudah memiliki riwayat pencairan/mutasi.');
        }

        $seller->delete();
        return redirect()->route('sellers.index')->with('success', 'Data penitip berhasil dihapus.');
    }
}
