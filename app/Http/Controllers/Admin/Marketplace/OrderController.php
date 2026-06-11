<?php

namespace App\Http\Controllers\Admin\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->input('date', now()->toDateString());

        $orders = Order::with('vendor:id,name', 'student:id,name')
            ->whereDate('delivery_date', $date)
            ->when($request->input('vendor_id'), fn ($q, $vendorId) => $q->where('vendor_id', $vendorId))
            ->when($request->input('status'), fn ($q, $status) => $q->where('status', $status))
            ->orderBy('delivery_slot')
            ->orderBy('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Marketplace/Orders', [
            'orders' => $orders,
            'vendors' => Vendor::orderBy('name')->get(['id', 'name']),
            'filters' => [
                'date' => $date,
                'vendor_id' => $request->input('vendor_id', ''),
                'status' => $request->input('status', ''),
            ],
        ]);
    }
}
