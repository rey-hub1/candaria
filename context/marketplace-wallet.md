# Marketplace: Vendor Wallet & Settlements

Vendor balance system, gated by `vendor_wallet` feature flag (default enabled).
Branch `candaria2`.

## Tables/models
- `vendors.balance` (decimal, already existed from Phase 2) — current balance.
- `vendor_ledgers` — `vendor_id`, `order_id` (nullable), `type` (`credit`/`debit`/`adjustment`), `amount` (always positive), `balance_after` (snapshot), `description`, `created_by` (nullable, admin who triggered manual ops). Model `VendorLedger`, `LogsActivity`.
- `vendor_settlements` — `vendor_id`, `amount`, `notes`, `created_by`. Model `VendorSettlement`, `LogsActivity`. Separate from consignment `seller_settlements` — different domain.

## Service: `App\Services\VendorWalletService`
- `credit(Vendor $vendor, float $amount, ?Order $order, string $description)` and `debit(...)` — both go through `applyMutation()`: `DB::transaction` + `Vendor::lockForUpdate()`, update `balance`, insert `VendorLedger` with `balance_after` snapshot. Same race-safe pattern as `TransactionService` (see memory `void-and-audit-design`).
- No platform fee deducted yet — full `order->total` credited to vendor on delivery (per plan §6, decision deferred).

## Trigger
- `Vendor\OrderController::updateStatus()` — when `status` transitions to `delivered`, calls `VendorWalletService::credit($vendor, $order->total, $order, "Pesanan {$order->order_code}")`.

## Vendor wallet page
- `Vendor\WalletController@index` (`GET /mitra/saldo`, needs `feature:vendor_wallet`) — `Pages/Vendor/Wallet/Index.jsx`, shows current balance + paginated ledger history.

## Admin settlement (pencairan)
- `Admin\VendorSettlementController` (`/admin/vendor-settlements`, needs `feature:vendor_wallet`):
  - `index` — list active vendors with balances + paginated settlement history.
  - `store` — validates `amount <= vendor->balance`, calls `VendorWalletService::debit()`, then creates a `VendorSettlement` record.
- `Pages/Admin/VendorSettlements/Index.jsx` — vendor list with "Cairkan" button opening an inline form, plus settlement history.

## Sidebar
- Vendor: "Saldo" link (`vendor.wallet.index`), gated on `features.vendor_wallet`.
- Admin/super_admin: "Pencairan Saldo Mitra" link (`admin.vendor-settlements.index`), gated on `features.vendor_wallet`.

## Verification
- Verified via tinker: `VendorWalletService::credit()` and `::debit()` correctly update `vendors.balance` and write `VendorLedger` rows with correct `balance_after` snapshots. `php artisan test` — 193/193 still passing (no new automated tests added for this phase, consistent with Phase 4's manual-verification approach).
