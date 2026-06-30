# Demo Data Modes (Super Admin)

Super admin can reset & repopulate the whole DB at 4 levels from the UI.
Useful for demos & testing.

## Levels
- `v1` ("Data Asli V1") — real 3-day consignment record (Mon/Tue/Wed) from `database/data/v1_sales.json`: 67 sellers, 133 products, ~770 transactions / ~1860 items / 3472 units. **No marketplace data.** Dates auto-shift (see below). Real sell prices preserved (margin rule bypassed).
- `full` ("Banyak") — 8 sellers, 14 products, ~2 weeks of transactions, 3 vendors + 9 menu items, 4 students, 2 orders/student.
- `minimal` ("Sedikit") — 2 sellers, 6 products, 2 days of transactions, 1 vendor, 2 students, 1 order/student.
- `none` ("Kosong") — wipes all demo data; only essentials remain.

### V1 specifics
- Source: `database/data/v1_sales.json` (parsed once from `plan/dummy.xlsx`). Each seller → `{name, class, phone, products[]}`; each product → `{name, cat, cost, sell, stock[3], sold[3]}` (index 0/1/2 = Senin/Selasa/Rabu).
- **Date shift** (`seedV1Canteen`): maps to the most recent Mon/Tue/Wed all ≤ today (`Carbon::today()->startOfWeek(MONDAY)`, roll back a week if Wed is still future). So `transaction_date` & consignment dates land on last/this week's Mon–Wed.
- **Sell price**: `Product::saving()` rewrites `selling_price` from margin rules for `type='siswa'`; v1 needs the *real* Excel sell price, so it's forced via raw `DB::table('products')->update([...])` after create (event-free).
- **Profit convention** (matches POS): `profit_seller = cost*qty` (Jumlah Stor), `profit_kantin = (sell-cost)*qty` (Laba).
- **Consignments**: one `type=in` row per day a product has `stock>0` (morning restock). Product `stock` = `Σstock − Σsold` (sisa).
- **Transactions**: daily sold qty split into 1–3-unit chunks, shuffled, batched 1–4 lines/txn; codes reset daily (5-digit, mirrors `TransactionService`). Adds the new `lainnya` category (no active products use it in current data, but it's created).

Default/current level stored in `settings` key `demo_data_level` (read via `DemoDataService::currentLevel()`, defaults `full`).

## What is preserved vs wiped
- **Preserved (essentials):** staff login users — `staffUser()` reuses any existing user of that role (tidak bikin akun paralel; kalau belum ada, firstOrCreate default `password`), feature flags, margin rules, canteen `categories`, `marketplace_categories`. **`activity_logs` juga dipreserve** — jejak audit (reset/purge) bertahan melewati reset.
- **Wiped + reseeded (demo):** products, sellers, consignments, transactions/items, cashbooks, seller_settlements, vendors, menu_items, orders/items/status history, vendor_ledgers/settlements, notifications, and demo login users (roles `penitip`/`vendor`/`student`).
- **Guard:** `apply()` `abort_if(app()->isProduction())` — reset tidak bisa jalan di produksi. Tiap reset dicatat ke `activity_logs` (`demo_reset`).

## Code
- `App\Services\DemoDataService` — `apply(level)` runs in a DB transaction: `wipe()` (FK checks disabled, raw `DB::table()->delete()` to bypass soft-deletes) → `ensureEssentials()` (idempotent firstOrCreate + `FeatureFlagSeeder`) → `seedCanteen()` + `seedMarketplace()` at preset volume. Product codes/selling-price and order codes are left to model `boot()`.
- **Local images:** `demoImage($categoryKey)` writes a deterministic emoji-on-color SVG placeholder to the public disk under `demo/<slug>.svg` (one file per category, shared), returns the relative path stored in `products.image` / `menu_items.image` / `vendors.logo`. No network fetch. Rendered via the existing `asset('storage/'.$image)` accessors (needs `storage:link`).
- `App\Http\Controllers\SuperAdmin\DemoDataController` — `index()` (current level + row counts), `apply()` (validates `level` in none/minimal/full/v1).
- Routes: `super-admin.demo-data.index` (GET `/super-admin/demo-data`), `super-admin.demo-data.apply` (POST). Gated `role:super_admin`.
- Page: `Pages/SuperAdmin/DemoData.jsx` — 4 mode cards + live counts, confirm modal before applying (destructive).

## Gotchas
- Applying any mode is destructive to demo data — always confirmed in UI first.
- Seeder students mirror `StudentSeeder`: siswa 1 (`0011223344`) has `must_change_password = false` (default password always works for quick login); others vary. Default password = birth date `ddmmyyyy`.
- The "Akun Pengujian Cepat" buttons on `Auth/StudentLogin` are now **dynamic** — `StudentAuthenticatedSessionController@create` passes `testAccounts` (demo students, NISN `00112233%`, `must_change_password = false`, with their default password). In mode `none` there are no such students, so the section is hidden (no more stale-credential login error).
- `DatabaseSeeder` (artisan `migrate --seed`) is unchanged and independent — it still does the original full seed incl. network product images. `DemoDataService` is the UI-driven, image-free path.
