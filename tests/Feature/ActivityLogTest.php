<?php

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;

function logAdminUser(): User
{
    return User::factory()->admin()->create();
}

function logCashierUser(): User
{
    return User::factory()->cashier()->create();
}

function logKantinProduct(int $cost = 2000, int $selling = 3000, int $stock = 10): Product
{
    $cat = Category::factory()->create();
    return Product::create([
        'category_id'   => $cat->id,
        'type'          => 'kantin',
        'name'          => 'Log Produk ' . rand(1, 9999),
        'cost_price'    => $cost,
        'selling_price' => $selling,
        'stock'         => $stock,
    ]);
}

test('factory-created models do not generate activity logs (no auth)', function () {
    logKantinProduct();
    expect(ActivityLog::count())->toBe(0);
});

test('checkout records a checkout activity for the acting user', function () {
    $cashier = logCashierUser();
    $product = logKantinProduct(2000, 3000, 10);

    $this->actingAs($cashier)->post('/checkout', [
        'items'       => [['id' => $product->id, 'quantity' => 1]],
        'paid_amount' => 5000,
    ]);

    $log = ActivityLog::where('event', 'checkout')->first();
    expect($log)->not->toBeNull();
    expect($log->user_id)->toBe($cashier->id);
    expect($log->subject_type)->toBe('Transaction');
});

test('void records a voided activity with the reason', function () {
    $cashier = logCashierUser();
    $product = logKantinProduct(2000, 3000, 10);

    $this->actingAs($cashier)->post('/checkout', [
        'items'       => [['id' => $product->id, 'quantity' => 1]],
        'paid_amount' => 5000,
    ]);

    $tx = Transaction::first();
    $this->actingAs(logAdminUser())->delete("/transactions/{$tx->id}", ['reason' => 'Uji void']);

    $log = ActivityLog::where('event', 'voided')->first();
    expect($log)->not->toBeNull();
    expect($log->properties['reason'])->toBe('Uji void');
});

test('updating a product while authenticated records an updated activity', function () {
    $admin   = logAdminUser();
    $product = logKantinProduct(2000, 3000, 10);

    $this->actingAs($admin);
    $product->update(['selling_price' => 3500]);

    $log = ActivityLog::where('event', 'updated')->where('subject_type', 'Product')->first();
    expect($log)->not->toBeNull();
    expect($log->properties['changed'])->toContain('selling_price');
});

test('admin can view activity log page', function () {
    $this->actingAs(logAdminUser())->get('/activity-logs')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('ActivityLogs/Index'));
});

test('cashier cannot view activity log page', function () {
    $this->actingAs(logCashierUser())->get('/activity-logs')->assertForbidden();
});
