# POS / Transactions (Cashier)

Cashier checkout flow with stock deduction, payment, and soft-void/audit support.

## Key files
- `app/Services/TransactionService.php` — `checkout()`: validates stock & payment, creates `Transaction` + `TransactionItem`, deducts stock under row locks, records `Cashbook` income
- `app/Models/Transaction.php` — `status` (`completed`/`voided`), `scopeActive()`, void fields (`voided_at`, `void_reason`, `voided_by`)
- `app/Models/TransactionItem.php` — soft-deletable line items
- `app/Models/Cashbook.php` — cash ledger (income/expense entries)
- `app/Http/Controllers/TransactionController.php` — `create` (POS UI), `checkout`, `index`, `show`, `destroy` (= void)
- `resources/js/Pages/Transactions/` — POS screen + history

## How it works
1. Cashier picks products on `/cashier`, posts cart to `/checkout`.
2. `TransactionService::checkout()` runs in a DB transaction: locks product rows, checks stock, computes total, generates `transaction_code`, inserts `Transaction` + `TransactionItem`s, decrements stock, writes a `Cashbook` income entry.
3. Void (`destroy`) is **soft**: sets `status = 'voided'`, soft-deletes items, writes a contra `Cashbook` entry — never hard-deletes financial history.
4. Activity (checkout, void) recorded via `ActivityLog` for audit.

## Gotchas
- Always query transactions through `Transaction::active()` (= `status = 'completed'`) for sales aggregates/reports — voided ones remain in the table.
- Code generation has retry logic (`MAX_CODE_ATTEMPTS`) for race-safety on concurrent checkouts.
- Stock check + deduction happens under row lock inside the same transaction — don't move stock checks outside `checkout()`.
- `void()` restocks per product (`groupBy('product_id')` + single `increment`) and soft-deletes all items in one `whereIn(...)->update()` — avoid reverting to a per-item loop (N+1).
- Void confirmation in `Transactions/Index.jsx` uses a custom `Modal` with a reason textarea (not `window.prompt`), with a per-row loading state (`voidingId`) disabling the button during `router.delete`.
- `Transactions/Create.jsx` `ProductCard` shows `product.stock - cartQty` (remaining stock) so the displayed count reflects items already in cart, without re-fetching.
