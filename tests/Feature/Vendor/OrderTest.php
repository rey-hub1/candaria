<?php

use App\Models\Order;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Support\Facades\Notification;
use App\Notifications\OrderStatusUpdated;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->vendorUser = User::factory()->create(['role' => 'vendor']);
    $this->vendor = Vendor::factory()->create(['user_id' => $this->vendorUser->id]);
    
    $this->studentUser = User::factory()->create(['role' => 'student']);
});

// ─── INDEX: VENDOR ORDER LIST ────────────────────────────────────────────────

test('vendor can view their own orders', function () {
    // Order for this vendor
    Order::factory()->count(2)->create([
        'vendor_id' => $this->vendor->id,
        'student_id' => $this->studentUser->id,
        'delivery_date' => now()->toDateString()
    ]);
    
    // Order for other vendor
    $otherVendor = Vendor::factory()->create();
    Order::factory()->create([
        'vendor_id' => $otherVendor->id,
        'student_id' => $this->studentUser->id,
        'delivery_date' => now()->toDateString()
    ]);

    $this->actingAs($this->vendorUser)
        ->get(route('vendor.orders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Vendor/Orders/Index')
            ->has('orders', 2) // Should only see their own 2 orders
            ->has('filters')
        );
});

// ─── UPDATE STATUS: STATE MACHINE ────────────────────────────────────────────

test('vendor can update order status sequentially', function () {
    Notification::fake();

    $order = Order::factory()->create([
        'vendor_id' => $this->vendor->id,
        'student_id' => $this->studentUser->id,
        'status' => 'pending',
        'total' => 15000
    ]);

    // Pending -> Confirmed
    $this->actingAs($this->vendorUser)
        ->put(route('vendor.orders.updateStatus', $order), ['status' => 'confirmed'])
        ->assertRedirect()
        ->assertSessionHas('success');
        
    expect($order->fresh()->status)->toBe('confirmed');

    // Confirmed -> Preparing
    $this->put(route('vendor.orders.updateStatus', $order), ['status' => 'preparing'])
         ->assertRedirect();
    expect($order->fresh()->status)->toBe('preparing');

    // Preparing -> Ready
    $this->put(route('vendor.orders.updateStatus', $order), ['status' => 'ready'])
         ->assertRedirect();
    expect($order->fresh()->status)->toBe('ready');

    // Notification should be sent to student at least once (for state changes)
    Notification::assertSentTo(
        [$this->studentUser],
        OrderStatusUpdated::class
    );
});

test('vendor cannot skip order status states', function () {
    $order = Order::factory()->create([
        'vendor_id' => $this->vendor->id,
        'student_id' => $this->studentUser->id,
        'status' => 'pending' // Cannot jump straight to ready/delivered
    ]);

    $this->actingAs($this->vendorUser)
        ->put(route('vendor.orders.updateStatus', $order), ['status' => 'delivered'])
        ->assertSessionHasErrors('status');

    expect($order->fresh()->status)->toBe('pending'); // Unchanged
});

test('vendor cannot update other vendors order', function () {
    $otherVendor = Vendor::factory()->create();
    $order = Order::factory()->create([
        'vendor_id' => $otherVendor->id,
        'status' => 'pending'
    ]);

    $this->actingAs($this->vendorUser)
        ->put(route('vendor.orders.updateStatus', $order), ['status' => 'confirmed'])
        ->assertNotFound(); // 404
});

test('delivered status credits vendor wallet', function () {
    $order = Order::factory()->create([
        'vendor_id' => $this->vendor->id,
        'student_id' => $this->studentUser->id,
        'status' => 'ready', // ready -> delivered is allowed
        'total' => 20000,
        'order_code' => 'ORD-123'
    ]);

    $this->actingAs($this->vendorUser)
        ->put(route('vendor.orders.updateStatus', $order), ['status' => 'delivered'])
        ->assertRedirect()
        ->assertSessionHas('success');

    // Assert wallet balance updated
    $this->assertDatabaseHas('vendor_ledgers', [
        'vendor_id' => $this->vendor->id,
        'type' => 'credit',
        'amount' => 20000,
        'description' => 'Pesanan ORD-123'
    ]);
    
    expect((float) $this->vendor->fresh()->balance)->toEqual(20000.0);
});

test('vendor can cancel order with reason', function () {
    $order = Order::factory()->create([
        'vendor_id' => $this->vendor->id,
        'student_id' => $this->studentUser->id,
        'status' => 'pending',
    ]);

    $this->actingAs($this->vendorUser)
        ->put(route('vendor.orders.updateStatus', $order), [
            'status' => 'cancelled',
            'cancelled_reason' => 'Bahan habis'
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'status' => 'cancelled',
        'cancelled_reason' => 'Bahan habis'
    ]);
});
