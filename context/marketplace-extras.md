# Marketplace Extras (Phase 6)

Order status history, slot quota limit, in-app notifications, admin monitoring/reports.

## Order status history
- `order_status_histories` table: `order_id, from_status, to_status, changed_by, timestamps`
- `OrderStatusHistory` model — no `LogsActivity` (small audit table)
- `Order::boot()` hooks auto-record rows:
  - `created` → inserts `null -> pending` (or initial status)
  - `updating` → if `isDirty('status')`, inserts `getOriginal('status') -> status`
  - Fires automatically on any `$order->update(['status' => ...])`, no controller changes needed
- `Student\OrderController::show()` eager-loads `statusHistories` ordered by `created_at`, shown in `Pages/Student/Orders/Show.jsx` ("Riwayat Status")

## Slot quota limit
- `vendors.max_orders_per_slot` (nullable int) — set via vendor profile (`Pages/Vendor/Profile.jsx`)
- `Student\OrderController::ensureSlotQuotaAvailable()` — runs inside checkout `DB::transaction`, counts non-cancelled orders for vendor/date/slot with `lockForUpdate()`, throws `ValidationException` if `count >= max_orders_per_slot`
- `null` = no limit

## In-app notifications
- Laravel built-in `notifications` table, `Notifiable` on `User`
- `App\Notifications\NewOrderReceived` — sent to vendor's user on `Student\OrderController::store()`
- `App\Notifications\OrderStatusUpdated` — sent to student on `Vendor\OrderController::updateStatus()`, has `STATUS_LABEL` map for Indonesian status text
- `NotificationController` — `/notifikasi` (index), `/notifikasi/{id}/baca` (mark read + redirect to `data.url`), `/notifikasi/baca-semua` (mark all read)
- `unreadNotificationsCount` shared via `HandleInertiaRequests::share()`, shown as bell icon badge in `AuthenticatedLayout` header

## Admin monitoring/reports
- `Admin\Marketplace\OrderController::index()` — `/admin/marketplace/pesanan`, all orders filterable by date/vendor/status (`Pages/Admin/Marketplace/Orders.jsx`)
- `Admin\MarketplaceReportController::sales()` — `/admin/reports/marketplace-sales`, per-vendor order count + total sales for date range using `useDateFilter`/`DateRangeFilter` (`Pages/Admin/Reports/MarketplaceSales.jsx`)
- Both routes inside `/admin` marketplace group (gated by `feature:marketplace`), sidebar links unconditional within that group

## Verification
- Tinker-verified: status history hooks (5 rows for pending→confirmed→preparing→ready→delivered), wallet credit, both notifications fire correctly
- HTTP smoke test: vendor login via XSRF cookie (`/login` → extract `XSRF-TOKEN` cookie → POST `/login` with `X-XSRF-TOKEN` header), `/mitra/saldo` and `/notifikasi` return 200
- `php artisan test` — 193/193 pass
