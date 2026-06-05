<?php

// Registration is intentionally disabled — accounts are created by admin only.

test('registration screen is not available', function () {
    $this->get('/register')->assertStatus(404);
});

test('registration endpoint is not available', function () {
    $this->post('/register', [
        'name'                  => 'Test User',
        'email'                 => 'test@example.com',
        'password'              => 'password',
        'password_confirmation' => 'password',
    ])->assertStatus(404);

    $this->assertGuest();
});
