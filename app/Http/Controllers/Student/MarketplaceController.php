<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\FeatureFlag;
use App\Models\Setting;
use App\Models\Vendor;
use Inertia\Inertia;
use Inertia\Response;

class MarketplaceController extends Controller
{
    public function index(): Response
    {
        $vendors = Vendor::active()
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'logo', 'category', 'description', 'is_open']);

        return Inertia::render('Student/Marketplace/Index', [
            'vendors' => $vendors,
            'categories' => $vendors->pluck('category')->unique()->values(),
        ]);
    }

    public function show(Vendor $vendor): Response
    {
        abort_unless($vendor->status === 'active', 404);

        $vendor->load(['menuItems' => function ($query) {
            $query->active()->orderBy('category')->orderBy('name');
        }]);

        return Inertia::render('Student/Marketplace/VendorShow', [
            'vendor' => $vendor,
        ]);
    }

    public function checkout(): Response
    {
        return Inertia::render('Student/Marketplace/Checkout', [
            'slots' => [
                '09:00' => [
                    'enabled' => FeatureFlag::enabled('order_slot_09'),
                    'cutoff' => Setting::get('marketplace_cutoff_09', '08:00'),
                ],
                '12:00' => [
                    'enabled' => FeatureFlag::enabled('order_slot_12'),
                    'cutoff' => Setting::get('marketplace_cutoff_12', '10:30'),
                ],
            ],
            'now' => now()->format('H:i'),
            'paymentQrisEnabled' => FeatureFlag::enabled('payment_qris'),
        ]);
    }
}
