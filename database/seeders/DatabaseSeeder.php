<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Seller;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\SellerSettlement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Users
        $admin = User::create([
            'name' => 'Admin Kantin',
            'email' => 'admin@canteen.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $cashier = User::create([
            'name' => 'Kasir Kantin',
            'email' => 'cashier@canteen.com',
            'password' => Hash::make('password'),
            'role' => 'cashier',
        ]);

        // 2. Seed Categories
        $categories = [
            'Makanan Utama' => ['slug' => 'makanan-utama', 'code' => 'a'],
            'Minuman' => ['slug' => 'minuman', 'code' => 'i'],
            'Snack / Jajanan' => ['slug' => 'snack-jajanan', 'code' => 's'],
            'Roti & Kue' => ['slug' => 'roti-kue', 'code' => 'r'],
        ];

        $categoryModels = [];
        foreach ($categories as $name => $data) {
            $categoryModels[$data['slug']] = Category::create([
                'name' => $name,
                'slug' => $data['slug'],
                'code' => $data['code'],
            ]);
        }

        // 3. Seed Sellers (Penitip)
        $sellersData = [
            ['name' => 'Budi Setiawan', 'class' => 'XI RPL 1', 'phone' => '081234567890'],
            ['name' => 'Ani Wijaya', 'class' => 'X DKV 2', 'phone' => '089876543210'],
            ['name' => 'Cici Paramida', 'class' => 'XII OTKP 3', 'phone' => '085678901234'],
            ['name' => 'Dedi Pratama', 'class' => 'XI RPL 2', 'phone' => '081233445566'],
            ['name' => 'Eka Saputra', 'class' => 'X PPLG 1', 'phone' => '081399887766'],
            ['name' => 'Fitri Handayani', 'class' => 'XII AKL 1', 'phone' => '087766554433'],
            ['name' => 'Gilang Ramadhan', 'class' => 'XI TJKT 2', 'phone' => '085211223344'],
            ['name' => 'Hesti Lestari', 'class' => 'X DKV 1', 'phone' => '089988776655'],
            ['name' => 'Indra Wijaya', 'class' => 'XII RPL 1', 'phone' => '081299001122'],
            ['name' => 'Julia Putri', 'class' => 'XI OTKP 1', 'phone' => '085611223344'],
        ];

        $sellerModels = [];
        foreach ($sellersData as $data) {
            $sellerModels[] = Seller::create(array_merge($data, ['is_active' => true]));
        }

        // 4. Seed Products
        // Kantin Products (own stock)
        $kantinProducts = [
            [
                'category' => 'makanan-utama',
                'name' => 'Nasi Goreng Kantin',
                'code' => 'a01',
                'cost_price' => 8000,
                'selling_price' => 10000,
                'stock' => 150,
            ],
            [
                'category' => 'makanan-utama',
                'name' => 'Mie Goreng Kantin',
                'code' => 'a02',
                'cost_price' => 5000,
                'selling_price' => 7000,
                'stock' => 120,
            ],
            [
                'category' => 'makanan-utama',
                'name' => 'Ayam Geprek Kantin',
                'code' => 'a03',
                'cost_price' => 10000,
                'selling_price' => 13000,
                'stock' => 100,
            ],
            [
                'category' => 'makanan-utama',
                'name' => 'Nasi Uduk Kantin',
                'code' => 'a04',
                'cost_price' => 6000,
                'selling_price' => 8000,
                'stock' => 80,
            ],
            [
                'category' => 'makanan-utama',
                'name' => 'Bakso Kantin',
                'code' => 'a05',
                'cost_price' => 8000,
                'selling_price' => 10000,
                'stock' => 95,
            ],
            [
                'category' => 'makanan-utama',
                'name' => 'Siomay Kantin',
                'code' => 'a06',
                'cost_price' => 5000,
                'selling_price' => 7000,
                'stock' => 110,
            ],
            [
                'category' => 'minuman',
                'name' => 'Es Teh Manis',
                'code' => 'i01',
                'cost_price' => 2000,
                'selling_price' => 3000,
                'stock' => 300,
            ],
            [
                'category' => 'minuman',
                'name' => 'Es Jeruk',
                'code' => 'i02',
                'cost_price' => 2500,
                'selling_price' => 4000,
                'stock' => 200,
            ],
            [
                'category' => 'minuman',
                'name' => 'Air Mineral',
                'code' => 'i03',
                'cost_price' => 1500,
                'selling_price' => 2500,
                'stock' => 400,
            ],
            [
                'category' => 'minuman',
                'name' => 'Jus Alpukat',
                'code' => 'i04',
                'cost_price' => 6000,
                'selling_price' => 8000,
                'stock' => 80,
            ],
            [
                'category' => 'minuman',
                'name' => 'Es Campur',
                'code' => 'i05',
                'cost_price' => 5000,
                'selling_price' => 7000,
                'stock' => 100,
            ],
            [
                'category' => 'roti-kue',
                'name' => 'Roti Bakar',
                'code' => 'r01',
                'cost_price' => 4000,
                'selling_price' => 6000,
                'stock' => 50,
            ],
            [
                'category' => 'snack-jajanan',
                'name' => 'Kentang Goreng',
                'code' => 's01',
                'cost_price' => 4000,
                'selling_price' => 6000,
                'stock' => 70,
            ],
        ];

        foreach ($kantinProducts as $p) {
            Product::create([
                'category_id' => $categoryModels[$p['category']]->id,
                'seller_id' => null,
                'name' => $p['name'],
                'code' => $p['code'],
                'type' => 'kantin',
                'cost_price' => $p['cost_price'],
                'selling_price' => $p['selling_price'],
                'stock' => $p['stock'],
            ]);
        }

        // Siswa Products (Consigned)
        // Note: selling_price is auto-computed as cost_price + 500 via Product boot event saving
        $siswaProducts = [
            ['category' => 'snack-jajanan', 'seller_idx' => 0, 'name' => 'Keripik Singkong Budi', 'code' => 's02', 'cost_price' => 1500, 'stock' => 80],
            ['category' => 'snack-jajanan', 'seller_idx' => 0, 'name' => 'Klepon Budi', 'code' => 's03', 'cost_price' => 2000, 'stock' => 60],
            ['category' => 'snack-jajanan', 'seller_idx' => 1, 'name' => 'Lemper Ayam Ani', 'code' => 's04', 'cost_price' => 1500, 'stock' => 70],
            ['category' => 'roti-kue', 'seller_idx' => 1, 'name' => 'Dadar Gulung Ani', 'code' => 'r02', 'cost_price' => 1500, 'stock' => 50],
            ['category' => 'snack-jajanan', 'seller_idx' => 2, 'name' => 'Risol Mayo Cici', 'code' => 's05', 'cost_price' => 2000, 'stock' => 90],
            ['category' => 'roti-kue', 'seller_idx' => 2, 'name' => 'Puding Cokelat Cici', 'code' => 'r03', 'cost_price' => 2500, 'stock' => 40],
            ['category' => 'roti-kue', 'seller_idx' => 3, 'name' => 'Brownies Cup Dedi', 'code' => 'r04', 'cost_price' => 3500, 'stock' => 50],
            ['category' => 'snack-jajanan', 'seller_idx' => 3, 'name' => 'Arem-arem Dedi', 'code' => 's06', 'cost_price' => 1500, 'stock' => 60],
            ['category' => 'snack-jajanan', 'seller_idx' => 5, 'name' => 'Pastel Sayur Fitri', 'code' => 's07', 'cost_price' => 1500, 'stock' => 80],
            ['category' => 'snack-jajanan', 'seller_idx' => 5, 'name' => 'Lumpia Rebung Fitri', 'code' => 's08', 'cost_price' => 2500, 'stock' => 60],
            ['category' => 'roti-kue', 'seller_idx' => 6, 'name' => 'Donat Kentang Gilang', 'code' => 'r05', 'cost_price' => 2000, 'stock' => 75],
            ['category' => 'snack-jajanan', 'seller_idx' => 6, 'name' => 'Onde-onde Gilang', 'code' => 's09', 'cost_price' => 1500, 'stock' => 80],
            ['category' => 'roti-kue', 'seller_idx' => 7, 'name' => 'Kue Sus Hesti', 'code' => 'r06', 'cost_price' => 2000, 'stock' => 50],
            ['category' => 'roti-kue', 'seller_idx' => 7, 'name' => 'Roll Cake Hesti', 'code' => 'r07', 'cost_price' => 3000, 'stock' => 40],
            ['category' => 'snack-jajanan', 'seller_idx' => 8, 'name' => 'Pisang Cokelat Indra', 'code' => 's10', 'cost_price' => 1500, 'stock' => 120],
            ['category' => 'roti-kue', 'seller_idx' => 8, 'name' => 'Martabak Mini Indra', 'code' => 'r08', 'cost_price' => 2000, 'stock' => 70],
            ['category' => 'snack-jajanan', 'seller_idx' => 9, 'name' => 'Tahu Bakso Julia', 'code' => 's11', 'cost_price' => 2000, 'stock' => 80],
            ['category' => 'roti-kue', 'seller_idx' => 9, 'name' => 'Kue Lumpur Julia', 'code' => 'r09', 'cost_price' => 1500, 'stock' => 60],
        ];

        foreach ($siswaProducts as $p) {
            Product::create([
                'category_id' => $categoryModels[$p['category']]->id,
                'seller_id' => $sellerModels[$p['seller_idx']]->id,
                'name' => $p['name'],
                'code' => $p['code'],
                'type' => 'siswa',
                'cost_price' => $p['cost_price'],
                'stock' => $p['stock'],
            ]);
        }

        // 5. Seed Transactions spanning the last 30 days
        $users = User::all();
        $allProducts = Product::all();
        $globalTransactionIndex = 1;

        for ($i = 30; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $isWeekend = $date->isWeekend();
            
            // Fewer sales on weekends
            $numTransactions = $isWeekend ? rand(1, 3) : rand(6, 12);

            for ($t = 0; $t < $numTransactions; $t++) {
                $user = $users->random();
                
                // 1 to 4 unique items per transaction
                $numItems = rand(1, 4);
                $selectedProducts = $allProducts->random($numItems);

                $totalAmount = 0;
                $itemsData = [];

                foreach ($selectedProducts as $product) {
                    $qty = rand(1, 3);
                    $costPrice = $product->cost_price;
                    
                    // Retrieve selling price ( siswa is cost_price + 500, kantin is as stored )
                    $sellingPrice = $product->type === 'siswa' ? $costPrice + 500 : $product->selling_price;

                    if ($product->type === 'siswa') {
                        $profitKantin = 500 * $qty;
                        $profitSeller = $costPrice * $qty;
                    } else {
                        $profitKantin = ($sellingPrice - $costPrice) * $qty;
                        $profitSeller = 0;
                    }

                    $totalAmount += $sellingPrice * $qty;

                    $itemsData[] = [
                        'product_id' => $product->id,
                        'quantity' => $qty,
                        'cost_price' => $costPrice,
                        'selling_price' => $sellingPrice,
                        'profit_kantin' => $profitKantin,
                        'profit_seller' => $profitSeller,
                        'product' => $product,
                    ];
                }

                // Paid amount rounding
                $paidAmount = ceil($totalAmount / 1000) * 1000;
                if (rand(0, 1) === 1) {
                    $paidAmount += rand(1, 3) * 5000;
                }
                if ($paidAmount < $totalAmount) {
                    $paidAmount = $totalAmount;
                }
                $changeAmount = $paidAmount - $totalAmount;

                // Create transaction code
                $transactionCode = str_pad($globalTransactionIndex++, 6, '0', STR_PAD_LEFT);

                $transactionTime = $date->copy()->setTime(rand(7, 15), rand(0, 59), rand(0, 59));

                $transaction = Transaction::create([
                    'transaction_code' => $transactionCode,
                    'user_id' => $user->id,
                    'total_amount' => $totalAmount,
                    'paid_amount' => $paidAmount,
                    'change_amount' => $changeAmount,
                    'created_at' => $transactionTime,
                    'updated_at' => $transactionTime,
                ]);

                foreach ($itemsData as $item) {
                    TransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'cost_price' => $item['cost_price'],
                        'selling_price' => $item['selling_price'],
                        'profit_kantin' => $item['profit_kantin'],
                        'profit_seller' => $item['profit_seller'],
                        'seller_settlement_id' => null,
                        'created_at' => $transactionTime,
                        'updated_at' => $transactionTime,
                    ]);

                    // Deduct stock safely
                    $item['product']->decrement('stock', $item['quantity']);
                }
            }
        }

        // 6. Seed Seller Settlements for older transactions (older than 10 days)
        $unsettledItems = TransactionItem::whereHas('product', function ($q) {
                $q->where('type', 'siswa');
            })
            ->whereNull('seller_settlement_id')
            ->where('created_at', '<', Carbon::now()->subDays(10))
            ->get();

        $groupedItems = $unsettledItems->groupBy(function ($item) {
            return $item->product->seller_id;
        });

        foreach ($groupedItems as $sellerId => $items) {
            if (!$sellerId) continue;

            $totalAmount = $items->sum('profit_seller');
            
            // Random settlement date between 1 and 9 days ago
            $settlementDate = Carbon::now()->subDays(rand(1, 9));

            $settlement = SellerSettlement::create([
                'seller_id' => $sellerId,
                'user_id' => $admin->id,
                'total_amount' => $totalAmount,
                'settlement_date' => $settlementDate->toDateString(),
                'notes' => 'Penyelesaian otomatis periode penjualan s.d. ' . Carbon::now()->subDays(10)->toDateString(),
                'created_at' => $settlementDate,
                'updated_at' => $settlementDate,
            ]);

            foreach ($items as $item) {
                $item->update(['seller_settlement_id' => $settlement->id]);
            }
        }
    }
}
