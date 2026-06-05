<?php

use App\Models\Cashbook;
use App\Models\Category;
use App\Models\Product;
use App\Models\Seller;
use App\Models\SellerSettlement;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;


// ─── helpers ──────────────────────────────────────────────────────────────────

function createSeller(): Seller
{
    return Seller::factory()->withoutPhone()->create();
}

function createSiswaProduct(Seller $seller, int $cost = 3000): Product
{
    $cat = Category::factory()->create();
    return Product::create([
        'category_id'   => $cat->id,
        'seller_id'     => $seller->id,
        'type'          => 'siswa',
        'name'          => 'Titipan ' . rand(1, 9999),
        'cost_price'    => $cost,
        'selling_price' => $cost + 500,
        'stock'         => 10,
    ]);
}

function createSaleItem(Product $product, int $qty = 1, ?int $settlementId = null): TransactionItem
{
    $cashier = User::factory()->cashier()->create();
    $tx = Transaction::create([
        'transaction_code' => str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT),
        'user_id'          => $cashier->id,
        'total_amount'     => $product->selling_price * $qty,
        'paid_amount'      => $product->selling_price * $qty,
        'change_amount'    => 0,
    ]);

    return TransactionItem::create([
        'transaction_id'       => $tx->id,
        'product_id'           => $product->id,
        'quantity'             => $qty,
        'cost_price'           => $product->cost_price,
        'selling_price'        => $product->selling_price,
        'profit_kantin'        => 500 * $qty,
        'profit_seller'        => $product->cost_price * $qty,
        'seller_settlement_id' => $settlementId,
    ]);
}

// ─── index ───────────────────────────────────────────────────────────────────

test('admin can view settlements index', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/settlements')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Settlements/Index'));
});

test('cashier cannot view settlements', function () {
    $this->actingAs(User::factory()->cashier()->create())->get('/settlements')
        ->assertStatus(403);
});

// ─── show ─────────────────────────────────────────────────────────────────────

test('admin can view seller ledger', function () {
    $admin  = User::factory()->admin()->create();
    $seller = createSeller();

    $this->actingAs($admin)->get("/settlements/{$seller->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Settlements/Show'));
});

// ─── store (payment) ─────────────────────────────────────────────────────────

test('admin can pay a seller', function () {
    $admin  = User::factory()->admin()->create();
    $seller = createSeller();

    $this->actingAs($admin)->post('/settlements', [
        'seller_id' => $seller->id,
        'amount'    => 10000,
        'notes'     => 'Pembayaran minggu ini',
    ])->assertRedirect();

    $this->assertDatabaseHas('seller_settlements', [
        'seller_id'    => $seller->id,
        'total_amount' => 10000,
    ]);
});

test('payment creates cashbook credit entry', function () {
    $admin  = User::factory()->admin()->create();
    $seller = createSeller();

    $this->actingAs($admin)->post('/settlements', [
        'seller_id' => $seller->id,
        'amount'    => 15000,
    ]);

    $this->assertDatabaseHas('cashbooks', [
        'type'   => 'credit',
        'source' => 'settlement',
        'amount' => 15000,
    ]);
});

test('payment requires valid seller_id', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post('/settlements', [
        'seller_id' => 99999,
        'amount'    => 5000,
    ])->assertSessionHasErrors('seller_id');
});

test('payment requires positive amount', function () {
    $admin  = User::factory()->admin()->create();
    $seller = createSeller();

    $this->actingAs($admin)->post('/settlements', [
        'seller_id' => $seller->id,
        'amount'    => 0,
    ])->assertSessionHasErrors('amount');
});

// ─── FIFO allocation ──────────────────────────────────────────────────────────

test('FIFO: items marked as settled when payment covers them fully', function () {
    $admin   = User::factory()->admin()->create();
    $seller  = createSeller();
    $product = createSiswaProduct($seller, 3000);

    $item1 = createSaleItem($product, 1); // profit_seller = 3000
    $item2 = createSaleItem($product, 1); // profit_seller = 3000

    // Pay enough to cover both items (6000)
    $this->actingAs($admin)->post('/settlements', [
        'seller_id' => $seller->id,
        'amount'    => 6000,
    ]);

    $settlement = SellerSettlement::first();
    expect($item1->fresh()->seller_settlement_id)->toBe($settlement->id);
    expect($item2->fresh()->seller_settlement_id)->toBe($settlement->id);
});

test('FIFO: partial payment only marks items that fit fully', function () {
    $admin   = User::factory()->admin()->create();
    $seller  = createSeller();
    $product = createSiswaProduct($seller, 3000);

    $item1 = createSaleItem($product, 1); // profit_seller = 3000
    $item2 = createSaleItem($product, 1); // profit_seller = 3000

    // Pay only 3000 — covers item1 only
    $this->actingAs($admin)->post('/settlements', [
        'seller_id' => $seller->id,
        'amount'    => 3000,
    ]);

    $settlement = SellerSettlement::first();
    expect($item1->fresh()->seller_settlement_id)->toBe($settlement->id);
    expect($item2->fresh()->seller_settlement_id)->toBeNull();
});

test('FIFO: payment less than one item leaves all items unsettled', function () {
    $admin   = User::factory()->admin()->create();
    $seller  = createSeller();
    $product = createSiswaProduct($seller, 5000);

    $item1 = createSaleItem($product, 1); // profit_seller = 5000

    // Pay only 3000 — cannot fully cover item1
    $this->actingAs($admin)->post('/settlements', [
        'seller_id' => $seller->id,
        'amount'    => 3000,
    ]);

    expect($item1->fresh()->seller_settlement_id)->toBeNull();
});

test('FIFO: previously settled items are not re-assigned', function () {
    $admin   = User::factory()->admin()->create();
    $seller  = createSeller();
    $product = createSiswaProduct($seller, 2000);

    // Create and settle item1 first
    $firstSettlement = SellerSettlement::create([
        'seller_id'       => $seller->id,
        'user_id'         => $admin->id,
        'total_amount'    => 2000,
        'settlement_date' => now(),
    ]);
    $item1 = createSaleItem($product, 1, $firstSettlement->id);

    // Create item2 (unsettled)
    $item2 = createSaleItem($product, 1);

    // New payment — should only settle item2
    $this->actingAs($admin)->post('/settlements', [
        'seller_id' => $seller->id,
        'amount'    => 2000,
    ]);

    $newSettlement = SellerSettlement::orderBy('id', 'desc')->first();
    expect($item1->fresh()->seller_settlement_id)->toBe($firstSettlement->id); // unchanged
    expect($item2->fresh()->seller_settlement_id)->toBe($newSettlement->id);
});

test('payment does not affect kantin product items (profit_seller = 0)', function () {
    $admin   = User::factory()->admin()->create();
    $seller  = createSeller();
    $cat     = Category::factory()->create();
    $product = Product::create([
        'category_id'   => $cat->id,
        'type'          => 'kantin',
        'name'          => 'Kantin Produk',
        'cost_price'    => 2000,
        'selling_price' => 3000,
        'stock'         => 10,
    ]);
    $cashier = User::factory()->cashier()->create();
    $tx = Transaction::create([
        'transaction_code' => '99999',
        'user_id'          => $cashier->id,
        'total_amount'     => 3000,
        'paid_amount'      => 3000,
        'change_amount'    => 0,
    ]);
    $kantinItem = TransactionItem::create([
        'transaction_id' => $tx->id,
        'product_id'     => $product->id,
        'quantity'       => 1,
        'cost_price'     => 2000,
        'selling_price'  => 3000,
        'profit_kantin'  => 1000,
        'profit_seller'  => 0, // kantin item
    ]);

    $this->actingAs($admin)->post('/settlements', [
        'seller_id' => $seller->id,
        'amount'    => 5000,
    ]);

    // kantin item should NOT be touched
    expect($kantinItem->fresh()->seller_settlement_id)->toBeNull();
});
