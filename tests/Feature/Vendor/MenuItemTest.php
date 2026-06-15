<?php

use App\Models\MarketplaceCategory;
use App\Models\MenuItem;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->vendorUser = User::factory()->create(['role' => 'vendor']);
    $this->vendor = Vendor::factory()->create(['user_id' => $this->vendorUser->id]);
    
    $this->otherVendorUser = User::factory()->create(['role' => 'vendor']);
    $this->otherVendor = Vendor::factory()->create(['user_id' => $this->otherVendorUser->id]);
});

test('vendor can view their own menu items', function () {
    MarketplaceCategory::create(['type' => 'menu', 'name' => 'Kategori A', 'is_active' => true]);
    
    MenuItem::factory()->count(3)->create(['vendor_id' => $this->vendor->id]);
    MenuItem::factory()->count(2)->create(['vendor_id' => $this->otherVendor->id]);

    $this->actingAs($this->vendorUser)
        ->get(route('vendor.menu.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Vendor/Menu/Index')
            ->has('menuItems', 3) // Only sees their own 3 items
            ->has('categories', 1)
            ->where('categories.0', 'Kategori A')
        );
});

test('vendor can store new menu item with image', function () {
    Storage::fake('public');
    
    $image = UploadedFile::fake()->image('menu.jpg');

    $payload = [
        'name' => 'Nasi Goreng Spesial',
        'price' => 20000,
        'category' => 'Makanan',
        'is_active' => true,
        'image' => $image,
    ];

    $this->actingAs($this->vendorUser)
        ->post(route('vendor.menu.store'), $payload)
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('menu_items', [
        'vendor_id' => $this->vendor->id,
        'name' => 'Nasi Goreng Spesial',
        'price' => 20000,
        'category' => 'Makanan',
        'is_active' => true,
    ]);

    $menu = MenuItem::first();
    Storage::disk('public')->assertExists($menu->image);
});

test('vendor can update their own menu item', function () {
    $menu = MenuItem::factory()->create(['vendor_id' => $this->vendor->id, 'name' => 'Old Name']);

    $payload = [
        'name' => 'New Name',
        'price' => 25000,
        'is_active' => false,
    ];

    $this->actingAs($this->vendorUser)
        ->put(route('vendor.menu.update', $menu), $payload)
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('menu_items', [
        'id' => $menu->id,
        'name' => 'New Name',
        'price' => 25000,
        'is_active' => 0,
    ]);
});

test('vendor cannot update other vendors menu item', function () {
    $otherMenu = MenuItem::factory()->create(['vendor_id' => $this->otherVendor->id]);

    $this->actingAs($this->vendorUser)
        ->put(route('vendor.menu.update', $otherMenu), [
            'name' => 'Hacked Name',
            'price' => 1000
        ])
        ->assertForbidden(); // 403 based on authorizeOwner
});

test('vendor can delete their own menu item', function () {
    $menu = MenuItem::factory()->create(['vendor_id' => $this->vendor->id]);

    $this->actingAs($this->vendorUser)
        ->delete(route('vendor.menu.destroy', $menu))
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertSoftDeleted('menu_items', ['id' => $menu->id]);
});

test('vendor cannot delete other vendors menu item', function () {
    $otherMenu = MenuItem::factory()->create(['vendor_id' => $this->otherVendor->id]);

    $this->actingAs($this->vendorUser)
        ->delete(route('vendor.menu.destroy', $otherMenu))
        ->assertForbidden(); // 403

    $this->assertDatabaseHas('menu_items', ['id' => $otherMenu->id]);
});

test('vendor can toggle active status', function () {
    $menu = MenuItem::factory()->create(['vendor_id' => $this->vendor->id, 'is_active' => false]);

    $this->actingAs($this->vendorUser)
        ->post(route('vendor.menu.toggle', $menu))
        ->assertRedirect()
        ->assertSessionHas('success', 'Menu diaktifkan.');

    expect($menu->fresh()->is_active)->toBe(true);

    $this->post(route('vendor.menu.toggle', $menu))
        ->assertRedirect()
        ->assertSessionHas('success', 'Menu dinonaktifkan.');

    expect($menu->fresh()->is_active)->toBe(false);
});
