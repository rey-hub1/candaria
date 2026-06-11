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
                'category' => 'makanan_berat',
                'status' => 'active',
                'phone' => '081200000000',
                'is_open' => true,
                'joined_at' => now(),
            ]
        );

        if ($vendor->menuItems()->count() > 0) {
            return;
        }

        $nasiGoreng = $vendor->menuItems()->create([
            'name' => 'Nasi Goreng Spesial',
            'description' => 'Nasi goreng dengan telur dan ayam suwir.',
            'price' => 12000,
            'category' => 'Makanan Berat',
            'is_active' => true,
        ]);

        $levelGroup = $nasiGoreng->optionGroups()->create([
            'name' => 'Level Pedas',
            'type' => 'single',
            'is_required' => true,
            'min_select' => 1,
            'max_select' => 1,
            'sort_order' => 1,
        ]);
        $levelGroup->options()->createMany([
            ['name' => 'Tidak Pedas', 'price_delta' => 0, 'is_default' => true, 'sort_order' => 1],
            ['name' => 'Pedas Sedang', 'price_delta' => 0, 'sort_order' => 2],
            ['name' => 'Pedas Sekali', 'price_delta' => 0, 'sort_order' => 3],
        ]);

        $toppingGroup = $nasiGoreng->optionGroups()->create([
            'name' => 'Tambahan',
            'type' => 'multiple',
            'is_required' => false,
            'min_select' => 0,
            'max_select' => 2,
            'sort_order' => 2,
        ]);
        $toppingGroup->options()->createMany([
            ['name' => 'Telur Ceplok', 'price_delta' => 3000, 'sort_order' => 1],
            ['name' => 'Sosis', 'price_delta' => 4000, 'sort_order' => 2],
            ['name' => 'Kerupuk', 'price_delta' => 1000, 'sort_order' => 3],
        ]);

        $vendor->menuItems()->create([
            'name' => 'Mie Ayam',
            'description' => 'Mie ayam dengan pangsit goreng.',
            'price' => 10000,
            'category' => 'Makanan Berat',
            'is_active' => true,
        ]);

        $esTeh = $vendor->menuItems()->create([
            'name' => 'Es Teh Manis',
            'price' => 4000,
            'category' => 'Minuman',
            'is_active' => true,
        ]);

        $sizeGroup = $esTeh->optionGroups()->create([
            'name' => 'Ukuran',
            'type' => 'single',
            'is_required' => true,
            'min_select' => 1,
            'max_select' => 1,
            'sort_order' => 1,
        ]);
        $sizeGroup->options()->createMany([
            ['name' => 'Regular', 'price_delta' => 0, 'is_default' => true, 'sort_order' => 1],
            ['name' => 'Besar', 'price_delta' => 2000, 'sort_order' => 2],
        ]);
    }
}
