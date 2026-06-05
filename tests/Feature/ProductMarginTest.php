<?php

use App\Models\MarginRule;
use App\Models\Product;

beforeEach(function () {
    cache()->forget('margin_rules_all');
});

test('returns default margin 500 when no rules exist', function () {
    expect(Product::resolveMargin(3000))->toBe(500);
});

test('matches exact lower bracket', function () {
    MarginRule::create(['min_price' => 0,    'max_price' => 5000,  'margin' => 300]);
    MarginRule::create(['min_price' => 5000, 'max_price' => 10000, 'margin' => 700]);
    cache()->forget('margin_rules_all');

    expect(Product::resolveMargin(0))->toBe(300);
    expect(Product::resolveMargin(2500))->toBe(300);
    expect(Product::resolveMargin(4999))->toBe(300);
});

test('matches upper bracket', function () {
    MarginRule::create(['min_price' => 0,    'max_price' => 5000,  'margin' => 300]);
    MarginRule::create(['min_price' => 5000, 'max_price' => 10000, 'margin' => 700]);
    cache()->forget('margin_rules_all');

    expect(Product::resolveMargin(5000))->toBe(700);
    expect(Product::resolveMargin(7500))->toBe(700);
    expect(Product::resolveMargin(9999))->toBe(700);
});

test('open-ended rule matches price above min_price', function () {
    MarginRule::create(['min_price' => 10000, 'max_price' => null, 'margin' => 2000]);
    cache()->forget('margin_rules_all');

    expect(Product::resolveMargin(10000))->toBe(2000);
    expect(Product::resolveMargin(999999))->toBe(2000);
});

test('price at max_price boundary falls to next rule', function () {
    // max_price is exclusive (condition: max_price > cost_price)
    MarginRule::create(['min_price' => 0,    'max_price' => 5000,  'margin' => 300]);
    MarginRule::create(['min_price' => 5000, 'max_price' => null,  'margin' => 700]);
    cache()->forget('margin_rules_all');

    expect(Product::resolveMargin(5000))->toBe(700);
});

test('returns 500 fallback when price matches no rule', function () {
    MarginRule::create(['min_price' => 1000, 'max_price' => 2000, 'margin' => 400]);
    cache()->forget('margin_rules_all');

    // Below all rules — no match
    expect(Product::resolveMargin(500))->toBe(500);
    // Above all rules — no match
    expect(Product::resolveMargin(5000))->toBe(500);
});

test('uses cached rules after first call', function () {
    MarginRule::create(['min_price' => 0, 'max_price' => null, 'margin' => 999]);
    cache()->forget('margin_rules_all');

    Product::resolveMargin(1000); // prime cache

    // Delete rule from DB — cache should still return old value
    MarginRule::query()->delete();

    expect(Product::resolveMargin(1000))->toBe(999);
});

test('margin rules cache is cleared on create', function () {
    cache()->put('margin_rules_all', [['min_price' => 0, 'max_price' => null, 'margin' => 111]], 3600);

    MarginRule::create(['min_price' => 0, 'max_price' => null, 'margin' => 999]);

    // cache should be busted by boot hook
    expect(cache()->has('margin_rules_all'))->toBeFalse();
});

test('margin rules cache is cleared on delete', function () {
    $rule = MarginRule::create(['min_price' => 0, 'max_price' => null, 'margin' => 500]);
    cache()->forget('margin_rules_all');
    Product::resolveMargin(100); // prime cache

    $rule->delete();

    expect(cache()->has('margin_rules_all'))->toBeFalse();
});
