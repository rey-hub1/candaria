<?php

namespace Tests\Feature;

use App\Models\Seller;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PenitipAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_penitip_can_login_with_phone_number()
    {
        // 1. Create a user representing a penitip
        $user = User::factory()->create([
            'name' => 'Budi Penitip',
            'phone' => '081234567890',
            'role' => 'penitip',
            'password' => Hash::make('candaria123'),
        ]);

        // 2. Try to login using the phone number
        $response = $this->post('/login', [
            'login' => '081234567890',
            'password' => 'candaria123',
        ]);

        // 3. Assert successful login and redirection
        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_penitip_account_automatically_created_when_seller_created()
    {
        // 1. Login as admin
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        // 2. Submit new seller data
        $response = $this->post('/sellers', [
            'name' => 'Siswa Baru',
            'class' => 'X MIPA 1',
            'phone' => '089911223344',
        ]);

        $response->assertRedirect(route('sellers.index'));

        // 3. Assert seller is in database
        $this->assertDatabaseHas('sellers', [
            'name' => 'Siswa Baru',
            'phone' => '089911223344',
        ]);

        // 4. Assert user account is created with correct phone
        $this->assertDatabaseHas('users', [
            'name' => 'Siswa Baru',
            'phone' => '089911223344',
            'role' => 'penitip',
        ]);
    }
}
