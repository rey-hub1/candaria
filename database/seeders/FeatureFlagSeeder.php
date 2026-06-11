<?php

namespace Database\Seeders;

use App\Models\FeatureFlag;
use Illuminate\Database\Seeder;

class FeatureFlagSeeder extends Seeder
{
    public function run(): void
    {
        $flags = [
            ['key' => 'marketplace', 'label' => 'Marketplace Mitra', 'description' => 'Modul pedagang afiliasi & jajan online untuk siswa.', 'group' => 'marketplace', 'is_enabled' => false],
            ['key' => 'marketplace_orders', 'label' => 'Pemesanan Marketplace', 'description' => 'Siswa bisa membuat pesanan baru di marketplace.', 'group' => 'marketplace', 'is_enabled' => true],
            ['key' => 'vendor_self_register', 'label' => 'Pendaftaran Mandiri Mitra', 'description' => 'Mitra bisa mendaftar sendiri tanpa dibuatkan admin.', 'group' => 'marketplace', 'is_enabled' => false],
            ['key' => 'student_login', 'label' => 'Login Siswa (NISN)', 'description' => 'Siswa bisa login menggunakan NISN & tanggal lahir.', 'group' => 'marketplace', 'is_enabled' => true],
            ['key' => 'payment_qris', 'label' => 'Pembayaran QRIS', 'description' => 'Pembayaran QRIS untuk pesanan marketplace.', 'group' => 'marketplace', 'is_enabled' => false],
            ['key' => 'vendor_wallet', 'label' => 'Saldo Mitra', 'description' => 'Modul saldo & pencairan untuk mitra.', 'group' => 'marketplace', 'is_enabled' => true],
            ['key' => 'order_slot_09', 'label' => 'Slot Antar 09:00', 'description' => 'Slot pengantaran pesanan jam 09:00.', 'group' => 'marketplace', 'is_enabled' => true],
            ['key' => 'order_slot_12', 'label' => 'Slot Antar 12:00', 'description' => 'Slot pengantaran pesanan jam 12:00.', 'group' => 'marketplace', 'is_enabled' => true],
        ];

        foreach ($flags as $flag) {
            FeatureFlag::updateOrCreate(['key' => $flag['key']], $flag);
        }
    }
}
