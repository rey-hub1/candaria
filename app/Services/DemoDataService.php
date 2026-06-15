<?php

namespace App\Services;

use App\Models\Cashbook;
use App\Models\Category;
use App\Models\Consignment;
use App\Models\MarginRule;
use App\Models\MarketplaceCategory;
use App\Models\Product;
use App\Models\Seller;
use App\Models\Setting;
use App\Models\Student;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use App\Models\Vendor;
use Carbon\Carbon;
use Database\Seeders\FeatureFlagSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

/**
 * Reset & isi ulang data demo pada 3 tingkat volume: none / minimal / full.
 * Akun login inti (admin/kasir/super admin), feature flag, margin rule, kategori,
 * dan kategori marketplace SELALU dipertahankan/dipastikan ada.
 */
class DemoDataService
{
    public const LEVELS = ['none', 'minimal', 'full'];

    public const SETTING_KEY = 'demo_data_level';

    /** Tabel data demo/transaksional yang dibersihkan saat reset (urutan aman FK). */
    private const DEMO_TABLES = [
        'order_item_options', 'order_status_histories', 'order_items', 'orders',
        'vendor_ledgers', 'vendor_settlements', 'menu_options', 'menu_option_groups',
        'menu_items', 'vendors', 'students',
        'transaction_items', 'transactions', 'seller_settlements', 'consignments',
        'cashbooks', 'products', 'sellers', 'notifications', 'activity_logs',
    ];

    private function preset(string $level): array
    {
        return [
            'minimal' => [
                'sellers' => 2, 'kantin' => 3, 'siswa' => 3,
                'txnDays' => 2, 'maxTxnPerDay' => 3,
                'vendors' => 1, 'students' => 2, 'ordersPerStudent' => 1,
            ],
            'full' => [
                'sellers' => 8, 'kantin' => 7, 'siswa' => 7,
                'txnDays' => 14, 'maxTxnPerDay' => 10,
                'vendors' => 3, 'students' => 4, 'ordersPerStudent' => 2,
            ],
        ][$level];
    }

    public static function currentLevel(): string
    {
        $level = Setting::get(self::SETTING_KEY, 'full');

        return in_array($level, self::LEVELS, true) ? $level : 'full';
    }

    public function apply(string $level): void
    {
        abort_unless(in_array($level, self::LEVELS, true), 422);

        DB::transaction(function () use ($level) {
            $this->wipe();
            $this->ensureEssentials();

            if ($level !== 'none') {
                $preset = $this->preset($level);
                $this->seedCanteen($preset);
                $this->seedMarketplace($preset);
            }
        });

        Setting::set(self::SETTING_KEY, $level);
    }

    private function wipe(): void
    {
        Schema::disableForeignKeyConstraints();

        foreach (self::DEMO_TABLES as $table) {
            DB::table($table)->delete();
        }

        // Hapus akun login demo (penitip/vendor/student); sisakan staf inti.
        DB::table('users')->whereIn('role', ['penitip', 'vendor', 'student'])->delete();

        Schema::enableForeignKeyConstraints();
    }

    private function ensureEssentials(): void
    {
        (new FeatureFlagSeeder())->run();

        $this->staffUser('Admin Kantin', 'admin@canteen.com', 'admin');
        $this->staffUser('Kasir Kantin', 'cashier@canteen.com', 'cashier');
        $this->staffUser('Super Admin', 'superadmin@candaria.com', 'super_admin');

        if (MarginRule::count() === 0) {
            foreach ([
                ['min_price' => 0, 'max_price' => 2000, 'margin' => 500],
                ['min_price' => 2001, 'max_price' => 5000, 'margin' => 1000],
                ['min_price' => 5001, 'max_price' => null, 'margin' => 2000],
            ] as $rule) {
                MarginRule::create($rule);
            }
            cache()->forget('margin_rules_all');
        }

        $this->ensureCanteenCategories();
        $this->ensureMarketplaceCategories();
    }

    private function staffUser(string $name, string $email, string $role): User
    {
        return User::firstOrCreate(
            ['email' => $email],
            ['name' => $name, 'password' => Hash::make('password'), 'role' => $role]
        );
    }

    private function ensureCanteenCategories(): void
    {
        $categories = [
            ['name' => 'Makanan Utama', 'slug' => 'makanan-utama', 'code' => 'a', 'prefix' => 'A'],
            ['name' => 'Minuman', 'slug' => 'minuman', 'code' => 'i', 'prefix' => 'I'],
            ['name' => 'Snack / Jajanan', 'slug' => 'snack-jajanan', 'code' => 's', 'prefix' => 'S'],
            ['name' => 'Roti & Kue', 'slug' => 'roti-kue', 'code' => 'r', 'prefix' => 'R'],
        ];

        foreach ($categories as $data) {
            Category::firstOrCreate(['slug' => $data['slug']], $data);
        }
    }

    private function ensureMarketplaceCategories(): void
    {
        if (MarketplaceCategory::count() > 0) {
            return;
        }

        $defaults = [
            'vendor' => ['Makanan Berat', 'Minuman', 'Snack'],
            'menu' => ['Makanan Berat', 'Minuman', 'Snack', 'Dessert'],
        ];

        foreach ($defaults as $type => $names) {
            foreach ($names as $i => $name) {
                MarketplaceCategory::create([
                    'type' => $type, 'name' => $name, 'is_active' => true, 'sort_order' => $i,
                ]);
            }
        }
    }

    // ---------------------------------------------------------------- Canteen

    private function seedCanteen(array $preset): void
    {
        $admin = User::where('email', 'admin@canteen.com')->first();
        $categories = Category::pluck('id', 'slug');

        $sellers = $this->seedSellers($preset['sellers']);
        $this->seedProducts($preset, $categories, $sellers);
        $this->seedConsignments($sellers);
        $this->seedTransactions($preset, $admin);

        // Pastikan stok tersedia di kasir setelah simulasi penjualan.
        Product::query()->update(['stock' => 100]);
    }

    private function seedSellers(int $count): array
    {
        $pool = [
            ['name' => 'Budi Setiawan', 'class' => 'XI RPL 1', 'phone' => '081234567890'],
            ['name' => 'Ani Wijaya', 'class' => 'X DKV 2', 'phone' => '089876543210'],
            ['name' => 'Cici Paramida', 'class' => 'XII OTKP 3', 'phone' => '085678901234'],
            ['name' => 'Dedi Pratama', 'class' => 'XI RPL 2', 'phone' => '081233445566'],
            ['name' => 'Eka Saputra', 'class' => 'X PPLG 1', 'phone' => '081399887766'],
            ['name' => 'Fitri Handayani', 'class' => 'XII AKL 1', 'phone' => '087766554433'],
            ['name' => 'Gilang Ramadhan', 'class' => 'XI TJKT 2', 'phone' => '085211223344'],
            ['name' => 'Hesti Lestari', 'class' => 'X DKV 1', 'phone' => '089988776655'],
        ];

        $sellers = [];
        foreach (array_slice($pool, 0, $count) as $data) {
            $sellers[] = Seller::create(array_merge($data, ['is_active' => true]));
            User::firstOrCreate(
                ['phone' => $data['phone']],
                ['name' => $data['name'], 'password' => Hash::make('candaria123'), 'role' => 'penitip']
            );
        }

        return $sellers;
    }

    private function seedProducts(array $preset, $categories, array $sellers): void
    {
        $kantin = [
            ['cat' => 'makanan-utama', 'name' => 'Nasi Goreng Kantin', 'cost' => 8000, 'sell' => 10000],
            ['cat' => 'makanan-utama', 'name' => 'Mie Goreng Spesial', 'cost' => 7000, 'sell' => 9000],
            ['cat' => 'makanan-utama', 'name' => 'Nasi Ayam Geprek', 'cost' => 9000, 'sell' => 12000],
            ['cat' => 'minuman', 'name' => 'Es Teh Manis', 'cost' => 2000, 'sell' => 3000],
            ['cat' => 'minuman', 'name' => 'Air Mineral Botol', 'cost' => 2500, 'sell' => 4000],
            ['cat' => 'minuman', 'name' => 'Jus Jeruk Segar', 'cost' => 4000, 'sell' => 6000],
            ['cat' => 'snack-jajanan', 'name' => 'Kentang Goreng', 'cost' => 4000, 'sell' => 6000],
        ];

        foreach (array_slice($kantin, 0, $preset['kantin']) as $p) {
            Product::create([
                'category_id' => $categories[$p['cat']],
                'seller_id' => null,
                'name' => $p['name'],
                'type' => 'kantin',
                'cost_price' => $p['cost'],
                'selling_price' => $p['sell'],
                'stock' => 100,
                'image' => $this->demoImage($p['cat']),
            ]);
        }

        $siswa = [
            ['cat' => 'snack-jajanan', 'name' => 'Keripik Singkong', 'cost' => 1500],
            ['cat' => 'roti-kue', 'name' => 'Dadar Gulung', 'cost' => 1500],
            ['cat' => 'snack-jajanan', 'name' => 'Risol Mayo', 'cost' => 2000],
            ['cat' => 'roti-kue', 'name' => 'Lemper Ayam', 'cost' => 2000],
            ['cat' => 'snack-jajanan', 'name' => 'Donat Gula', 'cost' => 2500],
            ['cat' => 'roti-kue', 'name' => 'Brownies Coklat', 'cost' => 5000],
            ['cat' => 'snack-jajanan', 'name' => 'Cireng Bumbu', 'cost' => 1000],
        ];

        if (empty($sellers)) {
            return;
        }

        foreach (array_slice($siswa, 0, $preset['siswa']) as $i => $p) {
            Product::create([
                'category_id' => $categories[$p['cat']],
                'seller_id' => $sellers[$i % count($sellers)]->id,
                'name' => $p['name'],
                'type' => 'siswa',
                'cost_price' => $p['cost'],
                'stock' => 80,
                'image' => $this->demoImage($p['cat']),
            ]);
        }
    }

    private function seedConsignments(array $sellers): void
    {
        foreach (Product::where('type', 'siswa')->get() as $product) {
            Consignment::create([
                'seller_id' => $product->seller_id,
                'product_id' => $product->id,
                'type' => 'in',
                'quantity' => rand(40, 60),
                'date' => Carbon::now()->subDays(20)->toDateString(),
                'notes' => 'Penerimaan awal titipan',
            ]);
        }
    }

    private function seedTransactions(array $preset, ?User $admin): void
    {
        $products = Product::all();
        $users = User::whereIn('role', ['admin', 'cashier'])->get();

        if ($products->isEmpty() || $users->isEmpty()) {
            return;
        }

        $index = 1;

        for ($d = $preset['txnDays']; $d >= 0; $d--) {
            $date = Carbon::now()->subDays($d);
            $count = $date->isWeekend() ? rand(1, 2) : rand(1, $preset['maxTxnPerDay']);

            for ($t = 0; $t < $count; $t++) {
                $items = $products->random(rand(1, min(3, $products->count())));
                $total = 0;
                $itemsData = [];

                foreach ($items as $product) {
                    $qty = rand(1, 3);
                    $total += $product->selling_price * $qty;
                    $itemsData[] = [
                        'product' => $product,
                        'qty' => $qty,
                        'profit_kantin' => ($product->selling_price - $product->cost_price) * $qty,
                        'profit_seller' => $product->type === 'siswa' ? $product->cost_price * $qty : 0,
                    ];
                }

                $paid = (int) (ceil($total / 1000) * 1000);
                $time = $date->copy()->setTime(rand(7, 15), rand(0, 59));
                $code = str_pad((string) $index++, 6, '0', STR_PAD_LEFT);

                $transaction = Transaction::create([
                    'transaction_code' => $code,
                    'user_id' => $users->random()->id,
                    'total_amount' => $total,
                    'paid_amount' => $paid,
                    'change_amount' => $paid - $total,
                    'created_at' => $time,
                    'updated_at' => $time,
                ]);

                foreach ($itemsData as $item) {
                    TransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $item['product']->id,
                        'quantity' => $item['qty'],
                        'cost_price' => $item['product']->cost_price,
                        'selling_price' => $item['product']->selling_price,
                        'profit_kantin' => $item['profit_kantin'],
                        'profit_seller' => $item['profit_seller'],
                        'created_at' => $time,
                        'updated_at' => $time,
                    ]);
                }

                Cashbook::create([
                    'date' => $time->toDateString(),
                    'description' => 'Penjualan #'.$code,
                    'type' => 'debit',
                    'amount' => $total,
                    'source' => 'transaction',
                    'reference_id' => $transaction->id,
                    'user_id' => $admin?->id,
                    'created_at' => $time,
                    'updated_at' => $time,
                ]);
            }
        }
    }

    // ------------------------------------------------------------ Marketplace

    private function seedMarketplace(array $preset): void
    {
        $vendors = $this->seedVendors($preset['vendors']);
        $students = $this->seedStudents($preset['students']);
        $this->seedOrders($preset, $vendors, $students);
    }

    private function seedVendors(int $count): array
    {
        $pool = [
            [
                'name' => 'Warung Bu Sari', 'category' => 'Makanan Berat',
                'menu' => [
                    ['name' => 'Nasi Goreng Spesial', 'price' => 12000, 'category' => 'Makanan Berat'],
                    ['name' => 'Mie Ayam', 'price' => 10000, 'category' => 'Makanan Berat'],
                    ['name' => 'Es Teh Manis', 'price' => 4000, 'category' => 'Minuman'],
                ],
            ],
            [
                'name' => 'Kedai Kopi Pak Andi', 'category' => 'Minuman',
                'menu' => [
                    ['name' => 'Es Kopi Susu', 'price' => 8000, 'category' => 'Minuman'],
                    ['name' => 'Teh Tarik', 'price' => 6000, 'category' => 'Minuman'],
                    ['name' => 'Roti Bakar Coklat', 'price' => 9000, 'category' => 'Snack'],
                ],
            ],
            [
                'name' => 'Snack Corner', 'category' => 'Snack',
                'menu' => [
                    ['name' => 'Batagor Isi 5', 'price' => 10000, 'category' => 'Snack'],
                    ['name' => 'Cireng Rujak', 'price' => 7000, 'category' => 'Snack'],
                    ['name' => 'Puding Coklat', 'price' => 5000, 'category' => 'Dessert'],
                ],
            ],
        ];

        $vendors = [];
        foreach (array_slice($pool, 0, $count) as $i => $data) {
            $user = User::create([
                'name' => $data['name'],
                // Vendor pertama pakai email stabil 'mitra@candaria.com' agar cocok
                // dengan tombol "Akun pengujian cepat" di halaman login.
                'email' => $i === 0 ? 'mitra@candaria.com' : 'mitra'.($i + 1).'@candaria.com',
                'password' => Hash::make('password'),
                'role' => 'vendor',
            ]);

            $vendor = Vendor::create([
                'user_id' => $user->id,
                'name' => $data['name'],
                'description' => 'Mitra demo '.$data['name'].'.',
                'category' => $data['category'],
                'status' => 'active',
                'phone' => '08120000000'.$i,
                'is_open' => true,
                'joined_at' => now(),
                'logo' => $this->demoImage('vendor'),
            ]);

            foreach ($data['menu'] as $menu) {
                $vendor->menuItems()->create(array_merge($menu, [
                    'is_active' => true,
                    'image' => $this->demoImage($menu['category']),
                ]));
            }

            $vendors[] = $vendor;
        }

        return $vendors;
    }

    private function seedStudents(int $count): array
    {
        $pool = [
            ['nisn' => '0011223344', 'name' => 'Siswa Uji Coba 1', 'class' => 'X RPL 1', 'birth_date' => '2009-05-12', 'must_change_password' => false],
            ['nisn' => '0011223355', 'name' => 'Siswa Uji Coba 2', 'class' => 'XI TKJ 2', 'birth_date' => '2008-11-30', 'must_change_password' => true],
            ['nisn' => '0011223366', 'name' => 'Siswa Uji Coba 3', 'class' => 'X DKV 1', 'birth_date' => '2009-08-21', 'must_change_password' => false],
            ['nisn' => '0011223377', 'name' => 'Siswa Uji Coba 4', 'class' => 'XII RPL 2', 'birth_date' => '2007-02-09', 'must_change_password' => false],
        ];

        $students = [];
        foreach (array_slice($pool, 0, $count) as $data) {
            $birthDate = Carbon::parse($data['birth_date']);

            $user = User::create([
                'name' => $data['name'],
                'email' => null,
                'password' => Hash::make(Student::generateDefaultPassword($birthDate)),
                'role' => 'student',
            ]);

            $students[] = Student::create([
                'user_id' => $user->id,
                'nisn' => $data['nisn'],
                'name' => $data['name'],
                'class' => $data['class'],
                'birth_date' => $birthDate,
                'must_change_password' => $data['must_change_password'],
            ]);
        }

        return $students;
    }

    private function seedOrders(array $preset, array $vendors, array $students): void
    {
        if (empty($vendors) || empty($students)) {
            return;
        }

        $statuses = ['delivered', 'pending', 'preparing', 'ready'];
        $s = 0;

        foreach ($students as $student) {
            $vendor = $vendors[$s % count($vendors)];
            $menu = $vendor->menuItems()->where('is_active', true)->get();
            if ($menu->isEmpty()) {
                continue;
            }

            for ($o = 0; $o < $preset['ordersPerStudent']; $o++) {
                $picked = $menu->random(min(2, $menu->count()));
                $subtotal = 0;
                $lines = [];

                foreach ($picked as $item) {
                    $qty = rand(1, 2);
                    $subtotal += $item->price * $qty;
                    $lines[] = ['item' => $item, 'qty' => $qty];
                }

                $order = $vendor->orders()->create([
                    'student_id' => $student->user_id,
                    'delivery_slot' => $o % 2 === 0 ? '09:00' : '12:00',
                    'delivery_date' => now()->toDateString(),
                    'status' => $statuses[($s + $o) % count($statuses)],
                    'subtotal' => $subtotal,
                    'total' => $subtotal,
                    'payment_method' => 'cash',
                    'payment_status' => 'unpaid',
                ]);

                foreach ($lines as $line) {
                    $order->items()->create([
                        'menu_item_id' => $line['item']->id,
                        'name_snapshot' => $line['item']->name,
                        'price_snapshot' => $line['item']->price,
                        'qty' => $line['qty'],
                        'subtotal' => $line['item']->price * $line['qty'],
                    ]);
                }
            }

            $s++;
        }
    }

    // ----------------------------------------------------------- Local images

    /** Peta kategori → [emoji, warna latar] untuk placeholder gambar lokal. */
    private const IMAGE_STYLES = [
        'makanan-utama' => ['🍛', '#ea580c'],
        'minuman' => ['🥤', '#0284c7'],
        'snack-jajanan' => ['🍟', '#d97706'],
        'roti-kue' => ['🍰', '#db2777'],
        'Makanan Berat' => ['🍱', '#ea580c'],
        'Minuman' => ['🥤', '#0284c7'],
        'Snack' => ['🍢', '#d97706'],
        'Dessert' => ['🍮', '#db2777'],
        'vendor' => ['🏪', '#475569'],
        'default' => ['🍽️', '#64748b'],
    ];

    /**
     * Pastikan placeholder SVG lokal untuk sebuah kategori ada di disk public,
     * kembalikan path relatif (dipakai accessor image_url: asset('storage/'.$path)).
     * SVG digenerate tanpa jaringan — cepat & deterministik. Satu berkas per
     * kategori (emoji di atas warna latar), dipakai bersama oleh item sekategori.
     */
    private function demoImage(string $key): string
    {
        [$emoji, $bg] = self::IMAGE_STYLES[$key] ?? self::IMAGE_STYLES['default'];
        $slug = preg_replace('/[^a-z0-9]+/', '-', strtolower($key));
        $path = "demo/{$slug}.svg";

        if (! Storage::disk('public')->exists($path)) {
            $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">'
                .'<rect width="400" height="400" fill="'.$bg.'"/>'
                .'<text x="200" y="200" font-size="190" text-anchor="middle" dominant-baseline="central">'.$emoji.'</text>'
                .'</svg>';
            Storage::disk('public')->put($path, $svg);
        }

        return $path;
    }
}
