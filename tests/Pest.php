<?php

use App\Models\FeatureFlag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
 * Feature flag default fail-closed (lihat FeatureFlag::enabled): flag yang
 * belum di-seed → OFF. Aktifkan semua flag sebelum tiap test supaya gate
 * middleware tetap diuji jujur tanpa mengandalkan default lama (fail-open).
 * Test yang memang menguji "flag mati" tinggal meng-override setelah ini.
 */
uses()->beforeEach(function () {
    Cache::flush();

    foreach ([
        'cashbook', 'public_menu', 'force_password_change', 'marketplace', 'marketplace_orders',
        'vendor_self_register', 'student_login', 'payment_qris', 'vendor_wallet',
        'order_slot_09', 'order_slot_12',
    ] as $key) {
        FeatureFlag::updateOrCreate(['key' => $key], ['is_enabled' => true, 'label' => $key]);
    }
})->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function something()
{
    // ..
}
