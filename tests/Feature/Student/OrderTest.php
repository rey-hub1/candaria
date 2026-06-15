<?php

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Support\Facades\Notification;
use App\Notifications\NewOrderReceived;
use Inertia\Testing\AssertableInertia as Assert;

use App\Models\FeatureFlag;
use Illuminate\Support\Carbon;

beforeEach(function () {
    Carbon::setTestNow('2026-06-15 07:00:00');
    FeatureFlag::updateOrCreate(['key' => 'order_slot_09'], ['is_enabled' => true, 'label' => 'Slot 09']);
    FeatureFlag::updateOrCreate(['key' => 'payment_qris'], ['is_enabled' => true, 'label' => 'QRIS']);

    $this->student = User::factory()->create(['role' => 'student']);
    $this->vendorUser = User::factory()->create(['role' => 'vendor']);
    $this->vendor = Vendor::factory()->create(['user_id' => $this->vendorUser->id, 'status' => 'active', 'is_open' => true]);
});

// ─── INDEX: LIST ORDERS ──────────────────────────────────────────────────────

test('student can view their own orders', function () {
    // Create order for this student
    Order::factory()->count(3)->create(['student_id' => $this->student->id]);
    
    // Create order for another student
    $otherStudent = User::factory()->create(['role' => 'student']);
    Order::factory()->create(['student_id' => $otherStudent->id]);

    $this->actingAs($this->student)
        ->get(route('student.orders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Orders/Index')
            ->has('orders.data', 3) // Paginated, should only see 3
        );
});

// ─── SHOW: ORDER DETAILS ─────────────────────────────────────────────────────

test('student can view detail of their own order', function () {
    $order = Order::factory()->create(['student_id' => $this->student->id, 'vendor_id' => $this->vendor->id]);
    OrderItem::factory()->create(['order_id' => $order->id]);

    $this->actingAs($this->student)
        ->get(route('student.orders.show', $order))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Orders/Show')
            ->has('order.items')
            ->where('order.id', $order->id)
        );
});

test('student cannot view other student order', function () {
    $otherStudent = User::factory()->create(['role' => 'student']);
    $order = Order::factory()->create(['student_id' => $otherStudent->id]);

    $this->actingAs($this->student)
        ->get(route('student.orders.show', $order))
        ->assertNotFound(); // 404
});

// ─── STORE: CREATE ORDER ─────────────────────────────────────────────────────

test('student can create an order successfully and it notifies vendor', function () {
    Notification::fake();

    $menuItem = MenuItem::factory()->create(['vendor_id' => $this->vendor->id, 'price' => 10000]);

    $payload = [
        'vendor_id' => $this->vendor->id,
        'delivery_slot' => '09:00',
        'payment_method' => 'cash',
        'notes' => 'Tolong pedas',
        'items' => [
            [
                'menu_item_id' => $menuItem->id,
                'qty' => 2,
                'notes' => 'Tidak pakai bawang'
            ]
        ]
    ];

    $response = $this->actingAs($this->student)->post(route('student.orders.store'), $payload);

    $order = Order::first();
    
    $response->assertRedirect(route('student.orders.show', $order))
             ->assertSessionHas('success');

    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'student_id' => $this->student->id,
        'vendor_id' => $this->vendor->id,
        'delivery_slot' => '09:00',
        'payment_method' => 'cash',
        'status' => 'pending'
    ]);

    $this->assertDatabaseHas('order_items', [
        'order_id' => $order->id,
        'menu_item_id' => $menuItem->id,
        'qty' => 2,
        'notes' => 'Tidak pakai bawang'
    ]);

    Notification::assertSentTo(
        [$this->vendorUser],
        NewOrderReceived::class,
        fn ($notification) => $notification->order->id === $order->id
    );
});

test('store order fails if validation is incomplete', function () {
    $payload = [
        'vendor_id' => $this->vendor->id,
        // Missing delivery_slot, items, etc.
    ];

    $this->actingAs($this->student)
        ->post(route('student.orders.store'), $payload)
        ->assertSessionHasErrors(['delivery_slot', 'payment_method', 'items']);
    
    $this->assertDatabaseCount('orders', 0);
});

// ─── CANCEL: ABORT ORDER ─────────────────────────────────────────────────────

test('student can cancel a pending order', function () {
    $order = Order::factory()->create([
        'student_id' => $this->student->id, 
        'status' => 'pending'
    ]);

    $this->actingAs($this->student)
        ->post(route('student.orders.cancel', $order))
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'status' => 'cancelled',
        'cancelled_reason' => 'Dibatalkan oleh siswa.'
    ]);
});

test('student cannot cancel an order that is already processed', function () {
    $order = Order::factory()->create([
        'student_id' => $this->student->id, 
        'status' => 'processing' // Not pending
    ]);

    $this->actingAs($this->student)
        ->post(route('student.orders.cancel', $order))
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'status' => 'processing' // Should remain processing
    ]);
});

test('student cannot cancel another student order', function () {
    $otherStudent = User::factory()->create(['role' => 'student']);
    $order = Order::factory()->create([
        'student_id' => $otherStudent->id, 
        'status' => 'pending'
    ]);

    $this->actingAs($this->student)
        ->post(route('student.orders.cancel', $order))
        ->assertNotFound(); // 404
});
