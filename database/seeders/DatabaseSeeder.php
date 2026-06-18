<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Seller;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\SellerSettlement;
use App\Models\MarginRule;
use App\Models\Consignment;
use App\Models\Cashbook;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 0. Feature Flags
        $this->call(FeatureFlagSeeder::class);
        $this->call(StudentSeeder::class);
        $this->call(MarketplaceSeeder::class);

        // 1. Margin Rules (must be before Product creation for siswa type)
        $marginRulesData = [
            ['min_price' => 0,    'max_price' => 2000,  'margin' => 500],
            ['min_price' => 2001, 'max_price' => 5000,  'margin' => 1000],
            ['min_price' => 5001, 'max_price' => null,  'margin' => 2000],
        ];
        foreach ($marginRulesData as $rule) {
            MarginRule::create($rule);
        }
        cache()->forget('margin_rules_all');

        // 2. Users
        $admin = User::create([
            'name'     => 'Admin Kantin',
            'email'    => 'admin@canteen.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        $cashier = User::create([
            'name'     => 'Kasir Kantin',
            'email'    => 'cashier@canteen.com',
            'password' => Hash::make('password'),
            'role'     => 'cashier',
        ]);

        User::create([
            'name'     => 'Pembina',
            'email'    => 'superadmin@candaria.com',
            'password' => Hash::make('password'),
            'role'     => 'super_admin',
        ]);

        // 3. Categories
        $categories = [
            'Makanan Utama'  => ['slug' => 'makanan-utama', 'code' => 'a', 'prefix' => 'A'],
            'Minuman'        => ['slug' => 'minuman',       'code' => 'i', 'prefix' => 'I'],
            'Snack / Jajanan'=> ['slug' => 'snack-jajanan', 'code' => 's', 'prefix' => 'S'],
            'Roti & Kue'     => ['slug' => 'roti-kue',      'code' => 'r', 'prefix' => 'R'],
        ];

        $categoryModels = [];
        foreach ($categories as $name => $data) {
            $categoryModels[$data['slug']] = Category::create([
                'name'   => $name,
                'slug'   => $data['slug'],
                'code'   => $data['code'],
                'prefix' => $data['prefix'],
            ]);
        }

        // 4. Sellers
        $sellersData = [
            ['name' => 'Budi Setiawan',    'class' => 'XI RPL 1',   'phone' => '081234567890'],
            ['name' => 'Ani Wijaya',        'class' => 'X DKV 2',    'phone' => '089876543210'],
            ['name' => 'Cici Paramida',     'class' => 'XII OTKP 3', 'phone' => '085678901234'],
            ['name' => 'Dedi Pratama',      'class' => 'XI RPL 2',   'phone' => '081233445566'],
            ['name' => 'Eka Saputra',       'class' => 'X PPLG 1',   'phone' => '081399887766'],
            ['name' => 'Fitri Handayani',   'class' => 'XII AKL 1',  'phone' => '087766554433'],
            ['name' => 'Gilang Ramadhan',   'class' => 'XI TJKT 2',  'phone' => '085211223344'],
            ['name' => 'Hesti Lestari',     'class' => 'X DKV 1',    'phone' => '089988776655'],
            ['name' => 'Indra Wijaya',      'class' => 'XII RPL 1',  'phone' => '081299001122'],
            ['name' => 'Julia Putri',       'class' => 'XI OTKP 1',  'phone' => '085611223344'],
        ];

        $sellerModels = [];
        foreach ($sellersData as $data) {
            $sellerModels[] = Seller::create(array_merge($data, ['is_active' => true]));

            // Akun login penitip — login via phone, password default candaria123.
            // (Mirror SellerController@store agar seller hasil seeder bisa login.)
            if (!empty($data['phone'])) {
                User::firstOrCreate(
                    ['phone' => $data['phone']],
                    [
                        'name'     => $data['name'],
                        'password' => Hash::make('candaria123'),
                        'role'     => 'penitip',
                    ]
                );
            }
        }

        // 5. Products (Kantin)
        $kantinProducts = [
            ['category' => 'makanan-utama', 'name' => 'Nasi Goreng Kantin', 'code' => 'a01', 'cost_price' => 8000,  'selling_price' => 10000, 'stock' => 150],
            ['category' => 'makanan-utama', 'name' => 'Mie Goreng Spesial', 'code' => 'a02', 'cost_price' => 7000,  'selling_price' => 9000,  'stock' => 100],
            ['category' => 'makanan-utama', 'name' => 'Nasi Ayam Geprek',   'code' => 'a03', 'cost_price' => 9000,  'selling_price' => 12000, 'stock' => 80],
            ['category' => 'minuman',       'name' => 'Es Teh Manis',        'code' => 'i01', 'cost_price' => 2000,  'selling_price' => 3000,  'stock' => 300],
            ['category' => 'minuman',       'name' => 'Air Mineral Botol',   'code' => 'i02', 'cost_price' => 2500,  'selling_price' => 4000,  'stock' => 200],
            ['category' => 'minuman',       'name' => 'Jus Jeruk Segar',     'code' => 'i03', 'cost_price' => 4000,  'selling_price' => 6000,  'stock' => 100],
            ['category' => 'snack-jajanan', 'name' => 'Kentang Goreng',      'code' => 's01', 'cost_price' => 4000,  'selling_price' => 6000,  'stock' => 70],
        ];

        foreach ($kantinProducts as $p) {
            Product::create([
                'category_id'   => $categoryModels[$p['category']]->id,
                'seller_id'     => null,
                'name'          => $p['name'],
                'code'          => $p['code'],
                'type'          => 'kantin',
                'cost_price'    => $p['cost_price'],
                'selling_price' => $p['selling_price'],
                'stock'         => $p['stock'],
                'image'         => $this->generateProductImage($p['name'], $p['category']),
            ]);
        }

        // Products (Siswa/Titipan) — selling_price auto-computed via MarginRule in model boot
        $siswaProducts = [
            ['category' => 'snack-jajanan', 'seller_idx' => 0, 'name' => 'Keripik Singkong Budi',   'code' => 's02', 'cost_price' => 1500, 'stock' => 80],
            ['category' => 'roti-kue',      'seller_idx' => 1, 'name' => 'Dadar Gulung Ani',         'code' => 'r01', 'cost_price' => 1500, 'stock' => 50],
            ['category' => 'snack-jajanan', 'seller_idx' => 2, 'name' => 'Risol Mayo Cici',          'code' => 's03', 'cost_price' => 2000, 'stock' => 90],
            ['category' => 'roti-kue',      'seller_idx' => 3, 'name' => 'Lemper Dedi',              'code' => 'r02', 'cost_price' => 2000, 'stock' => 60],
            ['category' => 'snack-jajanan', 'seller_idx' => 4, 'name' => 'Donat Eka',               'code' => 's04', 'cost_price' => 2500, 'stock' => 70],
            ['category' => 'roti-kue',      'seller_idx' => 5, 'name' => 'Brownies Fitri',           'code' => 'r03', 'cost_price' => 5000, 'stock' => 40],
            ['category' => 'snack-jajanan', 'seller_idx' => 6, 'name' => 'Cireng Gilang',            'code' => 's05', 'cost_price' => 1000, 'stock' => 100],
        ];

        $siswaProductModels = [];
        foreach ($siswaProducts as $p) {
            $siswaProductModels[] = Product::create([
                'category_id' => $categoryModels[$p['category']]->id,
                'seller_id'   => $sellerModels[$p['seller_idx']]->id,
                'name'        => $p['name'],
                'code'        => $p['code'],
                'type'        => 'siswa',
                'cost_price'  => $p['cost_price'],
                'stock'       => $p['stock'],
                'image'       => $this->generateProductImage($p['name'], $p['category']),
            ]);
        }

        // 6. Consignments (mutasi titipan: penerimaan & retur barang)
        foreach ($siswaProductModels as $product) {
            // Penerimaan awal (30 hari lalu)
            Consignment::create([
                'seller_id'  => $product->seller_id,
                'product_id' => $product->id,
                'type'       => 'in',
                'quantity'   => rand(40, 60),
                'date'       => Carbon::now()->subDays(30)->toDateString(),
                'notes'      => 'Penerimaan awal titipan',
            ]);

            // Tambah stok (15 hari lalu)
            Consignment::create([
                'seller_id'  => $product->seller_id,
                'product_id' => $product->id,
                'type'       => 'in',
                'quantity'   => rand(20, 40),
                'date'       => Carbon::now()->subDays(15)->toDateString(),
                'notes'      => 'Penambahan stok periode 2',
            ]);

            // Retur sebagian (7 hari lalu) — hanya beberapa produk
            if (rand(0, 1)) {
                Consignment::create([
                    'seller_id'  => $product->seller_id,
                    'product_id' => $product->id,
                    'type'       => 'out',
                    'quantity'   => rand(2, 8),
                    'date'       => Carbon::now()->subDays(7)->toDateString(),
                    'notes'      => 'Retur barang tidak terjual',
                ]);
            }
        }

        // 7. Manual Cashbook entries (modal & pengeluaran operasional awal)
        $manualCashEntries = [
            ['date' => Carbon::now()->subDays(30), 'description' => 'Modal awal kas kantin',           'type' => 'debit',  'amount' => 1000000],
            ['date' => Carbon::now()->subDays(29), 'description' => 'Pembelian bahan makanan minggu 1', 'type' => 'credit', 'amount' => 250000],
            ['date' => Carbon::now()->subDays(28), 'description' => 'Pembelian minuman & es batu',      'type' => 'credit', 'amount' => 150000],
            ['date' => Carbon::now()->subDays(22), 'description' => 'Pembelian bahan makanan minggu 2', 'type' => 'credit', 'amount' => 230000],
            ['date' => Carbon::now()->subDays(21), 'description' => 'Bayar gas LPG',                   'type' => 'credit', 'amount' => 30000],
            ['date' => Carbon::now()->subDays(15), 'description' => 'Pembelian bahan makanan minggu 3', 'type' => 'credit', 'amount' => 270000],
            ['date' => Carbon::now()->subDays(14), 'description' => 'Pembelian minyak goreng & bumbu',  'type' => 'credit', 'amount' => 85000],
            ['date' => Carbon::now()->subDays(8),  'description' => 'Pembelian bahan makanan minggu 4', 'type' => 'credit', 'amount' => 200000],
            ['date' => Carbon::now()->subDays(7),  'description' => 'Setoran kas ke rekening sekolah',  'type' => 'credit', 'amount' => 500000],
            ['date' => Carbon::now()->subDays(3),  'description' => 'Pembelian peralatan makan (piring)', 'type' => 'credit', 'amount' => 120000],
            ['date' => Carbon::now()->subDays(1),  'description' => 'Pembelian bahan makanan minggu ini', 'type' => 'credit', 'amount' => 210000],
        ];

        foreach ($manualCashEntries as $entry) {
            Cashbook::create([
                'date'         => $entry['date']->toDateString(),
                'description'  => $entry['description'],
                'type'         => $entry['type'],
                'amount'       => $entry['amount'],
                'source'       => 'manual',
                'reference_id' => null,
                'user_id'      => $admin->id,
                'created_at'   => $entry['date'],
                'updated_at'   => $entry['date'],
            ]);
        }

        // 8. Transactions (30 hari terakhir)
        $users = User::all();
        $allProducts = Product::all();
        $globalTransactionIndex = 1;
        $createdTransactions = [];

        for ($i = 30; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $isWeekend = $date->isWeekend();

            $numTransactions = $isWeekend ? rand(1, 3) : rand(6, 12);

            for ($t = 0; $t < $numTransactions; $t++) {
                $user = $users->random();
                $numItems = rand(1, 4);
                $selectedProducts = $allProducts->random($numItems);

                $totalAmount = 0;
                $itemsData = [];

                foreach ($selectedProducts as $product) {
                    $qty = rand(1, 3);
                    $costPrice = $product->cost_price;
                    $sellingPrice = $product->selling_price;

                    if ($product->type === 'siswa') {
                        $profitKantin = ($sellingPrice - $costPrice) * $qty;
                        $profitSeller = $costPrice * $qty;
                    } else {
                        $profitKantin = ($sellingPrice - $costPrice) * $qty;
                        $profitSeller = 0;
                    }

                    $totalAmount += $sellingPrice * $qty;

                    $itemsData[] = [
                        'product_id'    => $product->id,
                        'quantity'      => $qty,
                        'cost_price'    => $costPrice,
                        'selling_price' => $sellingPrice,
                        'profit_kantin' => $profitKantin,
                        'profit_seller' => $profitSeller,
                        'product'       => $product,
                    ];
                }

                $paidAmount = ceil($totalAmount / 1000) * 1000;
                if (rand(0, 1) === 1) {
                    $paidAmount += rand(1, 3) * 5000;
                }
                if ($paidAmount < $totalAmount) {
                    $paidAmount = $totalAmount;
                }
                $changeAmount = $paidAmount - $totalAmount;

                $transactionCode = str_pad($globalTransactionIndex++, 6, '0', STR_PAD_LEFT);
                $transactionTime = $date->copy()->setTime(rand(7, 15), rand(0, 59), rand(0, 59));

                $transaction = Transaction::create([
                    'transaction_code' => $transactionCode,
                    'user_id'          => $user->id,
                    'total_amount'     => $totalAmount,
                    'paid_amount'      => $paidAmount,
                    'change_amount'    => $changeAmount,
                    'created_at'       => $transactionTime,
                    'updated_at'       => $transactionTime,
                ]);

                foreach ($itemsData as $item) {
                    TransactionItem::create([
                        'transaction_id'      => $transaction->id,
                        'product_id'          => $item['product_id'],
                        'quantity'            => $item['quantity'],
                        'cost_price'          => $item['cost_price'],
                        'selling_price'       => $item['selling_price'],
                        'profit_kantin'       => $item['profit_kantin'],
                        'profit_seller'       => $item['profit_seller'],
                        'seller_settlement_id'=> null,
                        'created_at'          => $transactionTime,
                        'updated_at'          => $transactionTime,
                    ]);

                    $item['product']->decrement('stock', $item['quantity']);
                }

                $createdTransactions[] = $transaction;

                // Cashbook debit entry per transaksi
                Cashbook::create([
                    'date'         => $transactionTime->toDateString(),
                    'description'  => 'Penjualan #' . $transactionCode,
                    'type'         => 'debit',
                    'amount'       => $totalAmount,
                    'source'       => 'transaction',
                    'reference_id' => $transaction->id,
                    'user_id'      => $user->id,
                    'created_at'   => $transactionTime,
                    'updated_at'   => $transactionTime,
                ]);
            }
        }

        // 9. Settlements untuk transaksi siswa lebih dari 10 hari lalu
        $unsettledItems = TransactionItem::whereHas('product', fn($q) => $q->where('type', 'siswa'))
            ->whereNull('seller_settlement_id')
            ->where('created_at', '<', Carbon::now()->subDays(10))
            ->get();

        $groupedItems = $unsettledItems->groupBy(fn($item) => $item->product->seller_id);

        foreach ($groupedItems as $sellerId => $items) {
            if (!$sellerId) continue;

            $totalAmount = $items->sum('profit_seller');
            $settlementDate = Carbon::now()->subDays(rand(1, 9));
            $seller = $sellerModels[0]; // fallback; actual seller from items
            foreach ($sellerModels as $s) {
                if ($s->id === $sellerId) { $seller = $s; break; }
            }

            $settlement = SellerSettlement::create([
                'seller_id'       => $sellerId,
                'user_id'         => $admin->id,
                'total_amount'    => $totalAmount,
                'settlement_date' => $settlementDate->toDateString(),
                'notes'           => 'Pembayaran titipan periode s.d. ' . Carbon::now()->subDays(10)->toDateString(),
                'created_at'      => $settlementDate,
                'updated_at'      => $settlementDate,
            ]);

            foreach ($items as $item) {
                $item->update(['seller_settlement_id' => $settlement->id]);
            }

            // Cashbook credit entry per settlement
            Cashbook::create([
                'date'         => $settlementDate->toDateString(),
                'description'  => 'Pembayaran titipan: ' . $seller->name,
                'type'         => 'credit',
                'amount'       => $totalAmount,
                'source'       => 'settlement',
                'reference_id' => $settlement->id,
                'user_id'      => $admin->id,
                'created_at'   => $settlementDate,
                'updated_at'   => $settlementDate,
            ]);
        }

        // Reset stock agar produk tersedia di kasir
        Product::query()->update(['stock' => 100]);
    }

    private function generateProductImage(string $name, string $categorySlug = ''): string
    {
        $keyword = 'food';
        if ($categorySlug === 'minuman') {
            $keyword = 'drink,beverage';
        } elseif ($categorySlug === 'snack-jajanan') {
            $keyword = 'snack,chips';
        } elseif ($categorySlug === 'roti-kue') {
            $keyword = 'cake,dessert';
        } elseif ($categorySlug === 'makanan-utama') {
            $keyword = 'food,meal';
        }

        $lock = rand(1, 10000);
        $url  = "https://loremflickr.com/400/400/{$keyword}?lock={$lock}";

        try {
            $opts    = ['http' => ['method' => 'GET', 'header' => "User-Agent: Mozilla/5.0\r\n"]];
            $context = stream_context_create($opts);
            $content = file_get_contents($url, false, $context);
            $filename = 'products/' . Str::slug($name) . '-' . uniqid() . '.jpg';
            Storage::disk('public')->put($filename, $content);
            return $filename;
        } catch (\Exception $e) {
            return '';
        }
    }
}
