<?php
$content = file_get_contents('database/seeders/DatabaseSeeder.php');

$catOld = <<<'CATOLD'
        // 2. Seed Categories
        $categories = [
            'Makanan Utama' => 'makanan-utama',
            'Minuman' => 'minuman',
            'Snack / Jajanan' => 'snack-jajanan',
            'Roti & Kue' => 'roti-kue',
            'Cemilan Pedas' => 'cemilan-pedas',
            'Kopi & Teh' => 'kopi-teh',
        ];

        $categoryModels = [];
        foreach ($categories as $name => $slug) {
            $categoryModels[$slug] = Category::create([
                'name' => $name,
                'slug' => $slug,
            ]);
        }
CATOLD;

$catNew = <<<'CATNEW'
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
CATNEW;

$content = str_replace($catOld, $catNew, $content);

$kantinOld = <<<'KANTINOLD'
        // Kantin Products (own stock)
        $kantinProducts = [
            [
                'category' => 'makanan-utama',
                'name' => 'Nasi Goreng Kantin',
                'code' => 'K001',
                'cost_price' => 8000,
                'selling_price' => 10000,
                'stock' => 150,
            ],
            [
                'category' => 'makanan-utama',
                'name' => 'Mie Goreng Kantin',
                'code' => 'K002',
                'cost_price' => 5000,
                'selling_price' => 7000,
                'stock' => 120,
            ],
            [
                'category' => 'makanan-utama',
                'name' => 'Ayam Geprek Kantin',
                'code' => 'K003',
                'cost_price' => 10000,
                'selling_price' => 13000,
                'stock' => 100,
            ],
            [
                'category' => 'makanan-utama',
                'name' => 'Nasi Uduk Kantin',
                'code' => 'K004',
                'cost_price' => 6000,
                'selling_price' => 8000,
                'stock' => 80,
            ],
            [
                'category' => 'makanan-utama',
                'name' => 'Bakso Kantin',
                'code' => 'K005',
                'cost_price' => 8000,
                'selling_price' => 10000,
                'stock' => 95,
            ],
            [
                'category' => 'makanan-utama',
                'name' => 'Siomay Kantin',
                'code' => 'K006',
                'cost_price' => 5000,
                'selling_price' => 7000,
                'stock' => 110,
            ],
            [
                'category' => 'minuman',
                'name' => 'Es Teh Manis',
                'code' => 'K007',
                'cost_price' => 2000,
                'selling_price' => 3000,
                'stock' => 300,
            ],
            [
                'category' => 'minuman',
                'name' => 'Es Jeruk',
                'code' => 'K008',
                'cost_price' => 2500,
                'selling_price' => 4000,
                'stock' => 200,
            ],
            [
                'category' => 'minuman',
                'name' => 'Air Mineral',
                'code' => 'K009',
                'cost_price' => 1500,
                'selling_price' => 2500,
                'stock' => 400,
            ],
            [
                'category' => 'minuman',
                'name' => 'Jus Alpukat',
                'code' => 'K010',
                'cost_price' => 6000,
                'selling_price' => 8000,
                'stock' => 80,
            ],
            [
                'category' => 'minuman',
                'name' => 'Es Campur',
                'code' => 'K011',
                'cost_price' => 5000,
                'selling_price' => 7000,
                'stock' => 100,
            ],
            [
                'category' => 'kopi-teh',
                'name' => 'Kopi Hitam',
                'code' => 'K012',
                'cost_price' => 2000,
                'selling_price' => 3000,
                'stock' => 150,
            ],
            [
                'category' => 'kopi-teh',
                'name' => 'Es Kopi Susu',
                'code' => 'K013',
                'cost_price' => 4000,
                'selling_price' => 6000,
                'stock' => 150,
            ],
            [
                'category' => 'kopi-teh',
                'name' => 'Teh Hangat',
                'code' => 'K014',
                'cost_price' => 1500,
                'selling_price' => 2000,
                'stock' => 200,
            ],
            [
                'category' => 'roti-kue',
                'name' => 'Roti Bakar',
                'code' => 'K015',
                'cost_price' => 4000,
                'selling_price' => 6000,
                'stock' => 50,
            ],
            [
                'category' => 'snack-jajanan',
                'name' => 'Kentang Goreng',
                'code' => 'K016',
                'cost_price' => 4000,
                'selling_price' => 6000,
                'stock' => 70,
            ],
        ];KANTINOLD;

$kantinNew = <<<'KANTINNEW'
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
        ];KANTINNEW;

$content = str_replace($kantinOld, $kantinNew, $content);

$siswaOld = <<<'SISWAOLD'
        $siswaProducts = [
            ['category' => 'snack-jajanan', 'seller_idx' => 0, 'name' => 'Keripik Singkong Budi', 'code' => 'T001', 'cost_price' => 1500, 'stock' => 80],
            ['category' => 'snack-jajanan', 'seller_idx' => 0, 'name' => 'Klepon Budi', 'code' => 'T002', 'cost_price' => 2000, 'stock' => 60],
            ['category' => 'snack-jajanan', 'seller_idx' => 1, 'name' => 'Lemper Ayam Ani', 'code' => 'T003', 'cost_price' => 1500, 'stock' => 70],
            ['category' => 'roti-kue', 'seller_idx' => 1, 'name' => 'Dadar Gulung Ani', 'code' => 'T004', 'cost_price' => 1500, 'stock' => 50],
            ['category' => 'snack-jajanan', 'seller_idx' => 2, 'name' => 'Risol Mayo Cici', 'code' => 'T005', 'cost_price' => 2000, 'stock' => 90],
            ['category' => 'roti-kue', 'seller_idx' => 2, 'name' => 'Puding Cokelat Cici', 'code' => 'T006', 'cost_price' => 2500, 'stock' => 40],
            ['category' => 'roti-kue', 'seller_idx' => 3, 'name' => 'Brownies Cup Dedi', 'code' => 'T007', 'cost_price' => 3500, 'stock' => 50],
            ['category' => 'snack-jajanan', 'seller_idx' => 3, 'name' => 'Arem-arem Dedi', 'code' => 'T008', 'cost_price' => 1500, 'stock' => 60],
            ['category' => 'cemilan-pedas', 'seller_idx' => 4, 'name' => 'Makaroni Pedas Eka', 'code' => 'T009', 'cost_price' => 2500, 'stock' => 100],
            ['category' => 'cemilan-pedas', 'seller_idx' => 4, 'name' => 'Basreng Pedas Eka', 'code' => 'T010', 'cost_price' => 3000, 'stock' => 100],
            ['category' => 'snack-jajanan', 'seller_idx' => 5, 'name' => 'Pastel Sayur Fitri', 'code' => 'T011', 'cost_price' => 1500, 'stock' => 80],
            ['category' => 'snack-jajanan', 'seller_idx' => 5, 'name' => 'Lumpia Rebung Fitri', 'code' => 'T012', 'cost_price' => 2500, 'stock' => 60],
            ['category' => 'roti-kue', 'seller_idx' => 6, 'name' => 'Donat Kentang Gilang', 'code' => 'T013', 'cost_price' => 2000, 'stock' => 75],
            ['category' => 'snack-jajanan', 'seller_idx' => 6, 'name' => 'Onde-onde Gilang', 'code' => 'T014', 'cost_price' => 1500, 'stock' => 80],
            ['category' => 'roti-kue', 'seller_idx' => 7, 'name' => 'Kue Sus Hesti', 'code' => 'T015', 'cost_price' => 2000, 'stock' => 50],
            ['category' => 'roti-kue', 'seller_idx' => 7, 'name' => 'Roll Cake Hesti', 'code' => 'T016', 'cost_price' => 3000, 'stock' => 40],
            ['category' => 'snack-jajanan', 'seller_idx' => 8, 'name' => 'Pisang Cokelat Indra', 'code' => 'T017', 'cost_price' => 1500, 'stock' => 120],
            ['category' => 'roti-kue', 'seller_idx' => 8, 'name' => 'Martabak Mini Indra', 'code' => 'T018', 'cost_price' => 2000, 'stock' => 70],
            ['category' => 'snack-jajanan', 'seller_idx' => 9, 'name' => 'Tahu Bakso Julia', 'code' => 'T019', 'cost_price' => 2000, 'stock' => 80],
            ['category' => 'roti-kue', 'seller_idx' => 9, 'name' => 'Kue Lumpur Julia', 'code' => 'T020', 'cost_price' => 1500, 'stock' => 60],
        ];SISWAOLD;

$siswaNew = <<<'SISWANEW'
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
        ];SISWANEW;

$content = str_replace($siswaOld, $siswaNew, $content);

file_put_contents('database/seeders/DatabaseSeeder.php', $content);
?>
