# Marketplace Expansion (in progress)

External vendor ("mitra") food marketplace for students, on branch `candaria2`.

## Key files
- `plan/marketplace-expansion-plan.md` — full design: feature flags, super admin, vendors, menu+options, student marketplace, orders/slots, vendor wallet, student (NISN) accounts
- `context/marketplace.md` — live vendor/menu implementation (Phase 2)
- `context/student-accounts.md` — live student login/account implementation (Phase 3)
- `context/marketplace-orders.md` — live student browse/checkout/orders + vendor order management (Phase 4)
- `context/marketplace-wallet.md` — vendor wallet/ledger + admin settlements (Phase 5)
- `context/marketplace-extras.md` — order status history, slot quota, notifications, admin monitoring/reports (Phase 6)

## Status
- Plan written, branch `candaria2` created.
- **Phase 1 done**: `feature_flags` table/model/seeder, `feature:<key>` middleware, `super_admin`/`vendor`/`student` roles + helpers on `User`, `RoleMiddleware` super_admin bypass, `/super-admin/feature-flags` page. See `context/settings-and-flags.md` and `context/auth-roles.md`.
- **Phase 2 done**: `vendors`, `menu_items`, `menu_option_groups`, `menu_options` tables/models; admin vendor CRUD (`/admin/vendors`); vendor dashboard/profile/menu CRUD (`/mitra`). See `context/marketplace.md`.
- **Phase 3 done**: `students` table/model, NISN+birthdate login (`/login-siswa`), forced password change, dummy students via `StudentSeeder`. See `context/student-accounts.md`.
- **Phase 4 done**: `orders`/`order_items`/`order_item_options` tables/models; student browse (`/jajan`), cart (localStorage), checkout with server-side recompute, order list/detail/cancel; vendor order management (`/mitra/pesanan`) with status transitions; slot/cutoff config via `Setting`; `MarketplaceSeeder` demo data. See `context/marketplace-orders.md`.
- **Phase 5 done**: `vendor_ledgers`/`vendor_settlements` tables/models, `VendorWalletService` (race-safe credit/debit), credit-on-`delivered` trigger, `Vendor\WalletController` (`/mitra/saldo`), `Admin\VendorSettlementController` (`/admin/vendor-settlements`). See `context/marketplace-wallet.md`.
- **Phase 6 done**: `order_status_histories` table + `Order::boot()` hooks, `vendors.max_orders_per_slot` quota check on checkout, in-app notifications (`NewOrderReceived`, `OrderStatusUpdated`, `/notifikasi`, bell icon), admin marketplace order monitoring (`/admin/marketplace/pesanan`) + sales report (`/admin/reports/marketplace-sales`). See `context/marketplace-extras.md`. Payment placeholder (`payment_method`/`payment_status`/`qris_reference` + QRIS UI gating) was already done in Phase 4.
- Execution order (from plan §10): ~~feature flags + super admin~~ → ~~vendor + menu/options~~ → ~~student account structure~~ → ~~student marketplace + orders/slots~~ → ~~vendor wallet~~ → ~~payment placeholder~~ → ~~extras~~. All phases done.

## Gotchas
- New domain is intentionally separate from the existing consignment system — don't reuse `Seller`/`Product`/`Setting` tables for vendors/menus/feature flags; the plan defines new tables (`vendors`, `menu_items`, `menu_option_groups`, `menu_options`, `orders`, `order_items`, `feature_flags`, etc).
- Server must recompute order totals/options at checkout — never trust client-submitted totals (plan §5, §9.7).
- As sub-phases complete, split this file: e.g. once feature flags exist, move that into `context/settings-and-flags.md` or a new `context/feature-flags.md`; once vendors/orders exist, add `context/marketplace.md` describing the live implementation.
