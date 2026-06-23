# Laporan Mingguan (Weekly Report)

Tombol manual untuk mengunduh 2 file Excel rekap satu minggu, meniru format spreadsheet asli kantin (`LAPORAN KONSYIANSI ...` & `LAPORAN HARIAN ...`). Semua angka diturunkan dari data POS — tidak ada input manual.

## Alur
- Halaman `Reports/Weekly` (route `reports.weekly`, gated admin) — pilih tanggal mana saja; sistem ambil minggu Senin–Minggu yang memuatnya. Menampilkan hari-hari yang ada aktivitas + 2 tombol unduh.
- `reports.weekly.consignment` → `WeeklyConsignmentExport` (xlsx).
- `reports.weekly.daily` → `WeeklyDailyExport` (xlsx).
- Nama file meniru referensi: `LAPORAN KONSYIANSI 15-19 JUNI 2026.xlsx` (rentang Senin–Jumat / minggu sekolah).

## Penanggalan (penting)
- Transaksi dikunci ke **`transactions.transaction_date`** (tanggal bisnis), BUKAN `created_at`. Data demo v1 menaruh `created_at` semua di hari seed, sedangkan `transaction_date` benar (Senin–Rabu) — jadi laporan ini pakai `transaction_date`. Consignment & Cashbook pakai kolom `date`.
- `config('app.locale')` = `en`, jadi nama bulan/hari diformat manual lewat `WeeklyReportService::HARI/BULAN` + `tanggalIndo()` / `namaHari()`.

## Isi file
- **KONSYIANSI** — `WithMultipleSheets`, satu sheet per hari aktif (SENIN/SELASA/…). Per seller penitip (produk `type=siswa`), per produk: Stok awal (Σ consignment `type=in` hari itu), Sisa, Jumlah terjual, Harga Reseller (`cost_price`), Harga Jual (`selling_price`), Jumlah Penerimaan (`sell×qty`), Jumlah Stor (`cost×qty` = `profit_seller`), Laba (`(sell−cost)×qty` = `profit_kantin`), + subtotal Stor per seller.
- **HARIAN** — `WithMultipleSheets`, 3 sheet, tiap hari sebagai blok:
  - `PENJUALAN HARIAN` — produk `type=kantin`; stok direkonstruksi historis (`stock + qtySoldAfter`, mirip `ReportController::stock`). Kosong jika tak ada penjualan kantin (mis. data v1 yang murni konsinyasi).
  - `PENGELUARAN HARIAN` — Cashbook `type=credit` + `source=manual` per hari. (Kolom QTY tak ada di DB → kosong.)
  - `KEUANGAN HARIAN` — ringkasan: Penjualan Harian, Pengeluaran, Omset Konsyiansi, Stor Ke Seller, + Hutang pada customer & Pembayaran utang (dari `change_debts`, lihat [[change-debt]]). Hanya "Kas masuk" yang masih 0 (tak ada di POS).

## Kode
- `App\Services\WeeklyReportService` — semua query/agregasi (`weekRange`, `activeDays`, `consignmentDay`, `dailySales`, `dailyExpenses`, `dailyFinance`).
- `App\Http\Controllers\WeeklyReportController` — `index` (Inertia) + `consignment` / `daily` (download).
- `App\Exports\WeeklyConsignmentExport` + `ConsignmentDaySheet`; `WeeklyDailyExport` + `DailyBlockSheet`.
- Views: `resources/views/reports/weekly/{consignment_day,daily_sales,daily_expenses,daily_finance}.blade.php`.
- Page: `resources/js/Pages/Reports/Weekly.jsx`; link sidebar di `AuthenticatedLayout` (`ADMIN_MENU`).

## Catatan / belum
- Pengiriman = unduh manual saja (belum auto email/WA; `MAIL_MAILER=log`).
- Penerima/jadwal otomatis bisa ditambah nanti via scheduler (`routes/console.php`) + Mailable.
