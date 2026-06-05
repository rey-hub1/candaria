<?php

use App\Models\Cashbook;
use App\Models\User;


function adminForCashbook(): User
{
    return User::factory()->admin()->create();
}

function cashierForCashbook(): User
{
    return User::factory()->cashier()->create();
}

// ─── index ───────────────────────────────────────────────────────────────────

test('admin can view cashbook index', function () {
    $this->actingAs(adminForCashbook())->get('/cashbooks')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Cashbooks/Index'));
});

test('cashier cannot view cashbook', function () {
    $this->actingAs(cashierForCashbook())->get('/cashbooks')
        ->assertStatus(403);
});

test('cashbook index shows balance totals', function () {
    $admin = adminForCashbook();

    Cashbook::factory()->for($admin, 'user')->debit()->create(['amount' => 10000]);
    Cashbook::factory()->for($admin, 'user')->credit()->create(['amount' => 3000]);

    $this->actingAs($admin)->get('/cashbooks')
        ->assertInertia(fn ($page) => $page
            ->has('totalDebit')
            ->has('totalCredit')
            ->has('currentBalance')
        );
});

// ─── store (manual entry) ─────────────────────────────────────────────────────

test('admin can add manual debit entry', function () {
    $admin = adminForCashbook();

    $this->actingAs($admin)->post('/cashbooks', [
        'date'        => '2026-06-01',
        'description' => 'Modal awal',
        'type'        => 'debit',
        'amount'      => 500000,
    ])->assertRedirect(route('cashbooks.index'));

    $this->assertDatabaseHas('cashbooks', [
        'description' => 'Modal awal',
        'type'        => 'debit',
        'amount'      => 500000,
        'source'      => 'manual',
    ]);
});

test('admin can add manual credit entry', function () {
    $admin = adminForCashbook();

    $this->actingAs($admin)->post('/cashbooks', [
        'date'        => '2026-06-01',
        'description' => 'Biaya listrik',
        'type'        => 'credit',
        'amount'      => 75000,
    ])->assertRedirect(route('cashbooks.index'));

    $this->assertDatabaseHas('cashbooks', ['description' => 'Biaya listrik', 'type' => 'credit']);
});

test('cashbook store validates required fields', function () {
    $this->actingAs(adminForCashbook())->post('/cashbooks', [])
        ->assertSessionHasErrors(['date', 'description', 'type', 'amount']);
});

test('cashbook amount must be non-negative', function () {
    $this->actingAs(adminForCashbook())->post('/cashbooks', [
        'date'        => '2026-06-01',
        'description' => 'Test',
        'type'        => 'debit',
        'amount'      => -100,
    ])->assertSessionHasErrors('amount');
});

test('cashbook type must be debit or credit', function () {
    $this->actingAs(adminForCashbook())->post('/cashbooks', [
        'date'        => '2026-06-01',
        'description' => 'Test',
        'type'        => 'invalid',
        'amount'      => 100,
    ])->assertSessionHasErrors('type');
});

// ─── delete ───────────────────────────────────────────────────────────────────

test('admin can delete manual cashbook entry', function () {
    $admin = adminForCashbook();
    $entry = Cashbook::factory()->for($admin, 'user')->create(['source' => 'manual']);

    $this->actingAs($admin)->delete("/cashbooks/{$entry->id}")
        ->assertRedirect(route('cashbooks.index'));

    $this->assertDatabaseMissing('cashbooks', ['id' => $entry->id]);
});

test('admin cannot delete transaction-sourced entry', function () {
    $admin = adminForCashbook();
    $entry = Cashbook::factory()->for($admin, 'user')->debit()->create([
        'source'       => 'transaction',
        'reference_id' => 1,
    ]);

    $this->actingAs($admin)->delete("/cashbooks/{$entry->id}")
        ->assertSessionHas('error');

    $this->assertDatabaseHas('cashbooks', ['id' => $entry->id]);
});

test('admin cannot delete settlement-sourced entry', function () {
    $admin = adminForCashbook();
    $entry = Cashbook::factory()->for($admin, 'user')->credit()->create([
        'source'       => 'settlement',
        'reference_id' => 1,
    ]);

    $this->actingAs($admin)->delete("/cashbooks/{$entry->id}")
        ->assertSessionHas('error');

    $this->assertDatabaseHas('cashbooks', ['id' => $entry->id]);
});

test('cashier cannot delete any cashbook entry', function () {
    $cashier = cashierForCashbook();
    $admin   = adminForCashbook();
    $entry   = Cashbook::factory()->for($admin, 'user')->create(['source' => 'manual']);

    $this->actingAs($cashier)->delete("/cashbooks/{$entry->id}")
        ->assertStatus(403);
});
