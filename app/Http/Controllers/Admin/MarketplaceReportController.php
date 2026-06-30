<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MarketplaceReportController extends Controller
{
    public function sales(Request $request): Response
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Revenue hanya diakui untuk order yang benar-benar selesai (delivered).
        $sales = Order::join('vendors', 'vendors.id', '=', 'orders.vendor_id')
            ->where('orders.status', 'delivered')
            ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                return $q->whereBetween(DB::raw('DATE(orders.delivery_date)'), [$startDate, $endDate]);
            })
            ->groupBy('vendors.id', 'vendors.name')
            ->orderBy('vendors.name')
            ->get([
                'vendors.id as vendor_id',
                'vendors.name as vendor_name',
                DB::raw('COUNT(orders.id) as order_count'),
                DB::raw('SUM(orders.total) as total_sales'),
            ]);

        return Inertia::render('Admin/Reports/MarketplaceSales', [
            'sales' => $sales,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'grandTotal' => $sales->sum('total_sales'),
        ]);
    }
}
