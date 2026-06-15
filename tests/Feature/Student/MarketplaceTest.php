<?php

use App\Models\FeatureFlag;
use App\Models\MenuItem;
use App\Models\Setting;
use App\Models\User;
use App\Models\Vendor;
use Inertia\Testing\AssertableInertia as Assert;

use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    Cache::flush();
    $this->student = User::factory()->create(['role' => 'student']);
});

// ─── INDEX: VENDOR LISTING ───────────────────────────────────────────────────

test('student can access marketplace index page', function () {
    $vendor1 = Vendor::factory()->create(['status' => 'active', 'category' => 'Makanan Utama', 'name' => 'Warung A']);
    $vendor2 = Vendor::factory()->create(['status' => 'active', 'category' => 'Minuman', 'name' => 'Es B']);
    
    // Inactive vendors should not be shown
    Vendor::factory()->create(['status' => 'suspended']);

    $this->actingAs($this->student)
        ->get(route('student.marketplace.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Marketplace/Index')
            ->has('vendors', 2)
            ->has('categories', 2)
            ->where('vendors.0.name', 'Es B') // Should be sorted by name alphabetically
            ->where('vendors.1.name', 'Warung A')
        );
});

test('marketplace index redirects unauthenticated users', function () {
    $this->get(route('student.marketplace.index'))->assertRedirect(route('login'));
});

// ─── SHOW: VENDOR DETAILS & MENUS ────────────────────────────────────────────

test('student can view active vendor and its active menu items', function () {
    $vendor = Vendor::factory()->create(['status' => 'active']);
    
    $activeMenu = MenuItem::factory()->create(['vendor_id' => $vendor->id, 'is_active' => true]);
    $inactiveMenu = MenuItem::factory()->create(['vendor_id' => $vendor->id, 'is_active' => false]);

    $this->actingAs($this->student)
        ->get(route('student.marketplace.show', $vendor))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Marketplace/VendorShow')
            ->has('vendor.menu_items', 1)
            ->where('vendor.menu_items.0.id', $activeMenu->id)
        );
});

test('student cannot view inactive vendor', function () {
    $vendor = Vendor::factory()->create(['status' => 'suspended']);

    $this->actingAs($this->student)
        ->get(route('student.marketplace.show', $vendor))
        ->assertNotFound(); // 404
});

// ─── CHECKOUT PAGE ───────────────────────────────────────────────────────────

test('student can access checkout page with correct feature flags and settings', function () {
    // Setup Feature Flags
    FeatureFlag::updateOrCreate(['key' => 'marketplace'], ['is_enabled' => true, 'label' => 'Marketplace']);
    FeatureFlag::updateOrCreate(['key' => 'marketplace_orders'], ['is_enabled' => true, 'label' => 'Marketplace']);
    FeatureFlag::updateOrCreate(['key' => 'order_slot_09'], ['is_enabled' => true, 'label' => 'Slot']);
    FeatureFlag::updateOrCreate(['key' => 'order_slot_12'], ['is_enabled' => false, 'label' => 'Slot']);
    FeatureFlag::updateOrCreate(['key' => 'payment_qris'], ['is_enabled' => true, 'label' => 'QRIS']);

    // Setup Settings
    Setting::updateOrCreate(['key' => 'marketplace_cutoff_09'], ['value' => '08:30']);

    $this->actingAs($this->student)
        ->get(route('student.marketplace.checkout'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Marketplace/Checkout')
            ->where('slots.09:00.enabled', true)
            ->where('slots.09:00.cutoff', '08:30')
            ->where('slots.12:00.enabled', false)
            ->where('paymentQrisEnabled', true)
            ->has('now')
        );
});

test('checkout page validates role correctly', function () {
    FeatureFlag::updateOrCreate(['key' => 'marketplace'], ['is_enabled' => true, 'label' => 'Marketplace']);
    FeatureFlag::updateOrCreate(['key' => 'marketplace_orders'], ['is_enabled' => true, 'label' => 'Marketplace']);
    // Ensure only students can access marketplace checkout
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->get(route('student.marketplace.checkout'))
        ->assertForbidden(); // Assuming RoleMiddleware protects this route
});
