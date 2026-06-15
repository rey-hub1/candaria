# Demo Data Modes (Super Admin)

Super admin can reset & repopulate the whole DB at 3 volume levels from the UI.
Useful for demos & testing.

## Levels
- `full` ("Banyak") — 8 sellers, 14 products, ~2 weeks of transactions, 3 vendors + 9 menu items, 4 students, 2 orders/student.
- `minimal` ("Sedikit") — 2 sellers, 6 products, 2 days of transactions, 1 vendor, 2 students, 1 order/student.
- `none` ("Kosong") — wipes all demo data; only essentials remain.

Default/current level stored in `settings` key `demo_data_level` (read via `DemoDataService::currentLevel()`, defaults `full`).

## What is preserved vs wiped
- **Preserved (essentials):** staff login users (admin@canteen.com, cashier@canteen.com, superadmin@candaria.com — all password `password`), feature flags, margin rules, canteen `categories`, `marketplace_categories`.
- **Wiped + reseeded (demo):** products, sellers, consignments, transactions/items, cashbooks, seller_settlements, vendors, menu_items (+legacy option tables), orders/items/status history, vendor_ledgers/settlements, notifications, activity_logs, and demo login users (roles `penitip`/`vendor`/`student`).

## Code
- `App\Services\DemoDataService` — `apply(level)` runs in a DB transaction: `wipe()` (FK checks disabled, raw `DB::table()->delete()` to bypass soft-deletes) → `ensureEssentials()` (idempotent firstOrCreate + `FeatureFlagSeeder`) → `seedCanteen()` + `seedMarketplace()` at preset volume. Product codes/selling-price and order codes are left to model `boot()`.
- **Local images:** `demoImage($categoryKey)` writes a deterministic emoji-on-color SVG placeholder to the public disk under `demo/<slug>.svg` (one file per category, shared), returns the relative path stored in `products.image` / `menu_items.image` / `vendors.logo`. No network fetch. Rendered via the existing `asset('storage/'.$image)` accessors (needs `storage:link`).
- `App\Http\Controllers\SuperAdmin\DemoDataController` — `index()` (current level + row counts), `apply()` (validates `level` in none/minimal/full).
- Routes: `super-admin.demo-data.index` (GET `/super-admin/demo-data`), `super-admin.demo-data.apply` (POST). Gated `role:super_admin`.
- Page: `Pages/SuperAdmin/DemoData.jsx` — 3 mode cards + live counts, confirm modal before applying (destructive).

## Gotchas
- Applying any mode is destructive to demo data — always confirmed in UI first.
- Seeder students mirror `StudentSeeder`: siswa 1 (`0011223344`) has `must_change_password = false` (default password always works for quick login); others vary. Default password = birth date `ddmmyyyy`.
- The "Akun Pengujian Cepat" buttons on `Auth/StudentLogin` are now **dynamic** — `StudentAuthenticatedSessionController@create` passes `testAccounts` (demo students, NISN `00112233%`, `must_change_password = false`, with their default password). In mode `none` there are no such students, so the section is hidden (no more stale-credential login error).
- `DatabaseSeeder` (artisan `migrate --seed`) is unchanged and independent — it still does the original full seed incl. network product images. `DemoDataService` is the UI-driven, image-free path.
