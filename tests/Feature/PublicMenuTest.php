<?php

use App\Models\FeatureFlag;
use Illuminate\Support\Facades\Cache;

test('landing & menu publik tampil saat flag public_menu nyala', function () {
    // beforeEach global sudah menyalakan public_menu.
    $this->get('/')->assertOk();
    $this->get('/menu')->assertOk();
});

test('flag public_menu mati: landing redirect login, menu 404', function () {
    FeatureFlag::updateOrCreate(['key' => 'public_menu'], ['is_enabled' => false, 'label' => 'public_menu']);
    Cache::flush();

    $this->get('/')->assertRedirect(route('login'));
    $this->get('/menu')->assertNotFound();
});
