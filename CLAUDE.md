# Candaria

School canteen POS + consignment management system, expanding into an external-vendor food marketplace for students.

## Stack
- Backend: Laravel 13 (PHP 8.3), SQLite
- Frontend: React 19 + Inertia.js v3, Tailwind CSS v4
- Excel export: maatwebsite/excel, PDF: barryvdh/laravel-dompdf
- Test: Pest (`pestphp/pest`)

## Commands
- Install: `composer install && npm install`
- Run (dev): `php artisan serve` + `npm run dev` (two terminals)
- Test: `php artisan test` (or `./vendor/bin/pest`)
- Build: `npm run build && php artisan optimize`
- Migrate: `php artisan migrate --seed`

## Structure
- `app/Models/` — Eloquent models
- `app/Http/Controllers/` — one controller per resource, Inertia responses
- `app/Services/` — business logic extracted from controllers (e.g. `TransactionService`)
- `app/Traits/` — `Filterable` (query filters), `LogsActivity` (audit log)
- `resources/js/Pages/` — Inertia pages, one folder per resource (mirrors controllers)
- `database/migrations/` — chronological, never edit old ones — add new migrations
- `plan/` — design docs for upcoming work (e.g. marketplace expansion)
- `context/` — short explainers per feature/area (see index below)

## Context index
- `context/auth-roles.md` — user roles, RoleMiddleware, how access control works
- `context/pos-transactions.md` — cashier checkout flow, TransactionService, void/audit
- `context/consignment.md` — sellers, products, settlements, margin rules
- `context/settings-and-flags.md` — `Setting` model (key-value config) and shared Inertia props
- `context/marketplace-expansion.md` — status of the vendor marketplace work (see `plan/marketplace-expansion-plan.md` for full design)
- `context/marketplace.md` — vendors, menu items, option groups/options (Phase 2 implementation)
- `context/student-accounts.md` — NISN-based student login, forced password change (Phase 3 implementation)
- `context/marketplace-orders.md` — student browse/cart/checkout/orders + vendor order management (Phase 4 implementation)
- `context/marketplace-wallet.md` — vendor wallet/ledger + admin settlements (Phase 5 implementation)
- `context/marketplace-extras.md` — order status history, slot quota, notifications, admin monitoring/reports (Phase 6 implementation)
- `context/demo-data.md` — super-admin tool to reset/repopulate the DB at 3 volume levels (none/minimal/full)
- `context/weekly-report.md` — manual weekly Excel export (KONSYIANSI + HARIAN), keyed off `transaction_date`
- `context/change-debt.md` — hutang kembalian ke customer (titip kembalian saat checkout, pelunasan, masuk buku kas & laporan)
- `context/purge-transactions.md` — tool super-admin hapus permanen transaksi lama (1w/1m/3m/6m/1y), keyed off `transaction_date`, item ikut (FK cascade), cashbook dibiarkan
- `context/i18n.md` — bilingual UI (Bahasa Indonesia default / English), session-based locale, `SetLocale` middleware + `useTranslation()` hook + `LanguageSwitcher`; app shell translated, pages migrate incrementally

## Conventions
- Models needing audit trail use `use LogsActivity` (writes to `activity_logs`).
- List/search controllers use `Filterable` trait + `->filter($filters, [...columns])`.
- Image uploads stored via `Storage::disk('public')`, exposed through `appends = ['image_url']` accessor (see `Product::getImageUrlAttribute`).
- Money amounts: integers/decimals in rupiah, no separate currency field.
- Auto-generated codes (product code, transaction code) follow a prefix + zero-padded sequence pattern, computed in model `boot()`.
- All "download/export" UI uses the shared `resources/js/Components/DownloadMenu.jsx` — one "Unduh" button that opens a modal to pick Excel/PDF. Pass `onExportExcel`/`onExportPdf` callbacks (omit one to hide it); `DateRangeFilter` already renders it. Don't add standalone per-format export buttons. (Exception: Weekly/DailyUpload download two *different* reports in one format — not a format chooser.)

## Gotchas
- SQLite DB file must exist (`touch database/database.sqlite`) before migrating.
- `Transaction` has soft-void: use `Transaction::active()` scope, not raw queries — voided transactions stay in DB with `status = 'voided'`.
- Currently on branch `candaria2` — marketplace expansion work, do not merge into `main` until ready.

## Working style
Follow the `lean-coding` skill: read the Context index before exploring, read narrowly (grep for the symbol, go straight to named files), plan briefly before multi-file edits, keep diffs small, and keep each session focused on one concern. Whenever you add or change a feature, update the relevant `context/` file and this index so the context never goes stale.
