<?php

use App\Models\Seller;
use App\Models\User;


test('admin sees dashboard', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Dashboard'));
});

test('cashier sees dashboard', function () {
    $cashier = User::factory()->cashier()->create();

    $this->actingAs($cashier)->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Dashboard'));
});

test('penitip sees dashboard', function () {
    $penitip = User::factory()->penitip()->create();

    $this->actingAs($penitip)->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Dashboard'));
});

test('unauthenticated user is redirected to login from dashboard', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('dashboard data contains expected keys for admin', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/dashboard')
        ->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('auth')
        );
});

test('penitip export xlsx responds successfully when seller exists', function () {
    $penitip = User::factory()->penitip()->create();
    Seller::factory()->create(['phone' => $penitip->phone]);

    $this->actingAs($penitip)->get('/dashboard/export')
        ->assertOk()
        ->assertHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('admin cannot access penitip export endpoint', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/dashboard/export')
        ->assertStatus(403);
});
