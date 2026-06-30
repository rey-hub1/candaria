<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $filters = request()->only(['search', 'sort', 'dir']);
        $users = User::whereIn('role', ['admin', 'cashier'])->filter($filters, ['name', 'email', 'role'])->paginate(15)->withQueryString();

        return Inertia::render('Users/Index', ['users' => $users, 'filters' => $filters]);
    }

    public function store(Request $request)
    {
        $isSuperAdmin = auth()->user()->role === 'super_admin';
        $allowedRoles = $isSuperAdmin ? 'in:admin,cashier' : 'in:cashier';

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['required', $allowedRoles],
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return redirect()->route('users.index')->with('success', 'User berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $isSuperAdmin = auth()->user()->role === 'super_admin';

        // Akun super_admin tidak dikelola lewat layar ini — cegah admin biasa
        // mengubah email/password atau menurunkan role super_admin via PUT langsung.
        abort_if($user->role === 'super_admin', 403, 'Akun Super Admin tidak dapat diubah dari sini.');

        if (! $isSuperAdmin && $user->role === 'admin') {
            abort(403, 'Hanya Super Admin yang dapat mengubah akun Admin.');
        }

        $allowedRoles = $isSuperAdmin ? 'in:admin,cashier' : 'in:cashier';

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'role' => ['required', $allowedRoles],
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return redirect()->route('users.index')->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        abort_if($user->role === 'super_admin', 403, 'Akun Super Admin tidak dapat dihapus dari sini.');

        if ($user->role === 'admin' && auth()->user()->role !== 'super_admin') {
            return redirect()->route('users.index')->with('error', 'Hanya Super Admin yang dapat menghapus akun Admin.');
        }

        if (User::count() <= 1) {
            return redirect()->route('users.index')->with('error', 'Tidak dapat menghapus user terakhir.');
        }

        if ($user->transactions()->count() > 0) {
            return redirect()->route('users.index')->with('error', 'User ini tidak dapat dihapus karena sudah memiliki riwayat transaksi kasir.');
        }

        if ($user->id === auth()->id()) {
            return redirect()->route('users.index')->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'User berhasil dihapus.');
    }
}
