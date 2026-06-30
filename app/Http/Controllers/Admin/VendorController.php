<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class VendorController extends Controller
{
    public function index()
    {
        $filters = request()->only(['search', 'sort', 'dir']);

        $vendors = Vendor::with('user:id,name,email,phone')
            ->withCount('menuItems')
            ->filter($filters, ['name', 'category', 'phone'])
            ->paginate(15)->withQueryString();

        return Inertia::render('Admin/Vendors/Index', [
            'vendors' => $vendors,
            'filters' => $filters,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'owner_email' => 'required|email|unique:users,email',
            'owner_password' => ['required', 'string', Password::defaults()],
        ]);

        $owner = User::create([
            'name' => $request->name,
            'email' => $request->owner_email,
            'password' => Hash::make($request->owner_password),
            'role' => 'vendor',
        ]);

        Vendor::create([
            'user_id' => $owner->id,
            'name' => $request->name,
            'category' => $request->category,
            'phone' => $request->phone,
            'address' => $request->address,
            'description' => $request->description,
            'status' => 'active',
            'joined_at' => now(),
        ]);

        return redirect()->route('admin.vendors.index')->with('success', 'Mitra baru berhasil ditambahkan.');
    }

    public function update(Request $request, Vendor $vendor)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,active,suspended',
        ]);

        $vendor->update($request->only('name', 'category', 'phone', 'address', 'description', 'status'));

        if ($vendor->user) {
            $vendor->user->update(['name' => $request->name]);
        }

        return redirect()->route('admin.vendors.index')->with('success', 'Data mitra berhasil diperbarui.');
    }

    public function destroy(Vendor $vendor)
    {
        if ($vendor->menuItems()->count() > 0) {
            return redirect()->route('admin.vendors.index')->with('error', 'Mitra tidak bisa dihapus karena masih memiliki menu.');
        }

        $vendor->delete();

        return redirect()->route('admin.vendors.index')->with('success', 'Mitra berhasil dihapus.');
    }
}
