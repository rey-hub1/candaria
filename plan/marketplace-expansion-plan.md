# Plan: Candaria Marketplace Expansion (branch `candaria2`)

Scope: super admin + feature flags, marketplace mitra/vendor eksternal afiliasi, menu dengan opsi kustom, order siswa dengan slot antar jam 9 & 12, akun siswa via NISN, saldo vendor.

**Di luar scope (sengaja di-skip):**
- Import data NISN + tanggal lahir riil (cuma siapkan struktur tabel & mekanisme generate password, data aktual menyusul).
- Integrasi QRIS yang benar-benar jalan (cuma siapkan kolom & flag, payment tetap `cash`/`none` dulu).

---

## 0. Setup

- Branch baru `candaria2` dari `main`.
- Tambah role di kolom `users.role`: `super_admin`, `vendor`, `student`. Update `RoleMiddleware` usage & `User::isAdmin()/isCashier()` + tambah `isSuperAdmin()`, `isVendor()`, `isStudent()`.
- Update `HandleInertiaRequests::share()` — tambah info `feature_flags` (map key => bool) ke shared props biar frontend bisa conditional render menu/nav.

---

## 1. Feature Flags & Super Admin

### Migration `create_feature_flags_table`
```
id, key (unique), label, description, group (string, mis. 'marketplace'/'core'), is_enabled (bool default true), timestamps
```

### Model `FeatureFlag`
- `use LogsActivity` (konsisten sama model lain).
- Static helper `FeatureFlag::on(string $key): bool` dengan cache (`Cache::rememberForever`, di-forget saat update — pola sama persis seperti `Setting`).

### Seeder `FeatureFlagSeeder`
Default flags (semua bisa di-toggle nanti):
- `marketplace` — modul mitra eksternal & order siswa (default: off saat awal, di-on manual via super admin).
- `marketplace_orders` — siswa bisa order (terpisah dari browse, biar bisa "tutup sementara").
- `vendor_self_register` — vendor bisa daftar sendiri vs hanya dibuatkan admin.
- `student_login` — login siswa via NISN aktif/tidak.
- `payment_qris` — placeholder, default off.
- `vendor_wallet` — modul saldo vendor.
- `order_slot_09` / `order_slot_12` — bisa matiin salah satu slot per hari (mis. libur sebagian).

### Middleware `EnsureFeatureEnabled`
`app/Http/Middleware/EnsureFeatureEnabled.php` — `feature:marketplace` di route group, `abort(404)` kalau off (404 biar ga bocorin ada fitur tersembunyi).

### Super Admin Module
- Route group `middleware(['auth','role:super_admin'])`.
- `FeatureFlagController` — index (list semua flag grouped), `update` (toggle is_enabled, log via `LogsActivity`).
- Page `resources/js/Pages/SuperAdmin/FeatureFlags.jsx` — list grouped per kategori, switch toggle, deskripsi singkat tiap flag.
- Super admin juga inherit semua akses `admin` (cek di `RoleMiddleware`: kalau role super_admin, treat sebagai punya semua role — atau tambahkan `super_admin` ke setiap `role:` middleware list yang relevan).
- Super admin dashboard tambahan: ringkasan global (total vendor, total order marketplace hari ini, saldo total vendor pending payout).

---

## 2. Modul Mitra/Vendor

### Migration `create_vendors_table`
```
id, user_id (FK users, nullable - owner account),
name, slug (unique), description, logo (nullable string path),
category (string, mis. 'makanan_berat','minuman','snack','dessert'),
status (enum: pending, active, suspended) default pending,
phone, address (nullable),
balance (decimal 12,2 default 0),
joined_at (nullable timestamp),
timestamps, soft deletes
```

### Model `Vendor`
- `use Filterable, LogsActivity, HasFactory, SoftDeletes`.
- `belongsTo(User::class)` (owner).
- `hasMany(MenuItem::class)`.
- `hasMany(VendorLedger::class)`.
- `appends = ['logo_url']` (pola sama `Product::getImageUrlAttribute`).
- Scope `active()` → `status = 'active'`.

### User extension
- Saat admin/super admin create vendor: opsi create `User` baru dengan role `vendor` sekaligus, atau link ke user existing.
- `User::isVendor()`, relasi `User::vendor()` (`hasOne(Vendor::class)`).

### Controller `VendorController` (admin/super_admin scope)
Routes (`role:admin,super_admin` + `feature:marketplace`):
- `GET /vendors` index — list semua vendor + filter status/kategori.
- `POST /vendors` store — create vendor + akun user vendor (generate password random, tampilkan sekali ke admin).
- `PUT /vendors/{vendor}` update — edit profil, ganti status (approve/suspend).
- `DELETE /vendors/{vendor}` — soft delete.

### Controller `Vendor\DashboardController` (vendor scope)
Routes (`role:vendor` + `feature:marketplace`):
- `GET /mitra` — dashboard vendor: ringkasan order hari ini per slot, saldo, menu aktif.
- `GET /mitra/profile`, `PUT /mitra/profile` — vendor edit profil toko sendiri (nama, logo, deskripsi, kategori) — tidak bisa ubah status sendiri.

### Frontend
- `Pages/Admin/Vendors/Index.jsx`, `Form` modal (create/edit) — pola sama `Pages/Sellers`.
- `Pages/Vendor/Dashboard.jsx`, `Pages/Vendor/Profile.jsx`.
- Layout baru `VendorLayout` (sidebar khusus vendor: Dashboard, Menu, Pesanan, Saldo, Profil Toko).

---

## 3. Menu & Opsi Kustomisasi

### Migration `create_menu_items_table`
```
id, vendor_id (FK), name, description (nullable),
price (decimal 12,2), image (nullable),
category (string, mis. 'makanan','minuman'),
is_active (bool default true),
timestamps, soft deletes
```

### Migration `create_menu_option_groups_table`
```
id, menu_item_id (FK), name (mis. "Pilihan Isi", "Level Pedas"),
type (enum: single, multiple),
is_required (bool default false),
min_select (int default 0), max_select (nullable int — null = unlimited utk multiple),
sort_order (int default 0),
timestamps
```

### Migration `create_menu_options_table`
```
id, option_group_id (FK), name (mis. "Tahu", "Baso", "Level 3"),
price_delta (decimal 12,2 default 0),
is_default (bool default false),
sort_order (int default 0),
timestamps
```

### Models
- `MenuItem` — `belongsTo(Vendor)`, `hasMany(MenuOptionGroup)`, `appends=['image_url']`, scope `active()`.
- `MenuOptionGroup` — `belongsTo(MenuItem)`, `hasMany(MenuOption)`.
- `MenuOption` — `belongsTo(MenuOptionGroup)`.

### Controller `Vendor\MenuItemController` (role:vendor)
- `index` — list menu milik vendor login (`Vendor::find(auth user vendor_id)`).
- `store` / `update` — payload nested: menu fields + array `option_groups[]` masing-masing dengan `options[]`. Pakai DB transaction, sync via delete-then-recreate atau diff by id (pilih: delete-then-recreate lebih simpel utk awal, acceptable karena opsi jarang banyak).
- `destroy` — soft delete.
- `toggleActive` — quick enable/disable menu tanpa buka form.

### Frontend
- `Pages/Vendor/Menu/Index.jsx` — grid menu card (gambar, nama, harga, toggle aktif, tombol edit).
- `Pages/Vendor/Menu/Form.jsx` — form dinamis: tambah/hapus option group, tiap group tambah/hapus option, set type single/multiple, required, default. UI mirip "tambah varian" — pakai array state + `useFieldArray`-style manual (project ga pakai react-hook-form kelihatannya, jadi manual array state sesuai pola form lain di project).

---

## 4. Marketplace Siswa (Browse & Order)

### Public/Student Routes (`role:student` + `feature:marketplace,marketplace_orders`)
- `GET /jajan` — list vendor aktif (card: logo, nama toko, kategori, rating placeholder kalau ada).
- `GET /jajan/{vendor:slug}` — detail vendor, list menu grouped by category.
- Klik menu → modal pilih opsi (radio utk `single`, checkbox dengan validasi `min_select`/`max_select` utk `multiple`), live price calculation (`price + sum(price_delta selected)`).
- Cart disimpan di state/local storage frontend (per vendor — **1 vendor per order/cart**, kalau ganti vendor cart lama di-clear dengan konfirmasi, biar simpel & sesuai 1 order = 1 vendor = 1 slot antar).
- `POST /jajan/checkout` — submit cart → create `Order` + `OrderItem` + `OrderItemOption` (snapshot nama & harga saat order, supaya histori ga berubah kalau vendor edit menu/harga belakangan).

### Frontend Pages
- `Pages/Student/Marketplace/Index.jsx` — list vendor.
- `Pages/Student/Marketplace/VendorShow.jsx` — menu + cart drawer.
- `Pages/Student/Marketplace/Checkout.jsx` — pilih slot (09:00/12:00, disable kalau lewat cutoff atau flag off), catatan, ringkasan total, submit.
- `Pages/Student/Orders/Index.jsx` — riwayat order siswa + status.
- `Pages/Student/Orders/Show.jsx` — detail order.

---

## 5. Order & Jadwal Antar (Slot 09:00 / 12:00)

### Migration `create_orders_table`
```
id, order_code (string unique, format mis. ORD-YYYYMMDD-XXXX),
student_id (FK users, role student),
vendor_id (FK vendors),
delivery_slot (enum: '09:00','12:00'),
delivery_date (date),
status (enum: pending, confirmed, preparing, ready, delivered, cancelled) default pending,
subtotal, total (decimal 12,2),
payment_method (enum: cash, qris) default 'cash',
payment_status (enum: unpaid, paid) default 'unpaid', -- siap dipakai nanti, sekarang manual/cash
notes (nullable text),
cancelled_reason (nullable),
timestamps
```

### Migration `create_order_items_table`
```
id, order_id (FK), menu_item_id (FK nullable on delete set null - keep history),
name_snapshot, price_snapshot (decimal),
qty (int), notes (nullable),
subtotal (decimal),
timestamps
```

### Migration `create_order_item_options_table`
```
id, order_item_id (FK), option_group_name_snapshot, option_name_snapshot,
price_delta_snapshot (decimal), timestamps
```
> Snapshot pattern (nama kolom `*_snapshot`) konsisten dengan kebutuhan histori — kalau vendor ubah/hapus menu/opsi, order lama tetap utuh.

### Setting/Config tambahan (via `Setting` model existing, key-value)
- `marketplace_cutoff_09` (default `'08:00'`) — batas order utk slot jam 9.
- `marketplace_cutoff_12` (default `'10:30'`) — batas order utk slot jam 12.
- Validasi di `OrderController@store`: tolak slot yang udah lewat cutoff hari ini.

### Models
- `Order` — `belongsTo(User, 'student_id')`, `belongsTo(Vendor)`, `hasMany(OrderItem)`. Auto-generate `order_code` di `boot::creating` (pola mirip `Product::code`).
- `OrderItem` — `belongsTo(Order)`, `hasMany(OrderItemOption)`.
- `OrderItemOption` — `belongsTo(OrderItem)`.

### Controller `Student\OrderController`
- `store` (checkout) — transaction: hitung ulang total di server (jangan percaya total dari frontend!), validasi cutoff & flag slot, validasi opsi sesuai `min_select`/`max_select`/`is_required`, create order + items + options.
- `index`, `show` — riwayat & detail order siswa sendiri (scoped by `student_id`).
- `cancel` — siswa bisa cancel kalau status masih `pending` (belum di-confirm vendor).

### Controller `Vendor\OrderController`
- `index` — list order masuk milik vendor, filter by `delivery_date` + `delivery_slot` + `status`. Default tampilkan hari ini.
- `updateStatus` — vendor ubah status (`pending → confirmed → preparing → ready → delivered`), atau `cancelled` dengan alasan.
- Saat status jadi `delivered` → trigger credit ke `VendorLedger` (lihat bagian 6).

### Frontend Vendor
- `Pages/Vendor/Orders/Index.jsx` — tab per slot (Jam 09:00 / Jam 12:00), list order card dengan item & opsi, tombol ubah status.

### Admin/Super Admin Reporting (tambahan yang menurutku perlu)
- `Pages/Admin/Marketplace/Orders.jsx` — monitoring semua order marketplace (lintas vendor), filter tanggal/vendor/status — buat troubleshooting & rekap.
- Report baru: `reports.marketplace-sales` — total penjualan per vendor per periode (basis utk settlement).

---

## 6. Saldo / Wallet Vendor (`feature:vendor_wallet`)

### Migration `create_vendor_ledgers_table`
```
id, vendor_id (FK), order_id (FK nullable),
type (enum: credit, debit, adjustment),
amount (decimal 12,2),
balance_after (decimal 12,2),
description, created_by (FK users nullable - utk adjustment manual admin),
timestamps
```

### Model `VendorLedger`
- `use LogsActivity`.
- `belongsTo(Vendor)`, `belongsTo(Order, optional)`.

### Service `VendorWalletService` (`app/Services/`)
- `credit(Vendor $vendor, int $amount, ?Order $order, string $desc)` — DB transaction, `lockForUpdate()` row vendor, increment balance, insert ledger dengan `balance_after` snapshot. Pola sama seperti soft-void/cashbook race-safe yang udah ada di project (lihat memory `void-and-audit-design`).
- `debit(...)` — utk settlement/pencairan oleh admin.
- Trigger: `Order` status → `delivered` → `VendorWalletService::credit($order->vendor, $order->total, $order, "Order {$order->order_code}")`. (Belum ada potongan margin platform — kalau mau, tambah field `platform_fee` di config & kurangi sebelum credit; **catatan untuk diputuskan nanti**, sementara full amount masuk ke vendor.)

### Controller `Vendor\WalletController`
- `index` — saldo + riwayat ledger (paginate), pola sama `SettlementController` index.

### Controller `Admin\VendorSettlementController` (opsional, reuse pola `SettlementController`)
- Admin proses pencairan saldo vendor → `VendorWalletService::debit()` + catat settlement record (bisa reuse tabel `seller_settlements` dengan kolom polymorphic, atau buat `vendor_settlements` table baru — **rekomendasi: tabel baru `vendor_settlements`** biar ga campur sama sistem konsinyasi internal yang sudah ada).

### Frontend
- `Pages/Vendor/Wallet/Index.jsx` — saldo besar di atas, tabel mutasi.
- `Pages/Admin/VendorSettlements/Index.jsx` — proses pencairan.

---

## 7. Akun Siswa (struktur, tanpa data NISN riil)

### Migration `create_students_table`
```
id, user_id (FK users, unique), nisn (string unique), name, class (string nullable),
birth_date (date), must_change_password (bool default true),
timestamps
```
> `users` row terkait dibuat dengan `email = null`, `phone = null`, `role = 'student'`, `name` sinkron dari `students.name`. Login pakai NISN sebagai "username" — perlu kolom login alternatif: tambah `users.username` (nullable unique) atau langsung pakai `students.nisn` sebagai lookup lalu auth via custom guard logic.

### Password generation helper (siap pakai begitu data masuk)
- `Student::generateDefaultPassword()` → format `ddmmyyyy` dari `birth_date`, di-hash saat create.
- Command `php artisan students:import {file}` (Excel via `app/Imports`, reuse `app/Exports` pattern terbalik) — **command disiapkan tapi tidak dijalankan** sampai data NISN asli tersedia.

### Auth flow
- Custom `LoginRequest`/controller tambahan: form login siswa terpisah di `/login-siswa`, input NISN + password. Resolve `User` via `students.nisn` → authenticate.
- Middleware `student` group + `feature:student_login`.
- Halaman wajib ganti password di first login kalau `must_change_password = true`.

### Frontend
- `Pages/Auth/StudentLogin.jsx`.
- `Pages/Student/ChangePassword.jsx` (force redirect kalau `must_change_password`).

---

## 8. Payment Placeholder (`feature:payment_qris` tetap off)

- Kolom `orders.payment_method` (`cash`/`qris`) & `payment_status` sudah disiapkan di migration Fase 5.
- UI checkout: radio payment method, opsi `qris` **disabled/hidden** kalau flag `payment_qris` off (cuma tampilkan `cash`/bayar di tempat saat ambil pesanan).
- Tidak ada integrasi gateway sekarang — `qris_reference` kolom nullable disiapkan di `orders` table biar migration ga perlu nambah kolom lagi nanti.

---

## 9. Fitur Tambahan yang Disarankan (di luar request awal, low-effort tinggi-value)

1. **Notifikasi in-app sederhana** — tabel `notifications` (Laravel built-in `notifications` table) atau simple `flash` extension: siswa dapat notif "Pesanan dikonfirmasi vendor", vendor dapat notif "Order baru masuk". Minimal: badge counter di navbar, polling/refresh on page visit (skip realtime/websocket dulu).
2. **Vendor kategori & search/filter di marketplace** — `vendors.category` dipakai utk filter tab di halaman `/jajan` (Makanan Berat, Minuman, Snack, dll).
3. **Jam operasional vendor** (`vendors.is_open` toggle manual atau `open_time`/`close_time`) — vendor bisa "tutup hari ini" tanpa harus suspend akun.
4. **Limit kuota order per slot per vendor** (opsional field `max_orders_per_slot`) — antisipasi vendor kewalahan, kalau penuh slot itu auto-disable di checkout.
5. **Activity log** — semua model baru (`Vendor`, `MenuItem`, `Order`, `VendorLedger`, `FeatureFlag`) pakai trait `LogsActivity` yang sudah ada, konsisten dengan audit design existing.
6. **Audit trail status order** — tabel kecil `order_status_histories` (order_id, from_status, to_status, changed_by, timestamps) — berguna kalau ada dispute "kok pesanan ga sampai".
7. **Validasi total di server, bukan di client** — disebut eksplisit di Fase 5, tapi penting banget ditegaskan: harga & opsi dihitung ulang server-side saat checkout, cart cuma utk display.

---

## 10. Urutan Implementasi (Sub-fase Eksekusi)

1. **Branch + Fase 1**: feature flags, super admin role & dashboard.
2. **Fase 2 + 3**: tabel & model vendor + menu + opsi, controller & UI vendor (tanpa marketplace siswa dulu — vendor bisa setup toko & menu).
3. **Fase 7 (struktur)**: tabel students, model, password generator, login siswa (tanpa data nyata — bikin 1-2 dummy student via seeder/tinker utk testing).
4. **Fase 4 + 5**: marketplace browse + checkout + order + slot + cutoff config.
5. **Fase 6**: vendor wallet, trigger credit on delivered, vendor settlement.
6. **Fase 8**: kolom payment placeholder (sudah included di migration fase 5, tinggal pastikan UI disable QRIS).
7. **Fase 9**: fitur tambahan, prioritas: kategori vendor & filter (3.2), jam operasional vendor (3.3), activity log integration (3.5) — sisanya opsional sesuai waktu.

Setiap sub-fase: migration → model → controller/route → frontend page → manual test sebelum lanjut sub-fase berikutnya.
