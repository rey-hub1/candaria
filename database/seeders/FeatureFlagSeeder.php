<?php

namespace Database\Seeders;

use App\Models\FeatureFlag;
use Illuminate\Database\Seeder;

class FeatureFlagSeeder extends Seeder
{
    public function run(): void
    {
        $flags = [
            ['key' => 'cashbook', 'label' => 'Mutasi & Buku Kas', 'description' => 'Modul mutasi saldo & buku kas admin.', 'group' => 'general', 'is_enabled' => true],

            // Default (fresh build/clone) = Template V1: semua fitur mati.
            ['key' => 'marketplace', 'label' => 'Marketplace Mitra', 'description' => 'Modul pedagang afiliasi & jajan online untuk siswa.', 'group' => 'marketplace', 'is_enabled' => false],
            ['key' => 'marketplace_orders', 'label' => 'Pemesanan Marketplace', 'description' => 'Siswa bisa membuat pesanan baru di marketplace.', 'group' => 'marketplace', 'is_enabled' => false],
            ['key' => 'vendor_self_register', 'label' => 'Pendaftaran Mandiri Mitra', 'description' => 'Mitra bisa mendaftar sendiri tanpa dibuatkan admin.', 'group' => 'marketplace', 'is_enabled' => false],
            ['key' => 'student_login', 'label' => 'Login Siswa (NISN)', 'description' => 'Siswa bisa login menggunakan NISN & tanggal lahir.', 'group' => 'marketplace', 'is_enabled' => false],
            ['key' => 'payment_qris', 'label' => 'Pembayaran QRIS', 'description' => 'Pembayaran QRIS untuk pesanan marketplace.', 'group' => 'marketplace', 'is_enabled' => false],
            ['key' => 'vendor_wallet', 'label' => 'Saldo Mitra', 'description' => 'Modul saldo & pencairan untuk mitra.', 'group' => 'marketplace', 'is_enabled' => false],
            ['key' => 'order_slot_09', 'label' => 'Slot Antar 09:00', 'description' => 'Slot pengantaran pesanan jam 09:00.', 'group' => 'marketplace', 'is_enabled' => false],
            ['key' => 'order_slot_12', 'label' => 'Slot Antar 12:00', 'description' => 'Slot pengantaran pesanan jam 12:00.', 'group' => 'marketplace', 'is_enabled' => false],
        ];

        foreach ($flags as $flag) {
            $attributes = [
                'label' => $flag['label'],
                'description' => $flag['description'],
                'group' => $flag['group'],
            ];

            // is_enabled hanya di-set saat baris baru dibuat (default V1 = mati).
            // Flag yang sudah ada: metadata diperbarui, TAPI is_enabled tidak ditimpa
            // supaya setelan admin tidak hilang saat reseed / reset demo-data.
            if (! FeatureFlag::where('key', $flag['key'])->exists()) {
                $attributes['is_enabled'] = $flag['is_enabled'];
            }

            FeatureFlag::updateOrCreate(['key' => $flag['key']], $attributes);
        }
    }
}
