# P0 — SYS-01: Laporan Produk Error 500 (CRITICAL)

## Masalah
URL `https://candaria.com/reports/products` → **500 Internal Server Error** (`Illuminate\Database\QueryException`). Hanya muncul di hosting live, lolos di lokal.

## Akar Penyebab
`app/Http/Controllers/ReportController.php:152-162` (method `products`):

```php
$allProducts = Product::with(['category', 'seller'])
    ->leftJoin('transaction_items', 'transaction_items.product_id', '=', 'products.id')
    ->select('products.*')                              // semua kolom non-agregat
    ->selectRaw('COALESCE(SUM(transaction_items.quantity), 0) as sold_count')
    ->groupBy('products.id')                            // group cuma by id
    ->orderBy('products.category_id')                   // kolom non-grouped di ORDER BY
    ->orderBy('products.name')
    ->get();
```

MySQL/MariaDB hosting aktifkan strict mode `ONLY_FULL_GROUP_BY`. `select('products.*')` + `orderBy('products.category_id')` sementara `GROUP BY` cuma `products.id` → ditolak. Lokal kemungkinan strict mode mati, jadi lolos.

## Rencana Fix (rekomendasi)
Hapus `JOIN + groupBy` total, ganti dengan **aggregate relationship** Laravel — paling bersih dan anti strict-mode:

```php
$allProducts = Product::with(['category', 'seller'])
    ->withSum('transactionItems as sold_count', 'quantity')
    ->orderBy('category_id')
    ->orderBy('name')
    ->get()
    ->map(fn ($p) => tap($p, fn ($x) => $x->sold_count = (int) ($x->sold_count ?? 0)));
```

Prasyarat: pastikan relasi `transactionItems` ada di `app/Models/Product.php` (cek dulu; kalau belum, tambahkan `hasMany(TransactionItem::class)`).

### Alternatif (kalau enggan ubah query)
- Set `'strict' => false` di `config/database.php` koneksi mysql — **tidak disarankan**, sembunyikan bug & berisiko data lain.
- Atau group by semua kolom yang di-select. Lebih rapuh.

## File Disentuh
- `app/Http/Controllers/ReportController.php` (method `products`)
- `app/Models/Product.php` (verifikasi/ tambah relasi `transactionItems`)

## Verifikasi
1. Cek `SELECT @@sql_mode;` di hosting → konfirmasi `ONLY_FULL_GROUP_BY` ada.
2. Lokal: aktifkan strict mode di `config/database.php` (`'strict' => true`) lalu buka `/reports/products` → harus tetap jalan setelah fix.
3. Pastikan `sold_count`, urutan kategori, low-stock, top-selling masih benar.
4. Cek export PDF & XLSX (`?export=pdf`, `?export=xlsx`) masih jalan.

## Catatan
Audit method lain di `ReportController` yang pola serupa: `stock()` (line 207+) juga pakai groupBy — cek apakah aman di strict mode.
