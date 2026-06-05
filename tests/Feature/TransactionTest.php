<?php

use App\Models\Cashbook;
use App\Models\Category;
use App\Models\Product;
use App\Models\Seller;
use App\Models\SellerSettlement;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;


// ─── helpers ─────────────────────────────────────────────────────────────────

function makeCashierUser(): User
{
    return User::factory()->cashier()->create();
}

function makeAdminUser(): User
{
    return User::factory()->admin()->create();
}

function makeKantinProduct(int $cost = 2000, int $selling = 3000, int $stock = 10): Product
{
    $cat = Category::factory()->create();
    return Product::create([
        'category_id'   => $cat->id,
        'type'          => 'kantin',
        'name'          => 'Produk Test ' . rand(1, 9999),
        'cost_price'    => $cost,
        'selling_price' => $selling,
        'stock'         => $stock,
    ]);
}

function makeSiswaProduct(int $cost = 3000, int $margin = 500, int $stock = 10): Product
{
    $cat    = Category::factory()->create();
    $seller = Seller::factory()->create();

    return Product::create([
        'category_id'   => $cat->id,
        'seller_id'     => $seller->id,
        'type'          => 'siswa',
        'name'          => 'Titipan Test ' . rand(1, 9999),
        'cost_price'    => $cost,
        'selling_price' => $cost + $margin,
        'stock'         => $stock,
    ]);
}

function checkoutPayload(array $items, int $paid): array
{
    return ['items' => $items, 'paid_amount' => $paid];
}

// ─── checkout success ─────────────────────────────────────────────────────────

test('cashier can checkout and transaction is created', function () {
    $cashier = makeCashierUser();
    $product = makeKantinProduct(2000, 3000, 10);

    $response = $this->actingAs($cashier)->post('/checkout', checkoutPayload(
        [['id' => $product->id, 'quantity' => 2]],
        10000
    ));

    $response->assertRedirect();
    $this->assertDatabaseHas('transactions', [
        'total_amount'  => 6000,
        'paid_amount'   => 10000,
        'change_amount' => 4000,
    ]);
});

test('checkout deducts stock correctly', function () {
    $cashier = makeCashierUser();
    $product = makeKantinProduct(2000, 3000, 10);

    $this->actingAs($cashier)->post('/checkout', checkoutPayload(
        [['id' => $product->id, 'quantity' => 3]],
        10000
    ));

    expect($product->fresh()->stock)->toBe(7);
});

test('checkout creates a debit cashbook entry', function () {
    $cashier = makeCashierUser();
    $product = makeKantinProduct(2000, 3000, 5);

    $this->actingAs($cashier)->post('/checkout', checkoutPayload(
        [['id' => $product->id, 'quantity' => 2]],
        10000
    ));

    $this->assertDatabaseHas('cashbooks', [
        'type'   => 'debit',
        'source' => 'transaction',
        'amount' => 6000,
    ]);
});

test('kantin product profit split: all goes to kantin', function () {
    $cashier = makeCashierUser();
    $product = makeKantinProduct(2000, 3000, 5);

    $this->actingAs($cashier)->post('/checkout', checkoutPayload(
        [['id' => $product->id, 'quantity' => 2]],
        10000
    ));

    $item = TransactionItem::first();
    expect((float) $item->profit_kantin)->toEqual(2000.0); // (3000-2000)*2
    expect((float) $item->profit_seller)->toEqual(0.0);
});

test('siswa product profit split: seller gets cost price back', function () {
    $cashier = makeCashierUser();
    $product = makeSiswaProduct(3000, 500, 5);

    $this->actingAs($cashier)->post('/checkout', checkoutPayload(
        [['id' => $product->id, 'quantity' => 2]],
        10000
    ));

    $item = TransactionItem::first();
    expect((float) $item->profit_kantin)->toEqual(1000.0); // 500*2
    expect((float) $item->profit_seller)->toEqual(6000.0); // 3000*2
});

test('checkout with multiple products', function () {
    $cashier  = makeCashierUser();
    $product1 = makeKantinProduct(1000, 1500, 10);
    $product2 = makeKantinProduct(2000, 3000, 10);

    $this->actingAs($cashier)->post('/checkout', checkoutPayload([
        ['id' => $product1->id, 'quantity' => 2],
        ['id' => $product2->id, 'quantity' => 1],
    ], 10000));

    $this->assertDatabaseHas('transactions', ['total_amount' => 6000]); // 1500*2 + 3000
    expect($product1->fresh()->stock)->toBe(8);
    expect($product2->fresh()->stock)->toBe(9);
});

test('transaction code is 5-digit zero-padded', function () {
    $cashier = makeCashierUser();
    $product = makeKantinProduct(1000, 1500, 5);

    $this->actingAs($cashier)->post('/checkout', checkoutPayload(
        [['id' => $product->id, 'quantity' => 1]],
        2000
    ));

    $tx = Transaction::first();
    expect(strlen($tx->transaction_code))->toBe(5);
    expect($tx->transaction_code)->toBe('00001');
});

test('second transaction of day has code 00002', function () {
    $cashier = makeCashierUser();
    $p1 = makeKantinProduct(1000, 1500, 5);
    $p2 = makeKantinProduct(1000, 1500, 5);

    $this->actingAs($cashier)->post('/checkout', checkoutPayload([['id' => $p1->id, 'quantity' => 1]], 2000));
    $this->actingAs($cashier)->post('/checkout', checkoutPayload([['id' => $p2->id, 'quantity' => 1]], 2000));

    $codes = Transaction::pluck('transaction_code')->sort()->values();
    expect($codes[0])->toBe('00001');
    expect($codes[1])->toBe('00002');
});

// ─── checkout failures ────────────────────────────────────────────────────────

test('checkout fails when stock is insufficient', function () {
    $cashier = makeCashierUser();
    $product = makeKantinProduct(1000, 1500, 2);

    $this->actingAs($cashier)->post('/checkout', checkoutPayload(
        [['id' => $product->id, 'quantity' => 5]],
        10000
    ))->assertSessionHas('error');

    $this->assertDatabaseCount('transactions', 0);
    expect($product->fresh()->stock)->toBe(2);
});

test('checkout fails when paid amount is less than total', function () {
    $cashier = makeCashierUser();
    $product = makeKantinProduct(1000, 5000, 5);

    $this->actingAs($cashier)->post('/checkout', checkoutPayload(
        [['id' => $product->id, 'quantity' => 2]],
        5000 // total would be 10000
    ))->assertSessionHas('error');

    $this->assertDatabaseCount('transactions', 0);
});

test('checkout requires authentication', function () {
    $product = makeKantinProduct();

    $this->post('/checkout', checkoutPayload(
        [['id' => $product->id, 'quantity' => 1]],
        5000
    ))->assertRedirect('/login');
});

test('checkout validates required fields', function () {
    $cashier = makeCashierUser();

    $this->actingAs($cashier)->post('/checkout', [])->assertSessionHasErrors(['items', 'paid_amount']);
});

test('checkout rejects non-existent product id', function () {
    $cashier = makeCashierUser();

    $this->actingAs($cashier)->post('/checkout', checkoutPayload(
        [['id' => 99999, 'quantity' => 1]],
        5000
    ))->assertSessionHasErrors();
});

test('stock not deducted if transaction fails mid-way', function () {
    // Cannot easily force a mid-transaction DB error in SQLite, but verify
    // that a stock-insufficient request leaves stock untouched
    $cashier  = makeCashierUser();
    $product1 = makeKantinProduct(1000, 1500, 10);
    $product2 = makeKantinProduct(1000, 1500, 1);

    $this->actingAs($cashier)->post('/checkout', checkoutPayload([
        ['id' => $product1->id, 'quantity' => 2],
        ['id' => $product2->id, 'quantity' => 5], // insufficient
    ], 20000))->assertSessionHas('error');

    expect($product1->fresh()->stock)->toBe(10);
    expect($product2->fresh()->stock)->toBe(1);
});

// ─── void / destroy ───────────────────────────────────────────────────────────

test('void transaction restores stock', function () {
    $cashier = makeCashierUser();
    $product = makeKantinProduct(1000, 1500, 10);

    $this->actingAs($cashier)->post('/checkout', checkoutPayload(
        [['id' => $product->id, 'quantity' => 3]],
        5000
    ));

    expect($product->fresh()->stock)->toBe(7);

    $tx = Transaction::first();
    $this->actingAs(makeAdminUser())->delete("/transactions/{$tx->id}");

    expect($product->fresh()->stock)->toBe(10);
});

test('void transaction removes cashbook entry', function () {
    $cashier = makeCashierUser();
    $product = makeKantinProduct(1000, 1500, 5);

    $this->actingAs($cashier)->post('/checkout', checkoutPayload(
        [['id' => $product->id, 'quantity' => 1]],
        2000
    ));

    $this->assertDatabaseCount('cashbooks', 1);

    $tx = Transaction::first();
    $this->actingAs(makeAdminUser())->delete("/transactions/{$tx->id}");

    $this->assertDatabaseCount('cashbooks', 0);
});

test('void transaction deletes transaction record', function () {
    $cashier = makeCashierUser();
    $product = makeKantinProduct(1000, 1500, 5);

    $this->actingAs($cashier)->post('/checkout', checkoutPayload(
        [['id' => $product->id, 'quantity' => 1]],
        2000
    ));

    $tx = Transaction::first();
    $this->actingAs(makeAdminUser())->delete("/transactions/{$tx->id}");

    $this->assertDatabaseMissing('transactions', ['id' => $tx->id]);
});

test('void is blocked when a transaction item is already settled', function () {
    $cashier  = makeCashierUser();
    $product  = makeSiswaProduct(3000, 500, 5);

    $this->actingAs($cashier)->post('/checkout', checkoutPayload(
        [['id' => $product->id, 'quantity' => 1]],
        5000
    ));

    // Settle the item manually
    $settlement = SellerSettlement::create([
        'seller_id'       => $product->seller_id,
        'user_id'         => makeAdminUser()->id,
        'total_amount'    => 3000,
        'settlement_date' => now(),
    ]);
    TransactionItem::first()->update(['seller_settlement_id' => $settlement->id]);

    $tx = Transaction::first();
    $this->actingAs(makeAdminUser())->delete("/transactions/{$tx->id}")
        ->assertSessionHas('error');

    $this->assertDatabaseHas('transactions', ['id' => $tx->id]);
});

// ─── show / index ─────────────────────────────────────────────────────────────

test('cashier can view transaction receipt', function () {
    $cashier = makeCashierUser();
    $product = makeKantinProduct(1000, 1500, 5);

    $this->actingAs($cashier)->post('/checkout', checkoutPayload(
        [['id' => $product->id, 'quantity' => 1]],
        2000
    ));

    $tx = Transaction::first();
    $this->actingAs($cashier)->get("/transactions/{$tx->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Transactions/Show'));
});

test('cashier can list transactions', function () {
    $cashier = makeCashierUser();

    $this->actingAs($cashier)->get('/transactions')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Transactions/Index'));
});
