<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Notifications\OrderStatusUpdated;
use App\Services\VendorWalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        $orders = Order::with('items.options', 'student:id,name')
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

        $allowed = self::TRANSITIONS[$order->status] ?? [];

        if (! in_array($validated['status'], $allowed, true)) {
            throw ValidationException::withMessages(['status' => "Tidak bisa ubah status dari \"{$order->status}\" ke \"{$validated['status']}\"."]);
        }

        $order->update([
            'status' => $validated['status'],
            'cancelled_reason' => $validated['status'] === 'cancelled' ? $validated['cancelled_reason'] : $order->cancelled_reason,
        ]);

        if ($validated['status'] === 'delivered') {
            $wallet->credit($vendor, (float) $order->total, $order, "Pesanan {$order->order_code}");
        }

        $order->student->notify(new OrderStatusUpdated($order));

        return redirect()->back()->with('success', "Status pesanan {$order->order_code} diperbarui.");
    }
}
