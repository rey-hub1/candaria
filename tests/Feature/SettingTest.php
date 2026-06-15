<?php

use App\Models\Setting;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin']);
});

test('admin can view settings page', function () {
    Setting::set('admin_whatsapp', '628123456789');
    Setting::set('keyboard_default_mode', 'full');

    $this->actingAs($this->admin)
        ->get(route('settings.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Settings/Index')
            ->where('settings.admin_whatsapp', '628123456789')
            ->where('settings.keyboard_default_mode', 'full')
        );
});

test('admin can update settings with whatsapp number normalization', function () {
    $payload = [
        'admin_whatsapp' => '08123456789', // Starts with 0
        'keyboard_default_mode' => 'prefix',
    ];

    $this->actingAs($this->admin)
        ->put(route('settings.update'), $payload)
        ->assertRedirect()
        ->assertSessionHas('success');

    // Assert normalized to 62...
    expect(Setting::get('admin_whatsapp'))->toBe('628123456789');
    expect(Setting::get('keyboard_default_mode'))->toBe('prefix');
});

test('admin can update settings with non-digit stripping', function () {
    $payload = [
        'admin_whatsapp' => '+62 812-3456-789', // Has non-digits
        'keyboard_default_mode' => 'full',
    ];

    $this->actingAs($this->admin)
        ->put(route('settings.update'), $payload)
        ->assertRedirect()
        ->assertSessionHas('success');

    // Assert stripped non-digits
    expect(Setting::get('admin_whatsapp'))->toBe('628123456789');
    expect(Setting::get('keyboard_default_mode'))->toBe('full');
});

test('validation fails for invalid keyboard mode', function () {
    $payload = [
        'admin_whatsapp' => '08123456789',
        'keyboard_default_mode' => 'invalid_mode', // should be full or prefix
    ];

    $this->actingAs($this->admin)
        ->put(route('settings.update'), $payload)
        ->assertSessionHasErrors('keyboard_default_mode');
});
