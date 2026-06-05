<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Seller;
use App\Models\SellerSettlement;
use App\Models\User;


function adminAct(): User
{
    return User::factory()->admin()->create();
}

function cashierAct(): User
{
    return User::factory()->cashier()->create();
}

// ─── index ───────────────────────────────────────────────────────────────────

test('admin can view sellers list', function () {
    $this->actingAs(adminAct())->get('/sellers')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Sellers/Index'));
});

test('cashier cannot view sellers', function () {
    $this->actingAs(cashierAct())->get('/sellers')
        ->assertStatus(403);
});

// ─── create ───────────────────────────────────────────────────────────────────

test('admin can create seller without phone', function () {
    $this->actingAs(adminAct())->post('/sellers', [
        'name'  => 'Budi',
        'class' => 'XI IPA 2',
    ])->assertRedirect(route('sellers.index'));

    $this->assertDatabaseHas('sellers', ['name' => 'Budi']);
});

test('creating seller with phone auto-creates penitip user', function () {
    $this->actingAs(adminAct())->post('/sellers', [
        'name'  => 'Sari Dewi',
        'class' => 'X MIPA 3',
        'phone' => '081234567891',
    ]);

    $this->assertDatabaseHas('sellers', ['name' => 'Sari Dewi', 'phone' => '081234567891']);
    $this->assertDatabaseHas('users', [
        'name'  => 'Sari Dewi',
        'phone' => '081234567891',
        'role'  => 'penitip',
    ]);
});

test('creating seller with duplicate phone uses existing user (firstOrCreate)', function () {
    User::factory()->create(['phone' => '081111111111', 'role' => 'penitip']);

    $this->actingAs(adminAct())->post('/sellers', [
        'name'  => 'Andi',
        'phone' => '081111111111',
    ]);

    // Still only one user with that phone
    expect(User::where('phone', '081111111111')->count())->toBe(1);
});

test('seller creation requires name', function () {
    $this->actingAs(adminAct())->post('/sellers', ['class' => 'X'])
        ->assertSessionHasErrors('name');
});

// ─── update ───────────────────────────────────────────────────────────────────

test('admin can update seller info', function () {
    $seller = Seller::factory()->withoutPhone()->create(['name' => 'Old']);

    $this->actingAs(adminAct())->patch("/sellers/{$seller->id}", [
        'name'      => 'New Name',
        'class'     => 'XII',
        'is_active' => true,
    ])->assertRedirect(route('sellers.index'));

    expect($seller->fresh()->name)->toBe('New Name');
});

test('updating seller phone also updates linked user', function () {
    $phone  = '082200000001';
    $seller = Seller::factory()->create(['phone' => $phone]);
    User::factory()->create(['phone' => $phone, 'role' => 'penitip', 'name' => 'Old User']);

    $this->actingAs(adminAct())->patch("/sellers/{$seller->id}", [
        'name'      => 'Updated Seller',
        'class'     => 'XI',
        'phone'     => $phone,
        'is_active' => true,
    ]);

    expect(User::where('phone', $phone)->first()->name)->toBe('Updated Seller');
});

test('deactivating seller sets is_active to false', function () {
    $seller = Seller::factory()->create(['is_active' => true]);

    $this->actingAs(adminAct())->patch("/sellers/{$seller->id}", [
        'name'      => $seller->name,
        'is_active' => false,
    ]);

    expect((bool) $seller->fresh()->is_active)->toBeFalse();
});

// ─── delete ───────────────────────────────────────────────────────────────────

test('admin can delete seller with no products and no settlements', function () {
    $seller = Seller::factory()->withoutPhone()->create();

    $this->actingAs(adminAct())->delete("/sellers/{$seller->id}")
        ->assertRedirect(route('sellers.index'));

    $this->assertDatabaseMissing('sellers', ['id' => $seller->id]);
});

test('cannot delete seller that still has products', function () {
    $seller = Seller::factory()->withoutPhone()->create();
    $cat    = Category::factory()->create();

    Product::create([
        'category_id'   => $cat->id,
        'seller_id'     => $seller->id,
        'type'          => 'siswa',
        'name'          => 'Produk Titipan',
        'cost_price'    => 2000,
        'selling_price' => 2500,
        'stock'         => 5,
    ]);

    $this->actingAs(adminAct())->delete("/sellers/{$seller->id}")
        ->assertSessionHas('error');

    $this->assertDatabaseHas('sellers', ['id' => $seller->id]);
});

test('cannot delete seller that has settlement history', function () {
    $admin  = adminAct();
    $seller = Seller::factory()->withoutPhone()->create();

    SellerSettlement::create([
        'seller_id'       => $seller->id,
        'user_id'         => $admin->id,
        'total_amount'    => 10000,
        'settlement_date' => now(),
    ]);

    $this->actingAs($admin)->delete("/sellers/{$seller->id}")
        ->assertSessionHas('error');

    $this->assertDatabaseHas('sellers', ['id' => $seller->id]);
});
