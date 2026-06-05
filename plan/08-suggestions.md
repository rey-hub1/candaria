# P3 — Saran/Feature Request (Bukan Bug)

Status di QC: Open / Suggestion. Tidak blokir, kerjakan setelah bug.

---

## UX-04 / Kasir UX-01 — Unduh Struk Digital (PDF/Gambar)

### Permintaan
Tambah tombol "Unduh PDF/Gambar" di cetak struk & di tiap baris Riwayat Transaksi. Berguna kalau printer termal rusak / pelanggan minta struk digital.

### Rencana
- Backend: tambah route + method di `TransactionController` (mis. `downloadReceipt($id)`), render view struk → PDF via `barryvdh/laravel-dompdf` (sudah dipakai di `ReportController`, lihat `Pdf::loadView`).
- Reuse view struk yang sudah ada (`Transactions/Show` / view cetak) → buat blade `receipts/receipt_pdf.blade.php`.
- Frontend: tombol unduh di `Transactions/Show.jsx` & per baris `Transactions/Index.jsx`.
- Format PNG: opsional, bisa pakai `html2canvas` di client dari komponen struk.

### File Disentuh
- `app/Http/Controllers/TransactionController.php`, `routes/web.php`
- `resources/views/receipts/*` (blade PDF baru)
- `resources/js/Pages/Transactions/Show.jsx`, `Index.jsx`

---

## UX-05 — Searchable Dropdown Siswa (Tambah Produk)

### Permintaan
Dropdown "Pilih siswa..." di Tambah Produk (tipe titipan siswa) masih select statis. Kalau siswa banyak → scroll lama. Minta jadi searchable (ketik nama/kelas).

### Rencana
- Ganti `<select>` siswa di `resources/js/Pages/Products/Create.jsx` (& `Edit.jsx`) dengan komponen searchable.
- Opsi: pakai lib (`react-select`) atau bikin combobox ringan (input + filter list). Cek apakah sudah ada pola dropdown searchable lain di proyek dulu (reuse).
- Pastikan data siswa (`sellers`) sudah dikirim ke page; filter di client kalau jumlah wajar, atau server-side search kalau besar.

### File Disentuh
- `resources/js/Pages/Products/Create.jsx`, `Edit.jsx`
- (mungkin) komponen baru `Components/SearchableSelect.jsx`

---

## Verifikasi
1. Unduh struk PDF dari halaman struk & dari baris riwayat → file valid, isi benar.
2. Dropdown siswa: ketik nama/kelas → list terfilter, pilih → tersimpan benar.
