<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Models\VendorSettlement;
use App\Services\VendorWalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorSettlementController extends Controller
{
    public function index(): Response
    {
        $vendors = Vendor::active()->orderBy('name')->get(['id', 'name', 'balance']);

        $settlements = VendorSettlement::with('vendor:id,name', 'creator:id,name')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/VendorSettlements/Index', [
            'vendors' => $vendors,
            'settlements' => $settlements,
        ]);
    }

    public function store(Request $request, VendorWalletService $wallet): RedirectResponse
    {
        $validated = $request->validate([
            'vendor_id' => ['required', 'exists:vendors,id'],
            'amount' => ['required', 'numeric', 'min:1'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $vendor = Vendor::findOrFail($validated['vendor_id']);

        if ($validated['amount'] > $vendor->balance) {
            return redirect()->back()->with('error', "Saldo {$vendor->name} tidak mencukupi.");
        }

        $wallet->debit($vendor, $validated['amount'], $validated['notes'] ?? "Pencairan saldo {$vendor->name}");

        VendorSettlement::create([
            'vendor_id' => $vendor->id,
            'amount' => $validated['amount'],
            'notes' => $validated['notes'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        return redirect()->back()->with('success', "Berhasil mencairkan saldo {$vendor->name}.");
    }
}
