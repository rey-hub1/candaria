# Audit Candaria — 70 temuan terkonfirmasi

> Multi-agent audit (7 domain, review sonnet + verify adversarial). 72 temuan, 70 terkonfirmasi.
> Banyak bug yang sama ditemukan beberapa agent (cth. race overdraft di 4 domain) — di sini sudah didedup.

## 🔴 CRITICAL (6)

1. **Admin bisa demotde/hapus akun super_admin** — `UserController::update/destroy` (47-78)
   Guard cuma cek `role === 'admin'`, jadi admin biasa bisa `PUT /users/{super_admin_id}` set `role=cashier` (lolos `in:cashier`), ganti email/password, atau DELETE akun super_admin.
   *Fix:* `abort_unless($isSuperAdmin || $user->role !== 'super_admin', 403)` di awal update() & destroy().

2. **Menu options (add-on/extra) diabaikan total saat checkout** — `OrderService::createOrder` (47-63)
   Schema `menu_option_groups`/`menu_options`/`order_item_options` ada, tapi `OrderController::store` tak validasi `items.*.options`, `price_delta` tak pernah ditambah, `OrderItemOption` tak pernah dibuat. Option wajib (`is_required`) tak dipaksa, total order SELALU salah untuk menu ber-add-on.
   *Fix:* validasi & proses options di service, jumlahkan price_delta, buat OrderItemOption.

3. **Double credit wallet vendor saat order "delivered" 2x** — `Vendor/OrderController::updateStatus` (66-73)
   Bukan dalam DB transaction, order tak di-lock. Double-click/retry → dua request baca `status=ready`, dua-duanya credit. Tak ada unique `(order_id, type)` di `vendor_ledgers`. Saldo vendor naik 2x.
   *Fix:* bungkus `DB::transaction` + `lockForUpdate` pada order; atau unique index `vendor_ledgers(order_id,type)`.

4. **Overdraft race di settlement vendor** — `Admin/VendorSettlementController::store` (39-45) + `VendorWalletService::applyMutation`
   Cek `amount > balance` di luar lock. `applyMutation` setelah lock tak validasi hasil < 0 → tulis saldo negatif, uang hilang.
   *Fix:* pindah cek saldo ke DALAM lock; `if ($balanceAfter < 0) throw`.

5. **Settlement vendor non-atomic** — `Admin/VendorSettlementController::store` (45-53)
   `wallet->debit()` commit transaksi sendiri, lalu `VendorSettlement::create()` jalan terpisah. Kalau create gagal → saldo sudah terpotong tanpa record settlement. Uang lenyap dari ledger.
   *Fix:* bungkus seluruh store() dalam satu `DB::transaction`.

6. **Backdoor admin password='password'** — `DemoDataService::ensureEssentials` (108-110)
   `firstOrCreate` keyed by email. Kalau admin asli ganti email, tiap demo-reset bikin ULANG akun `admin@canteen.com`/`superadmin@candaria.com` dengan password `password`, diam-diam, tanpa warning.
   *Fix:* skip kalau sudah ada user role admin; jangan bikin akun paralel.

## 🟠 HIGH (10, sudah didedup)

- **Kredensial demo siswa (NISN + password plaintext) bocor di halaman login** — `StudentAuthenticatedSessionController::create` (18-31). Query NISN `00112233%`, password = tgl lahir `dmY`, dikirim ke Inertia props tanpa guard env. Siapa pun bisa baca dari page source. *Fix:* gate `app()->isLocal()` atau buang password dari props.
- **Void tak reverse ChangeDebt** — `TransactionService::void` (142). Hutang kembalian tetap `unpaid` + entri kas debit tetap ada setelah void → saldo kas inflated, customer ditagih untuk sale yang sudah dibatalkan. *Fix:* batalkan ChangeDebt + contra kas saat void.
- **TOCTOU void: stock double-increment** — `TransactionService::void` (144). `isVoided()` dicek di luar transaction, tanpa lock pada baris transaksi. Void bersamaan → stok naik 2x + dobel contra entry.
- **Settlement earnings ikut transaksi voided** — `SettlementController::index` (31). Subquery raw `->from('transaction_items')` tak kena SoftDeletes scope → item voided tetap dihitung, saldo seller inflated. `show()` (Eloquent) beda angka. *Fix:* `->whereNull('transaction_items.deleted_at')`.
- **Settlement over-payment tanpa batas** — `SettlementController::store` (158-161). Cuma `min:1`, tak ada `amount <= unpaid`. Admin bisa bayar Rp9jt ke seller bersaldo 0; FIFO tak nandai apa-apa, `total_paid > total_earnings`. *Fix:* validasi vs saldo unpaid dalam lock.
- **Purge hard-delete item yang sudah disettle** — `TransactionPurgeController::destroy` (68-70). FK cascade hapus permanen TransactionItem termasuk yang `seller_settlement_id` terisi → ledger seller nunjuk pembayaran tanpa sale. *Fix:* blok/warn kalau ada item ter-settle.
- **Status delivered + credit tak atomic** — `Vendor/OrderController::updateStatus` (67-73). Update status commit duluan, credit terpisah; kalau credit gagal vendor tak dibayar & tak bisa recover (`delivered`→[] buntu). *Fix:* satu DB::transaction.
- **settleChangeDebt double-payment race** — `TransactionService::settleChangeDebt` (199-223). `isPaid()` dicek di luar transaction, tanpa lock → dobel credit kas. *Fix:* `lockForUpdate` + re-cek di dalam transaction.
- **TestRunner blokir worker 5 menit** — `SuperAdmin/TestRunnerController::run` (19-30). `Process::run()` blocking nahan PHP-FPM worker; bisa stall POS kasir. Tanpa lock, klik ganda spawn banyak proses. *Fix:* queue/async + Cache::lock.
- **Tak ada guard production + tak ada audit log untuk operasi destruktif super-admin** — DemoData/Purge/TestRunner. Tak ada `app()->isProduction()` check; demo-reset bisa wipe DB produksi. Tak ada `ActivityLog::record` + `wipe()` malah hapus tabel `activity_logs` sendiri. *Fix:* `abort_if(app()->isProduction(),403)` + log di luar wipe + keluarkan activity_logs dari DEMO_TABLES.
- **Laporan Finance mingguan double-count omset konsinyasi** — `WeeklyReportService::dailyFinance` (188,212). `penjualan_harian` (semua txn) + `omset_konsyiansi` (subset siswa) dua-duanya jadi debit → saldo overstated tiap hari. *Fix:* buat dua baris mutually exclusive.
- **Stock report keyed `created_at` bukan `transaction_date`** — `ReportController::stock` (218,225). Beda dgn semua report lain → angka stok salah untuk txn backdate/lewat tengah malam. *Fix:* join transactions, filter `transaction_date`.

## 🟡 MEDIUM (terpilih) — ✅ SEMUA SELESAI

- ✅ Cashier bisa void transaksi milik cashier lain (tak ada ownership check) — `TransactionController::destroy`. → ownership check ditambah.
- ✅ `force-increment` stok bisa diakses cashier, tanpa audit log → potensi fraud settlement — `ProductController`. → `ActivityLog::record('force_increment', ...)`.
- ✅ Ganti type produk (siswa↔kantin) tak diblok walau sudah ada history. → diblok kalau `transactionItems()->exists()`.
- ✅ `MarginRule` tak validasi overlap/gap range harga. → `overlaps()` guard di store/update + cache forget.
- ✅ `totalUnpaid` di settlement index cuma hitung halaman aktif. → hitung semua seller via `(clone $query)`.
- ✅ `payment_status` tak pernah jadi 'paid'. → set 'paid' saat `delivered` + `cash` (Vendor/OrderController).
- ✅ Marketplace report hitung `confirmed/preparing/ready` sebagai revenue. → `->where('status','delivered')` saja.
- ✅ Vendor controllers null-pointer kalau tak punya record Vendor. → middleware `vendor.exists` (EnsureVendorExists).
- ✅ Order tanpa batas jumlah line item. → `items` `max:30`, `qty` `max:50`.
- ✅ Tak ada batas order per siswa per slot. → `ensureStudentSlotCap` (Setting `marketplace_max_orders_per_student_slot`, default 2).
- ✅ `EnsurePasswordChanged` cuma cover `penitip`. → `in_array(role, ['penitip','vendor'])`.
- ✅ TransactionController history filter `created_at`. → ganti ke `transaction_date`.
- ✅ Titipan & products report ikut item voided. → filter `status=completed` di ReportService.
- ✅ `wipe()` matikan FK tanpa try/finally. → dibungkus try/finally.
- ✅ (tambahan) Pembatalan siswa tak notifikasi vendor. → `OrderCancelledByStudent` notification.
- ✅ (tambahan) Order code race di `Order::boot`. → retry loop di `OrderService::createOrder`.
- ✅ (tambahan) Password vendor `min:6`. → `Password::defaults()`.
- ✅ (tambahan) Siswa/vendor bisa self-delete (cascade history). → `abort_if` di `ProfileController::destroy`.

## 🟢 LOW (terpilih) — ✅ SELESAI (kecuali 1 ditunda)

- ✅ Image menu tak dihapus dari storage saat update/destroy. → `Storage::disk('public')->delete()` di `Vendor/MenuItemController` (produk sudah dihandle di batch medium).
- ✅ Cashbook total debit/kredit all-time padahal list difilter. → total ikut filter (`(clone $query)`), `currentBalance` tetap saldo riil all-time.
- ✅ IdleTimeout staff 30 hari (praktis nonaktif). → cashier/admin 8 jam, super_admin 12 jam.
- ✅ FeatureFlag default `true` (fail-open). → fail-closed (`default = false`); flag tak di-seed → fitur OFF. Test pakai `beforeEach` aktifkan flag (gate diuji jujur).
- ✅ Weekly filename Mon–Fri padahal data Mon–Minggu. → filename pakai `$end` (selaras rentang export).
- ⏸️ Seller dilink ke user via string phone tanpa FK. → DITUNDA: perubahan skema + backfill data, bukan bug aktif. Catat sebagai utang teknis.

## ➕ Fitur penting yang kurang
- **Pemrosesan menu options di checkout** (lihat #2 critical — fitur dibangun separuh).
- **Refund/debit & status machine `payment_status`** yang nyata (cash → paid saat delivered, QRIS webhook).
- **Rekonsiliasi saldo vendor**: `SUM(ledger) == vendors.balance` (drift tak terlihat sekarang).
- **Audit log untuk aksi destruktif super-admin** + notifikasi vendor saat siswa cancel order.
- **Export marketplace report** (satu-satunya report tanpa Unduh).
- **Status `cancelled` di ChangeDebt** supaya hutang yatim tak bisa "dibayar".

## ➖ Fitur tak berguna / over-engineered
- **IdleTimeout** — di-set 43200 menit (30 hari) untuk semua role; tak pernah expire, overhead tanpa guna.
- **`adjustment`** di enum `vendor_ledgers.type` — tak ada service/UI yang nulis; dead.
- **FeatureFlag fail-open** — hapus row malah meng-enable fitur; kontra-intuitif.

## Top 5 aksi (deployment blocker dulu)
1. Lock & atomic semua flow uang: vendor settlement, credit-on-delivery, settleChangeDebt, void (critical #3,#4,#5 + high). Tambah guard saldo negatif + unique `vendor_ledgers(order_id,type)`.
2. Tutup admin→super_admin takeover (#1) + buang/guard kredensial demo di login (high).
3. Selesaikan menu options di checkout (#2) — total order sekarang salah.
4. `abort_if(production)` + audit log + cabut backdoor demo-data (#6, high) sebelum deploy.
5. Konsistenkan semua report ke `transaction_date` + filter `status=completed` + SoftDeletes (settlement earnings, stock report, finance double-count).
