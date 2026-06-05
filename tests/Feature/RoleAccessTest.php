<?php

use App\Models\Seller;
use App\Models\User;


// ─── guest (unauthenticated) redirected to login ───────────────────────────────

$guestRedirectRoutes = [
    '/dashboard',
    '/cashier',
    '/transactions',
    '/products',
    '/categories',
    '/sellers',
    '/settlements',
    '/cashbooks',
    '/reports/sales',
    '/reports/titipan',
    '/reports/products',
    '/reports/stock',
    '/margin-rules',
    '/settings',
    '/users',
];

foreach ($guestRedirectRoutes as $route) {
    test("guest is redirected from GET {$route}", function () use ($route) {
        $this->get($route)->assertRedirect('/login');
    });
}

// ─── penitip cannot access admin or cashier routes ────────────────────────────

test('penitip cannot access cashier POS', function () {
    $penitip = User::factory()->penitip()->create();
    $this->actingAs($penitip)->get('/cashier')->assertStatus(403);
});

test('penitip cannot access transactions list', function () {
    $penitip = User::factory()->penitip()->create();
    $this->actingAs($penitip)->get('/transactions')->assertStatus(403);
});

test('penitip cannot access products', function () {
    $penitip = User::factory()->penitip()->create();
    $this->actingAs($penitip)->get('/products')->assertStatus(403);
});

test('penitip cannot access categories', function () {
    $penitip = User::factory()->penitip()->create();
    $this->actingAs($penitip)->get('/categories')->assertStatus(403);
});

test('penitip cannot access sellers', function () {
    $penitip = User::factory()->penitip()->create();
    $this->actingAs($penitip)->get('/sellers')->assertStatus(403);
});

test('penitip cannot access settlements', function () {
    $penitip = User::factory()->penitip()->create();
    $this->actingAs($penitip)->get('/settlements')->assertStatus(403);
});

test('penitip cannot access cashbook', function () {
    $penitip = User::factory()->penitip()->create();
    $this->actingAs($penitip)->get('/cashbooks')->assertStatus(403);
});

test('penitip cannot access reports', function () {
    $penitip = User::factory()->penitip()->create();
    $this->actingAs($penitip)->get('/reports/sales')->assertStatus(403);
});

test('penitip cannot access margin rules', function () {
    $penitip = User::factory()->penitip()->create();
    $this->actingAs($penitip)->get('/margin-rules')->assertStatus(403);
});

test('penitip cannot access user management', function () {
    $penitip = User::factory()->penitip()->create();
    $this->actingAs($penitip)->get('/users')->assertStatus(403);
});

test('penitip cannot access settings', function () {
    $penitip = User::factory()->penitip()->create();
    $this->actingAs($penitip)->get('/settings')->assertStatus(403);
});

// ─── cashier can access cashier routes but not admin routes ───────────────────

test('cashier can access POS', function () {
    $cashier = User::factory()->cashier()->create();
    $this->actingAs($cashier)->get('/cashier')->assertOk();
});

test('cashier can access transaction list', function () {
    $cashier = User::factory()->cashier()->create();
    $this->actingAs($cashier)->get('/transactions')->assertOk();
});

test('cashier cannot access products management', function () {
    $cashier = User::factory()->cashier()->create();
    $this->actingAs($cashier)->get('/products')->assertStatus(403);
});

test('cashier cannot access settlements', function () {
    $cashier = User::factory()->cashier()->create();
    $this->actingAs($cashier)->get('/settlements')->assertStatus(403);
});

test('cashier cannot access cashbook', function () {
    $cashier = User::factory()->cashier()->create();
    $this->actingAs($cashier)->get('/cashbooks')->assertStatus(403);
});

test('cashier cannot access reports', function () {
    $cashier = User::factory()->cashier()->create();
    $this->actingAs($cashier)->get('/reports/sales')->assertStatus(403);
});

test('cashier cannot access user management', function () {
    $cashier = User::factory()->cashier()->create();
    $this->actingAs($cashier)->get('/users')->assertStatus(403);
});

// ─── admin can access everything ─────────────────────────────────────────────

test('admin can access dashboard', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->get('/dashboard')->assertOk();
});

test('admin can access cashier POS', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->get('/cashier')->assertOk();
});

test('admin can access products', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->get('/products')->assertOk();
});

test('admin can access settlements', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->get('/settlements')->assertOk();
});

test('admin can access cashbook', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->get('/cashbooks')->assertOk();
});

test('admin can access sales report', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->get('/reports/sales')->assertOk();
});

test('admin can access margin rules', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->get('/margin-rules')->assertOk();
});

test('admin can access user management', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->get('/users')->assertOk();
});

test('admin can access settings', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->get('/settings')->assertOk();
});

// ─── penitip can access own dashboard ────────────────────────────────────────

test('penitip can access dashboard', function () {
    $penitip = User::factory()->penitip()->create();
    $seller  = Seller::factory()->withoutPhone()->create(['phone' => null]);

    $this->actingAs($penitip)->get('/dashboard')->assertOk();
});
