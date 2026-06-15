<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $studentId = $request->user()->id;

        $activeStatuses = ['pending', 'confirmed', 'preparing', 'ready'];

        return Inertia::render('Student/Dashboard', [
            'student' => $request->user()->student,
            'recentOrders' => Order::with('vendor:id,name')
                ->where('student_id', $studentId)
                ->orderByDesc('created_at')
                ->take(3)
                ->get(['id', 'order_code', 'vendor_id', 'status', 'total', 'delivery_slot', 'created_at']),
            'activeOrderCount' => Order::where('student_id', $studentId)
                ->whereIn('status', $activeStatuses)
                ->count(),
        ]);
    }
}
