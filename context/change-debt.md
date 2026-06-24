# Hutang Kembalian ke Customer (Change Debt)

Saat kasir tak bisa beri kembalian penuh (kehabisan receh), sisa kembalian dititipkan = hutang ke customer, diambil di kemudian hari. Tercatat di buku kas & laporan keuangan.

## Alur
1. **Checkout** (`TransactionService::checkout(..., $changeDebt, $customerName, $customerClass)`): di POS kasir pencet tombol **"Hutang ke Customer"** (komponen `TitipKembalian`, desktop+mobile). Default titip = **seluruh kembalian** (kasus kantin ga ada receh), bisa diedit untuk parsial. Kasir isi **Nama** (wajib, divalidasi di UI) + **Kelas** (opsional). Server clamp `$changeDebt` ke `[0, kembalian]`. Jika >0: buat `ChangeDebt` (`customer_name`/`customer_class` kolom terstruktur, status `unpaid`, `date`=hari ini) + Cashbook **debit** (`source=change_debt`, deskripsi pakai nama) — uang receh tetap di laci jadi kas masuk.
2. **Pelunasan** (`TransactionService::settleChangeDebt($debt, $user)`): tandai `paid` + `paid_at`/`paid_by` + Cashbook **credit** (kas keluar). Idempotent (tolak jika sudah lunas).

## Akses
- Halaman `change-debts.index` (filter unpaid/paid/all + cari nama/kelas; kolom Nama & Kelas, fallback `customer_note` baris lama) & `change-debts.pay` — gated `role:admin,cashier` (kasir bisa lunasi langsung pas customer balik).

## Kode
- `App\Models\ChangeDebt` — `unpaid()` scope, `STATUS_UNPAID/PAID`, relasi `transaction/creator/payer`. Pakai `LogsActivity`.
- `App\Http\Controllers\ChangeDebtController` — `index`, `pay`.
- Cashbook logic terpusat di `TransactionService` (checkout + settle), `source='change_debt'`, `reference_id` = id ChangeDebt.
- UI: `resources/js/Pages/Transactions/Create.jsx` (komponen `TitipKembalian`, desktop+mobile), `resources/js/Pages/ChangeDebts/Index.jsx`, link sidebar di blok kasir `AuthenticatedLayout`.
- Migration `2026_06_18_000000_create_change_debts_table` + `2026_06_23_000000_add_customer_fields_to_change_debts` (kolom `customer_name`, `customer_class`). `customer_note` legacy dibiarkan (fallback baris lama).

## Integrasi laporan
- `WeeklyReportService::dailyFinance()` mengisi baris "Hutang pada customer" (Σ `amount` per `date`, sisi D) & "Pembayaran utang pada cust" (Σ `amount` per `paid_at`, sisi K) di sheet KEUANGAN HARIAN. Lihat [[weekly-report]] (`context/weekly-report.md`).

## Catatan
- `DemoDataService` mewipe `change_debts` saat reset demo.
- Akunting: titip kembalian = kas masuk hari itu (uang belum diberikan); pelunasan = kas keluar saat diberikan. Net nol lintas hari.
