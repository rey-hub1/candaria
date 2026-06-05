<?php

use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Str;


function adminUser(): User
{
    return User::factory()->admin()->create();
}

function cashierUser(): User
{
    return User::factory()->cashier()->create();
}

function categoryPayload(string $name = 'Makanan Berat'): array
{
    return [
        'name'   => $name,
        'slug'   => Str::slug($name),
        'code'   => 'MB',
        'prefix' => 'M',
    ];
}

// ─── index ───────────────────────────────────────────────────────────────────

test('admin can view categories page', function () {
    $this->actingAs(adminUser())->get('/categories')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Categories/Index'));
});

test('cashier cannot view categories', function () {
    $this->actingAs(cashierUser())->get('/categories')
        ->assertStatus(403);
});

test('guest is redirected to login', function () {
    $this->get('/categories')->assertRedirect('/login');
});

// ─── create ───────────────────────────────────────────────────────────────────

test('admin can create category', function () {
    $this->actingAs(adminUser())->post('/categories', categoryPayload('Minuman Segar'))
        ->assertRedirect();

    $this->assertDatabaseHas('categories', ['name' => 'Minuman Segar']);
});

test('category creation requires name', function () {
    $this->actingAs(adminUser())->post('/categories', ['slug' => 'no-name'])
        ->assertSessionHasErrors('name');
});

test('cashier cannot create category', function () {
    $this->actingAs(cashierUser())->post('/categories', categoryPayload())
        ->assertStatus(403);
});

// ─── update ───────────────────────────────────────────────────────────────────

test('admin can update category', function () {
    $cat = Category::factory()->create(['name' => 'Old Name']);

    $this->actingAs(adminUser())->patch("/categories/{$cat->id}", [
        'name'   => 'New Name',
        'slug'   => Str::slug('New Name'),
        'code'   => 'NN',
        'prefix' => 'N',
    ])->assertRedirect();

    expect($cat->fresh()->name)->toBe('New Name');
});

test('cashier cannot update category', function () {
    $cat = Category::factory()->create();

    $this->actingAs(cashierUser())->patch("/categories/{$cat->id}", ['name' => 'Hack'])
        ->assertStatus(403);
});

// ─── delete ───────────────────────────────────────────────────────────────────

test('admin can delete category', function () {
    $cat = Category::factory()->create();

    $this->actingAs(adminUser())->delete("/categories/{$cat->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('categories', ['id' => $cat->id]);
});

test('cashier cannot delete category', function () {
    $cat = Category::factory()->create();

    $this->actingAs(cashierUser())->delete("/categories/{$cat->id}")
        ->assertStatus(403);
});
