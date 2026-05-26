<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Seller;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Users
        User::create([
            'name' => 'Admin Kantin',
            'email' => 'admin@canteen.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Kasir Kantin',
            'email' => 'cashier@canteen.com',
            'password' => Hash::make('password'),
            'role' => 'cashier',
        ]);

        // 2. Seed Categories
        $makanan = Category::create([
            'name' => 'Makanan Utama',
            'slug' => 'makanan-utama',
        ]);

        $minuman = Category::create([
            'name' => 'Minuman',
            'slug' => 'minuman',
        ]);

        $snack = Category::create([
            'name' => 'Snack / Jajanan',
            'slug' => 'snack-jajanan',
        ]);

        // 3. Seed Sellers (Penitip)
        $budi = Seller::create([
            'name' => 'Budi Setiawan',
            'class' => 'XI RPL 1',
            'phone' => '081234567890',
            'is_active' => true,
        ]);

        $ani = Seller::create([
            'name' => 'Ani Wijaya',
            'class' => 'X DKV 2',
            'phone' => '089876543210',
            'is_active' => true,
        ]);

        $cici = Seller::create([
            'name' => 'Cici Paramida',
            'class' => 'XII OTKP 3',
            'phone' => '085678901234',
            'is_active' => true,
        ]);

        // 4. Seed Products
        // Kantin Products (own stock)
        Product::create([
            'category_id' => $makanan->id,
            'seller_id' => null,
            'name' => 'Nasi Goreng Kantin',
            'code' => 'K001',
            'type' => 'kantin',
            'cost_price' => 8000,
            'selling_price' => 10000,
            'stock' => 20,
        ]);

        Product::create([
            'category_id' => $minuman->id,
            'seller_id' => null,
            'name' => 'Es Teh Manis',
            'code' => 'K002',
            'type' => 'kantin',
            'cost_price' => 2000,
            'selling_price' => 3000,
            'stock' => 50,
        ]);

        Product::create([
            'category_id' => $makanan->id,
            'seller_id' => null,
            'name' => 'Mie Goreng Kantin',
            'code' => 'K003',
            'type' => 'kantin',
            'cost_price' => 5000,
            'selling_price' => 7000,
            'stock' => 15,
        ]);

        // Siswa Products (Consigned)
        // Auto-calculates selling_price to cost_price + 500 in Product boot() saving event.
        Product::create([
            'category_id' => $snack->id,
            'seller_id' => $budi->id,
            'name' => 'Keripik Singkong Budi',
            'code' => 'T001',
            'type' => 'siswa',
            'cost_price' => 1500, // selling_price should be 2000
            'stock' => 12,
        ]);

        Product::create([
            'category_id' => $snack->id,
            'seller_id' => $ani->id,
            'name' => 'Lemper Ayam Ani',
            'code' => null, // Test auto-generation (should become KDE-0005 or similar)
            'type' => 'siswa',
            'cost_price' => 1000, // selling_price should be 1500
            'stock' => 25,
        ]);

        Product::create([
            'category_id' => $snack->id,
            'seller_id' => $cici->id,
            'name' => 'Risol Mayo Cici',
            'code' => 'T003',
            'type' => 'siswa',
            'cost_price' => 2000, // selling_price should be 2500
            'stock' => 30,
        ]);
    }
}
