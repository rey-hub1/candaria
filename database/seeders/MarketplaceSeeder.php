<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MarketplaceSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::firstOrCreate(
            ['email' => 'mitra@candaria.com'],
            ['name' => 'Mitra Demo', 'password' => Hash::make('password'), 'role' => 'vendor']
        );

        $vendor = Vendor::firstOrCreate(
            ['user_id' => $owner->id],
            [
                'name' => 'Warung Bu Sari',
                'description' => 'Aneka makanan rumahan & minuman segar.',
                'category' => 'Makanan Berat',
                'status' => 'active',
                'phone' => '081200000000',
                'is_open' => true,
                'joined_at' => now(),
            ]
        );

        if ($vendor->menuItems()->count() > 0) {
            return;
        }

        $vendor->menuItems()->createMany([
            [
                'name' => 'Nasi Goreng Spesial',
                'description' => 'Nasi goreng dengan telur dan ayam suwir.',
                'price' => 12000,
                'category' => 'Makanan Berat',
                'is_active' => true,
            ],
            [
                'name' => 'Mie Ayam',
                'description' => 'Mie ayam dengan pangsit goreng.',
                'price' => 10000,
                'category' => 'Makanan Berat',
                'is_active' => true,
            ],
            [
                'name' => 'Es Teh Manis',
                'price' => 4000,
                'category' => 'Minuman',
                'is_active' => true,
            ],
        ]);
    }
}
