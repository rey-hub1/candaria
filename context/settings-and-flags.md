# Settings & Feature Flags

Key-value app config and shared Inertia props.

## Key files
- `app/Models/Setting.php` — `Setting::get($key, $default)` / `Setting::set($key, $value)`, cached forever (`Cache::rememberForever`, forgotten on set)
- `app/Http/Controllers/SettingController.php` — admin settings page
- `app/Http/Middleware/HandleInertiaRequests.php::share()` — exposes `settings.*` to every page (e.g. `admin_whatsapp`, `keyboard_default_mode`)

## How it works
- Simple key-value table, one row per setting, cached individually by key.
- New settings: read with `Setting::get('key', 'default')`, add to `HandleInertiaRequests::share()` if frontend needs it.

## Gotchas
- Forgetting to `Cache::forget` on update leaves stale values until cache expires (handled inside `Setting::set`, don't bypass it with raw `Model::update`).

## Feature Flags (separate from Settings)
- `app/Models/FeatureFlag.php` — `key`, `label`, `description`, `group`, `is_enabled`. Check with `FeatureFlag::enabled('key')` (cached forever, invalidated on save/delete via `booted()`). Named `enabled()` not `on()` — `on()` collides with Eloquent's static `Model::on()`.
- **Fail-closed:** `enabled($key, $default = false)` — flag yang belum di-seed → fitur OFF (bukan ON). Semua flag produksi di-seed `FeatureFlagSeeder`, jadi default praktis tak pernah kepakai. Test mengaktifkan semua flag via `beforeEach` di `tests/Pest.php` supaya gate diuji jujur.
- Seeded by `database/seeders/FeatureFlagSeeder.php` (called from `DatabaseSeeder`).
- Route guard: `feature:<key>` middleware alias (`App\Http\Middleware\EnsureFeatureEnabled`) — aborts 404 if flag is off. Apply to marketplace route groups.
- All flags shared to every Inertia page as `features` prop (key => bool) via `HandleInertiaRequests`.
- Managed by `super_admin` role at `/super-admin/feature-flags` (`SuperAdmin/FeatureFlagController`, page `Pages/SuperAdmin/FeatureFlags.jsx`).
- **Templates (presets):** page shows two preset cards. `applyTemplate(template)` (POST `super-admin.feature-flags.template`, `template` in `v1|v2`) bulk-sets every flag: `v1` = hanya grup `general` (umum) nyala & sisanya mati, `v2` = semua nyala (saved per-flag via `save()` so cache invalidation fires). Active template is **derived statelessly** in the page from current flag values (general all on + non-general all off → v1, all on → v2, else `custom`) — no extra column/setting; any manual single toggle drops it to `custom`.
- Current flags: `cashbook` (group `general`, on by default — admin Mutasi & Buku Kas menu + `/cashbooks` routes guarded by `feature:cashbook`), `public_menu` (group `general`, **on by default** — landing `/` & katalog publik `/menu`; saat mati `/menu` 404 via `feature:public_menu`, sedangkan `/` redirect ke login lewat cek inline di `PublicController::welcome` supaya root tak 404), `force_password_change` (group `general`, **off by default** — siswa & penitip wajib ganti password saat pertama login; see `context/student-accounts.md`), `marketplace` (off by default — master switch), `marketplace_orders`, `vendor_self_register`, `student_login`, `payment_qris` (off), `vendor_wallet`, `order_slot_09`, `order_slot_12`.
