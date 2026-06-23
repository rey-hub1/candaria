# Consignment (Sellers / Products / Settlements)

Internal "penitipan" model: students/sellers consign products sold through the canteen POS.

## Key files
- `app/Models/Seller.php` — "penitip" (consignor), `hasMany(Product)`
- `app/Models/Product.php` — `type` = `kantin` (canteen-owned) or `siswa` (consigned); auto `code` generation in `boot()`
- `app/Models/MarginRule.php` + `Product::resolveMargin()` — tiered margin applied to `siswa`-type products (cost_price → selling_price)
- `app/Models/Consignment.php` — stock in/out movements per seller/product
- `app/Models/SellerSettlement.php` + `app/Http/Controllers/SettlementController.php` — payout records to sellers
- `resources/js/Pages/{Sellers,Products,Settlements,MarginRules}/`

## How it works
- `type = kantin` products: canteen sets `selling_price` directly.
- `type = siswa` products: `selling_price = cost_price + resolveMargin(cost_price)`, recalculated on every save via model `boot::saving`. Margin tiers cached (`margin_rules_all`, 1hr).
- Product `code` auto-generated as `{category prefix}{NN}`, sequential per prefix, with collision retry loop.
- Settlements pay out accumulated sales proceeds to a `Seller`, recorded in `SellerSettlement`.

## Gotchas
- Margin rule cache (`margin_rules_all`) must be invalidated/forgotten when `MarginRule` changes — check `MarginRuleController` does this.
- `DashboardController::exportPenitip()` (route `penitip.export`) downloads xlsx by default (`?format=pdf` for PDF), reusing `TitipanReportExport` / `reports.titipan_pdf` scoped to the logged-in penitip's seller.
- `ReportController::penitip()` (route `reports.penitip`, page `Reports/Penitip.jsx`) — in-app sales report for the logged-in penitip, reuses `ReportService::getTitipanItems/getTitipanSummary` scoped to their `Seller`, with date filter + export buttons (linking to `penitip.export`). Both desktop sidebar and mobile nav link here ("Laporan Penjualan"/"Laporan").
- `SettlementController::index` (route `settlements.index`, page `Settlements/Index.jsx`) — Pembayaran Penitip list, also supports `?export=xlsx|pdf` (date-filtered, unpaginated) via `SettlementsReportExport` / `reports.settlements_pdf`, export buttons wired through `DateRangeFilter`'s `extra`/export props.
- `ReportController::titipan` (route `reports.titipan`, page `Reports/Titipan.jsx`) — laporan penjualan barang titipan. Filter server-side via `ReportService::getTitipanItems/getTitipanSummary($startDate,$endDate,$sellerId,$isPdf,$filters)`: `$filters` = `search` (nama/kode produk + nama penitip), `status` (`paid`/`unpaid` via `seller_settlement_id`), `sort` (whitelist: created_at/quantity/profit_seller/profit_kantin/cost_price), `dir`, `per_page` (15/25/50/100). Summary cards: total_products (count produk siswa), total_seller, total_kantin. Stat "Barang Terjual" (qty minggu/bulan/total) sudah DIPINDAH ke admin Dashboard (`DashboardController::index` → props `titipanSoldWeek/Month/All`, kartu di `Dashboard.jsx` link ke `reports.titipan`); `getTitipanSummary` masih hitung qty_week/month/all tapi tak lagi dipakai di halaman titipan. Filter tanggal + sort `date` + kolom tampil pakai `transactions.transaction_date` (query di-join ke `transactions`, `select transaction_items.*`; sort map: date→transactions.transaction_date, lainnya→transaction_items.*). Frontend: search debounce 400ms, header kolom sortable, subtotal footer per-halaman, loading via `router.on('start'/'finish')`, combobox penitip bisa diketik (`SellerCombobox`), card-view di mobile (`lg:hidden`) / tabel di desktop (`hidden lg:block`). PDF/xlsx blade juga pakai `transaction->transaction_date` (fallback created_at).
- Don't confuse this internal consignment model with the new external "vendor/mitra" marketplace (`plan/marketplace-expansion-plan.md`) — separate domain, separate tables (`vendors`, `menu_items`, not `Seller`/`Product`).
