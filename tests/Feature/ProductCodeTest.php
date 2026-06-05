<?php

use App\Models\Category;
use App\Models\Product;

function makeCategory(string $prefix = 'M'): Category
{
    return Category::create([
        'name'   => 'Makanan' . rand(1, 9999),
        'slug'   => 'makanan-' . rand(1, 9999),
        'code'   => strtoupper(substr($prefix, 0, 2)),
        'prefix' => $prefix,
    ]);
}

function makeProduct(Category $category, string $type = 'kantin'): Product
{
    return Product::create([
        'category_id'   => $category->id,
        'type'          => $type,
        'name'          => 'Produk ' . rand(1, 9999),
        'cost_price'    => 2000,
        'selling_price' => 2500,
        'stock'         => 10,
    ]);
}

test('first product in category gets code prefix + 01', function () {
    $cat = makeCategory('MK');
    $product = makeProduct($cat);

    expect($product->code)->toBe('MK01');
});

test('second product increments to 02', function () {
    $cat = makeCategory('MK');
    makeProduct($cat);
    $second = makeProduct($cat);

    expect($second->code)->toBe('MK02');
});

test('code is unique across categories', function () {
    $cat1 = makeCategory('AA');
    $cat2 = makeCategory('BB');

    $p1 = makeProduct($cat1);
    $p2 = makeProduct($cat2);

    expect($p1->code)->toBe('AA01');
    expect($p2->code)->toBe('BB01');
});

test('falls back to first letter of category name if prefix is null', function () {
    $cat = Category::create([
        'name'   => 'Zebra123',
        'slug'   => 'zebra-123',
        'code'   => 'ZB',
        'prefix' => null,
    ]);

    $product = makeProduct($cat);

    // boot: prefix = category->prefix ?: strtoupper(substr(name, 0, 1))
    expect($product->code)->toStartWith('Z');
});

test('existing code is not overwritten on update', function () {
    $cat = makeCategory('MK');
    $product = makeProduct($cat);
    $originalCode = $product->code;

    $product->update(['name' => 'Updated Name']);

    expect($product->fresh()->code)->toBe($originalCode);
});

test('code skips if already used (uniqueness loop)', function () {
    $cat = makeCategory('MK');

    // Manually set code MK01 to simulate collision
    Product::create([
        'category_id'   => $cat->id,
        'type'          => 'kantin',
        'name'          => 'Manual',
        'code'          => 'MK01',
        'cost_price'    => 1000,
        'selling_price' => 1500,
        'stock'         => 5,
    ]);

    // Next auto-generated should be MK02
    $product = makeProduct($cat);

    expect($product->code)->toBe('MK02');
});
