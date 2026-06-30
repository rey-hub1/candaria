<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Notifications\OrderStatusUpdated;
use App\Services\VendorWalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    private const TRANSITIONS = [
        'pending' => ['confirmed', 'cancelled'],
        'confirmed' => ['preparing', 'cancelled'],
        'preparing' => ['ready', 'cancelled'],
        'ready' => ['delivered', 'cancelled'],
        'delivered' => [],
        'cancelled' => [],
    ];

    public function index(Request $request): Response
    {
        $vendor = $request->user()->vendor;

        $date = $request->input('date', now()->toDateString());

        $orders = Order::with('items', 'student:id,name')
            ->where('vendor_id', $vendor->id)
            ->whereDate('delivery_date', $date)
            ->when($request->input('slot'), fn ($q, $slot) => $q->where('delivery_slot', $slot))
            ->when($request->input('status'), fn ($q, $status) => $q->where('status', $status))
            ->orderBy('delivery_slot')
            ->orderBy('created_at')
            ->get();

        return Inertia::render('Vendor/Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'date' => $date,
                'slot' => $request->input('slot', ''),
                'status' => $request->input('status', ''),
            ],
        ]);
    }

    public function updateStatus(Request $request, Order $order, VendorWalletService $wallet): RedirectResponse
    {
        $vendor = $request->user()->vendor;
        abort_unless($order->vendor_id === $vendor->id, 404);

        $validated = $request->validate([
            'status' => ['required', 'in:confirmed,preparing,ready,delivered,cancelled'],
            'cancelled_reason' => ['required_if:status,cancelled', 'nullable', 'string', 'max:255'],
        ]);

        // Status update + credit wallet harus atomik dan terkunci, supaya dua request
        // "delivered" yang bersamaan tidak menggandakan saldo vendor.
        DB::transaction(function () use ($order, $validated, $wallet, $vendor) {
            $locked = Order::lockForUpdate()->findOrFail($order->id);

            $allowed = self::TRANSITIONS[$locked->status] ?? [];

            if (! in_array($validated['status'], $allowed, true)) {
                throw ValidationException::withMessages(['status' => "Tidak bisa ubah status dari \"{$locked->status}\" ke \"{$validated['status']}\"."]);
            }

            $locked->update([
                'status' => $validated['status'],
                'cancelled_reason' => $validated['status'] === 'cancelled' ? $validated['cancelled_reason'] : $locked->cancelled_reason,
            ]);

            if ($validated['status'] === 'delivered') {
                $wallet->credit($vendor, (float) $locked->total, $locked, "Pesanan {$locked->order_code}");

                // Order cash dibayar tunai saat serah-terima → tandai lunas.
                if ($locked->payment_method === 'cash') {
                    $locked->update(['payment_status' => 'paid']);
                }
            }

            $order->setRawAttributes($locked->getAttributes());
        });

        $order->student->notify(new OrderStatusUpdated($order));

        return redirect()->back()->with('success', "Status pesanan {$order->order_code} diperbarui.");
    }
}
