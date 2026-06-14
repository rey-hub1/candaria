<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\FeatureFlag;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Setting;
use App\Models\Vendor;
use App\Notifications\NewOrderReceived;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{

    public function index(Request $request): Response
    {
        $orders = Order::with('vendor:id,name,logo')
            ->where('student_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(10);

        return Inertia::render('Student/Orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        abort_unless($order->student_id === $request->user()->id, 404);

        $order->load(['vendor:id,name,logo,phone', 'items.options', 'statusHistories' => fn ($q) => $q->orderBy('created_at')]);

        return Inertia::render('Student/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function store(Request $request, OrderService $orderService): RedirectResponse
    {
        $validated = $request->validate([
            'vendor_id' => ['required', 'exists:vendors,id'],
            'delivery_slot' => ['required', 'in:09:00,12:00'],
            'payment_method' => ['required', 'in:cash,qris'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_item_id' => ['required', 'exists:menu_items,id'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:50'],
            'items.*.notes' => ['nullable', 'string', 'max:255'],
            'items.*.option_ids' => ['nullable', 'array'],
            'items.*.option_ids.*' => ['integer', 'exists:menu_options,id'],
        ]);

        $order = $orderService->createOrder($validated, $request->user());

        $order->vendor->user?->notify(new NewOrderReceived($order));

        return redirect()->route('student.orders.show', $order)->with('success', "Pesanan {$order->order_code} berhasil dibuat.");
    }

    public function cancel(Request $request, Order $order): RedirectResponse
    {
        abort_unless($order->student_id === $request->user()->id, 404);

        if ($order->status !== 'pending') {
            return redirect()->back()->with('error', 'Pesanan tidak bisa dibatalkan karena sudah diproses mitra.');
        }

        $order->update([
            'status' => 'cancelled',
            'cancelled_reason' => 'Dibatalkan oleh siswa.',
        ]);

        return redirect()->back()->with('success', 'Pesanan dibatalkan.');
    }

}
