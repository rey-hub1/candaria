<?php

use App\Models\MarginRule;
use App\Models\User;


beforeEach(function () {
    cache()->forget('margin_rules_all');
});

function adminMargin(): User
{
    return User::factory()->admin()->create();
}

// ─── index ───────────────────────────────────────────────────────────────────

test('admin can view margin rules', function () {
    $this->actingAs(adminMargin())->get('/margin-rules')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('MarginRules/Index'));
});

test('cashier cannot view margin rules', function () {
    $this->actingAs(User::factory()->cashier()->create())->get('/margin-rules')
        ->assertStatus(403);
});

// ─── store ────────────────────────────────────────────────────────────────────

test('admin can create margin rule', function () {
    $this->actingAs(adminMargin())->post('/margin-rules', [
        'min_price' => 0,
        'max_price' => 5000,
        'margin'    => 500,
    ])->assertRedirect();

    $this->assertDatabaseHas('margin_rules', ['min_price' => 0, 'margin' => 500]);
});

test('margin rule can have null max_price (open-ended)', function () {
    $this->actingAs(adminMargin())->post('/margin-rules', [
        'min_price' => 10000,
        'max_price' => null,
        'margin'    => 2000,
    ])->assertRedirect();

    $this->assertDatabaseHas('margin_rules', ['min_price' => 10000, 'max_price' => null]);
});

test('margin rule creation validates required fields', function () {
    $this->actingAs(adminMargin())->post('/margin-rules', [])
        ->assertSessionHasErrors(['min_price', 'margin']);
});

test('max_price must be greater than min_price', function () {
    $this->actingAs(adminMargin())->post('/margin-rules', [
        'min_price' => 5000,
        'max_price' => 3000,
        'margin'    => 500,
    ])->assertSessionHasErrors('max_price');
});

test('margin must be non-negative', function () {
    $this->actingAs(adminMargin())->post('/margin-rules', [
        'min_price' => 0,
        'max_price' => 5000,
        'margin'    => -100,
    ])->assertSessionHasErrors('margin');
});

test('creating a rule clears cache', function () {
    cache()->put('margin_rules_all', [['min_price' => 0, 'max_price' => null, 'margin' => 1]], 3600);

    $this->actingAs(adminMargin())->post('/margin-rules', [
        'min_price' => 0,
        'max_price' => 5000,
        'margin'    => 500,
    ]);

    expect(cache()->has('margin_rules_all'))->toBeFalse();
});

// ─── update ───────────────────────────────────────────────────────────────────

test('admin can update margin rule', function () {
    $rule = MarginRule::factory()->create(['margin' => 300]);

    $this->actingAs(adminMargin())->patch("/margin-rules/{$rule->id}", [
        'min_price' => $rule->min_price,
        'max_price' => $rule->max_price,
        'margin'    => 800,
    ])->assertRedirect();

    expect((float) $rule->fresh()->margin)->toEqual(800.0);
});

test('updating a rule clears cache', function () {
    $rule = MarginRule::factory()->create();
    cache()->put('margin_rules_all', [['min_price' => 0, 'max_price' => null, 'margin' => 99]], 3600);

    $this->actingAs(adminMargin())->patch("/margin-rules/{$rule->id}", [
        'min_price' => $rule->min_price,
        'max_price' => $rule->max_price,
        'margin'    => 1000,
    ]);

    expect(cache()->has('margin_rules_all'))->toBeFalse();
});

// ─── delete ───────────────────────────────────────────────────────────────────

test('admin can delete margin rule', function () {
    $rule = MarginRule::factory()->create();

    $this->actingAs(adminMargin())->delete("/margin-rules/{$rule->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('margin_rules', ['id' => $rule->id]);
});

test('deleting a rule clears cache', function () {
    $rule = MarginRule::factory()->create();
    cache()->put('margin_rules_all', [['min_price' => 0, 'max_price' => null, 'margin' => 99]], 3600);

    $this->actingAs(adminMargin())->delete("/margin-rules/{$rule->id}");

    expect(cache()->has('margin_rules_all'))->toBeFalse();
});

test('cashier cannot delete margin rule', function () {
    $rule = MarginRule::factory()->create();

    $this->actingAs(User::factory()->cashier()->create())->delete("/margin-rules/{$rule->id}")
        ->assertStatus(403);
});
