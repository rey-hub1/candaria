# Marketplace: Student Orders & Slots

Students browse vendors, build a cart client-side, and check out into an
`Order` with snapshotted items/options. Branch `candaria2`, gated by
`marketplace` (browse) + `marketplace_orders` (checkout/order actions) flags.

## Tables/models
- `orders` — `order_code` (auto `ORD-YYYYMMDD-XXXX`, sequential per day), `student_id`, `vendor_id`, `delivery_slot` ('09:00'/'12:00'), `delivery_date`, `status` (pending→confirmed→preparing→ready→delivered, or cancelled), `subtotal`/`total`, `payment_method` (cash/qris), `payment_status`, `qris_reference`, `notes`, `cancelled_reason`.
- `order_items` — `menu_item_id` (nullable, set null on delete), `name_snapshot`, `price_snapshot` (unit price incl. selected option deltas), `qty`, `notes`, `subtotal`.
- `order_item_options` — `option_group_name_snapshot`, `option_name_snapshot`, `price_delta_snapshot`.
- `Order::items()`, `OrderItem::options()`. All snapshot fields preserve history if vendor edits/deletes menu later.

## Student flow (`/jajan`, `role:student` + `feature:marketplace` + `student.password_changed`)
- `Student/MarketplaceController@index` — `Pages/Student/Marketplace/Index.jsx`, list active vendors, client-side category filter.
- `@show` (`/jajan/{vendor:slug}`) — `Pages/Student/Marketplace/VendorShow.jsx`, menu grouped by category, option-selection modal, cart drawer. Cart is stored in `localStorage` (`resources/js/utils/cart.js`), one vendor per cart — switching vendors prompts to clear.
- `@checkout` (GET `/jajan/checkout`, needs `feature:marketplace_orders`) — `Pages/Student/Marketplace/Checkout.jsx`, reads cart from localStorage, picks delivery slot (disabled if flag off or past cutoff), payment method (qris hidden/disabled unless `payment_qris` flag on).
- `Student\OrderController@store` (POST same URL `/jajan/checkout`) — recomputes everything server-side from `option_ids`: validates per-group `min_select`/`max_select`/`is_required`, computes `price_snapshot`/`subtotal`/`total`. Never trusts client totals. On success, clears localStorage cart and redirects to order detail.
- `@index`/`@show`/`@cancel` under `/siswa/pesanan` — `Pages/Student/Orders/Index.jsx` & `Show.jsx`. Cancel only allowed while `status === 'pending'`.

## Slot/cutoff config
- Slot availability: `FeatureFlag::enabled('order_slot_09'|'order_slot_12')`.
- Cutoff times: `Setting::get('marketplace_cutoff_09', '08:00')` / `marketplace_cutoff_12` (default `'10:30'`). Order rejected if `now()->format('H:i') > cutoff`.
- `delivery_date` is always "today" (`now()->toDateString()`).

## Vendor flow (`/mitra/pesanan`, role=vendor)
- `Vendor\OrderController@index` — `Pages/Vendor/Orders/Index.jsx`, filters by `date` (default today, uses `whereDate()` — see gotcha), `slot`, `status`.
- `@updateStatus` — enforces `TRANSITIONS` map (pending→confirmed→preparing→ready→delivered, any non-terminal→cancelled with required `cancelled_reason`). 422 on invalid transition.
- Wallet credit on `delivered` is **not yet implemented** — Phase 5 (`vendor_ledgers`/`VendorWalletService`) will hook into `updateStatus`.

## Gotchas
- `delivery_date` has Eloquent `date` cast but is stored as `'Y-m-d 00:00:00'` (Laravel's default date-cast storage format) — always query with `whereDate('delivery_date', ...)`, never `where('delivery_date', '2026-06-11')`.
- `database/seeders/MarketplaceSeeder.php` creates a demo vendor "Warung Bu Sari" (user `mitra@candaria.com` / `password`) with 3 menu items incl. option groups, for testing.
