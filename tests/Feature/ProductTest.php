<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Seller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;


function admin(): User
{
    return User::factory()->admin()->create();
}

function cashier(): User
{
    return User::factory()->cashier()->create();
}

function categoryAndSeller(): array
{
    return [
        'category' => Category::factory()->create(),
        'seller'   => Seller::factory()->create(),
    ];
}

// ─── index ───────────────────────────────────────────────────────────────────

test('admin can list products', function () {
    $this->actingAs(admin())->get('/products')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Products/Index'));
});

test('cashier cannot access product list', function () {
    $this->actingAs(cashier())->get('/products')
        ->assertStatus(403);
});

test('guest is redirected from product list', function () {
    $this->get('/products')->assertRedirect('/login');
});

// ─── create kantin ────────────────────────────────────────────────────────────

test('admin can create kantin product', function () {
    ['category' => $cat] = categoryAndSeller();

    $this->actingAs(admin())->post('/products', [
        'name'          => 'Nasi Goreng',
        'category_id'   => $cat->id,
        'type'          => 'kantin',
        'cost_price'    => 5000,
        'selling_price' => 7000,
        'stock'         => 20,
    ])->assertRedirect(route('products.index'));

    $this->assertDatabaseHas('products', ['name' => 'Nasi Goreng', 'type' => 'kantin']);
});

test('kantin product has auto-generated code', function () {
    ['category' => $cat] = categoryAndSeller();

    $this->actingAs(admin())->post('/products', [
        'name'          => 'Mie Ayam',
        'category_id'   => $cat->id,
        'type'          => 'kantin',
        'cost_price'    => 4000,
        'selling_price' => 5500,
        'stock'         => 10,
    ]);

    $product = Product::where('name', 'Mie Ayam')->first();
    expect($product->code)->not->toBeNull();
    expect(strlen($product->code))->toBeGreaterThan(0);
});

test('kantin product selling_price is not overridden by boot hook', function () {
    ['category' => $cat] = categoryAndSeller();

    $this->actingAs(admin())->post('/products', [
        'name'          => 'Soto',
        'category_id'   => $cat->id,
        'type'          => 'kantin',
        'cost_price'    => 3000,
        'selling_price' => 9999,
        'stock'         => 5,
    ]);

    $product = Product::where('name', 'Soto')->first();
    expect((int) $product->selling_price)->toBe(9999);
});

// ─── create siswa ─────────────────────────────────────────────────────────────

test('admin can create siswa product', function () {
    ['category' => $cat, 'seller' => $seller] = categoryAndSeller();

    $this->actingAs(admin())->post('/products', [
        'name'        => 'Kue Titipan',
        'category_id' => $cat->id,
        'type'        => 'siswa',
        'cost_price'  => 3000,
        'seller_id'   => $seller->id,
        'stock'       => 15,
    ])->assertRedirect(route('products.index'));

    $this->assertDatabaseHas('products', ['name' => 'Kue Titipan', 'type' => 'siswa']);
});

test('siswa product selling_price is auto-calculated (cost + margin fallback 500)', function () {
    cache()->forget('margin_rules_all');
    ['category' => $cat, 'seller' => $seller] = categoryAndSeller();

    $this->actingAs(admin())->post('/products', [
        'name'        => 'Roti Siswa',
        'category_id' => $cat->id,
        'type'        => 'siswa',
        'cost_price'  => 4000,
        'seller_id'   => $seller->id,
        'stock'       => 10,
    ]);

    $product = Product::where('name', 'Roti Siswa')->first();
    expect((int) $product->selling_price)->toBe(4500); // 4000 + 500 fallback
});

test('siswa product requires seller_id', function () {
    ['category' => $cat] = categoryAndSeller();

    $this->actingAs(admin())->post('/products', [
        'name'        => 'Roti',
        'category_id' => $cat->id,
        'type'        => 'siswa',
        'cost_price'  => 3000,
        'stock'       => 5,
    ])->assertSessionHasErrors('seller_id');
});

test('kantin product requires selling_price', function () {
    ['category' => $cat] = categoryAndSeller();

    $this->actingAs(admin())->post('/products', [
        'name'        => 'Ayam',
        'category_id' => $cat->id,
        'type'        => 'kantin',
        'cost_price'  => 5000,
        'stock'       => 5,
    ])->assertSessionHasErrors('selling_price');
});

// ─── update ───────────────────────────────────────────────────────────────────

test('admin can update product name and stock', function () {
    ['category' => $cat] = categoryAndSeller();
    $product = Product::factory()->kantin()->for($cat)->create(['name' => 'Old Name']);

    $this->actingAs(admin())->patch("/products/{$product->id}", [
        'name'          => 'New Name',
        'category_id'   => $cat->id,
        'type'          => 'kantin',
        'cost_price'    => $product->cost_price,
        'selling_price' => $product->selling_price,
        'stock'         => 99,
    ])->assertRedirect(route('products.index'));

    expect($product->fresh()->name)->toBe('New Name');
    expect($product->fresh()->stock)->toBe(99);
});

// ─── delete ───────────────────────────────────────────────────────────────────

test('admin can delete product without transactions', function () {
    ['category' => $cat] = categoryAndSeller();
    $product = Product::factory()->kantin()->for($cat)->create();

    $this->actingAs(admin())->delete("/products/{$product->id}")
        ->assertRedirect(route('products.index'));

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

test('admin cannot delete product that has transaction history', function () {
    ['category' => $cat] = categoryAndSeller();
    $product = Product::factory()->kantin()->for($cat)->create();
    $user = User::factory()->cashier()->create();

    // Create a transaction item referencing this product
    $tx = Transaction::create([
        'transaction_code' => '00001',
        'user_id'          => $user->id,
        'total_amount'     => 3000,
        'paid_amount'      => 3000,
        'change_amount'    => 0,
    ]);
    TransactionItem::create([
        'transaction_id' => $tx->id,
        'product_id'     => $product->id,
        'quantity'       => 1,
        'cost_price'     => 2000,
        'selling_price'  => 3000,
        'profit_kantin'  => 1000,
        'profit_seller'  => 0,
    ]);

    $this->actingAs(admin())->delete("/products/{$product->id}")
        ->assertSessionHas('error');

    $this->assertDatabaseHas('products', ['id' => $product->id]);
});

// ─── force increment ──────────────────────────────────────────────────────────

test('cashier can force-increment stock by 1', function () {
    ['category' => $cat] = categoryAndSeller();
    $product = Product::factory()->kantin()->for($cat)->create(['stock' => 5]);

    $this->actingAs(cashier())->post("/products/{$product->id}/force-increment")
        ->assertSessionHas('success');

    expect($product->fresh()->stock)->toBe(6);
});

test('admin can also force-increment stock', function () {
    ['category' => $cat] = categoryAndSeller();
    $product = Product::factory()->kantin()->for($cat)->create(['stock' => 0]);

    $this->actingAs(admin())->post("/products/{$product->id}/force-increment")
        ->assertSessionHas('success');

    expect($product->fresh()->stock)->toBe(1);
});

test('penitip cannot force-increment stock', function () {
    ['category' => $cat] = categoryAndSeller();
    $product = Product::factory()->kantin()->for($cat)->create(['stock' => 5]);
    $penitip = User::factory()->penitip()->create();

    $this->actingAs($penitip)->post("/products/{$product->id}/force-increment")
        ->assertStatus(403);
});
