<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Seller;
use App\Models\Student;
use App\Models\Transaction;
use App\Models\Vendor;
use App\Services\DemoDataService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DemoDataController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('SuperAdmin/DemoData', [
            'currentLevel' => DemoDataService::currentLevel(),
            'counts' => [
                'products' => Product::count(),
                'sellers' => Seller::count(),
                'transactions' => Transaction::count(),
                'vendors' => Vendor::count(),
                'students' => Student::count(),
                'orders' => Order::count(),
            ],
        ]);
    }

    public function apply(Request $request, DemoDataService $service): RedirectResponse
    {
        $validated = $request->validate([
            'level' => ['required', 'in:'.implode(',', DemoDataService::LEVELS)],
        ]);

        $service->apply($validated['level']);

        $label = ['none' => 'kosong', 'minimal' => 'sedikit', 'full' => 'banyak', 'v1' => 'data asli v1'][$validated['level']];

        return redirect()->route('super-admin.demo-data.index')
            ->with('success', "Data demo berhasil diatur ke mode \"{$label}\".");
    }
}
