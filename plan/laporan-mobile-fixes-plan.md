# Fix laporan bugs, mobile login, ekspor titipan, upload foto

## Context
User report banyak bug/keluhan kecil di laporan & UI mobile, plus permintaan fitur baru. Daftar item:
1. Export PDF "bulan" data ga sesuai / cuma ambil dikit.
2. Laporan Penjualan & Titipan: klik filter "Semua" → data kosong.
3. Laporan Stok Harian punya filter tanggal (user bingung) → keputusan: hapus, selalu tampilkan hari ini.
4. Kalender date-input putih-di-atas-putih di mobile (kontras hilang).
5. Tidak ada tombol Login di mobile (landing page).
6. Ekspor Titipan kurang fleksibel → tambah filter per Penitip/Siswa.
7. Upload foto produk/menu/logo: tambah crop 1:1 interaktif + auto-resize/compress.

## 1+2. Fix "Semua" filter & PDF bulan bug
**Root cause**: `resources/js/hooks/useDateFilter.js` preset `'all'` mengirim `start_date=''` & `end_date=''`. Controller pakai `$request->input('start_date', default)` — string kosong BUKAN null, jadi default tidak dipakai, lalu `whereBetween(DATE(created_at), ['', ''])` → 0 baris. Ini juga akar masalah "PDF bulan cuma ambil dikit" (PDF reflect hasil query kosong tsb).

**Fix** (backend only, di `app/Http/Controllers/ReportController.php`):
- `sales()` (~line 24-25) dan `titipan()` (~line 96-97): treat empty string sama seperti tidak ada → jika `start_date`/`end_date` kosong, skip `whereBetween` (ambil semua data) alih-alih pakai whereBetween dengan string kosong.
- Terapkan pola sama di `app/Http/Controllers/Admin/MarketplaceReportController.php` (line 17-22) — page `Admin/Reports/MarketplaceSales.jsx` juga pakai `useDateFilter`, kena bug yang sama.

Implementasi: ganti
```php
$startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
$endDate = $request->input('end_date', Carbon::now()->toDateString());
```
jadi ambil raw input, lalu hanya apply `whereBetween` jika keduanya non-empty; kalau kosong → tanpa filter tanggal (semua data). `$startDate`/`$endDate` yang dikirim ke view/PDF tetap raw value (bisa string kosong, dipakai cuma utk label & nama file — handle label "Semua Waktu" jika kosong, mirip `activeDateLabel` di frontend).

## 3. Laporan Stok Harian — hapus filter tanggal
**File**: `app/Http/Controllers/ReportController.php` method `stock()` (line 205-281) dan `resources/js/Pages/Reports/Stock.jsx`.

- Backend: hapus parameter `date` dari request, selalu pakai `Carbon::now()->toDateString()`. Logic perhitungan stok (qtySold, qtySoldAfter, dst) tetap sama dengan `$date = today`.
- Frontend `Stock.jsx`: hapus form filter tanggal (line ~73-123 bagian date input), sisakan tombol Export Excel/PDF/Cetak. Hapus `localDate` state & `handleFilterSubmit`. Export handlers (`handleExportExcel`/`handleExportPdf`) tidak perlu kirim `date` lagi (backend pakai today otomatis).
- `resources/views/reports/stock_pdf.blade.php` dan `app/Exports/StockReportExport.php`: pastikan masih terima `$date` (sekarang selalu today) — tidak perlu ubah signature, cukup controller yang selalu pass today.

## 4. Kontras kalender mobile
Sudah teratasi — `resources/js/Components/DateRangeFilter.jsx` (line 127,141,154-160) sudah punya `colorScheme: 'light'` + override webkit date-input. Tidak ada perubahan kode untuk item ini; jika user masih lihat masalah di device tertentu, perlu screenshot lebih lanjut (di luar scope plan ini).

## 5. Tombol Login hilang di mobile (landing page)
**File**: `resources/js/Pages/Welcome.jsx`.

Root cause: `.nav-links` (line 210, isi: Menu, Jajan Online, Kenapa Kami, FAQ, Semua Menu, **Masuk Staff/Dashboard**) di-`display:none !important` pada `@media (max-width: 600px)` (line 195-196) tanpa ada pengganti (no hamburger menu) — jadi link login sama sekali tidak terlihat di mobile, satu-satunya akses ada di footer (line 540) yang jauh di bawah.

Fix minimal: tambahkan tombol "Masuk" kecil di navbar yang HANYA terlihat di mobile (di luar `.nav-links`, jadi tidak ikut ter-hide), linknya sama seperti line 216-219 (`canLogin ? route('dashboard') : route('login')`). Tambahkan style class baru misal `.nav-login-mobile { display:none }` default, lalu di `@media (max-width: 600px)` set `display:flex`. Tempatkan di dalam `<nav>` (sekitar line 206-221), sejajar dengan logo.

## 6. Ekspor Titipan — filter per Penitip/Siswa
**Files**:
- `app/Http/Controllers/ReportController.php` method `titipan()` (line 94-149)
- `resources/js/Pages/Reports/Titipan.jsx`
- `app/Exports/TitipanReportExport.php`
- `resources/views/reports/titipan_pdf.blade.php` (untuk header info filter terpilih)

Plan:
- Controller: terima param baru `seller_id` (nullable). Pass ke semua query (`items`, `summary`) via `->whereHas('product', fn($q) => $q->where('type','siswa')->when($sellerId, fn($q2)=>$q2->where('seller_id',$sellerId)))`. Kirim daftar `sellers` (id, name, class — dari `App\Models\Seller`, aktif saja) ke Inertia props & ke Export/PDF.
- Frontend `Titipan.jsx`: tambah dropdown "Filter Penitip" (di atas/dekat `DateRangeFilter`), kirim `seller_id` via `router.get` query bersamaan dengan date params. Export Excel/PDF buttons sertakan `seller_id` juga.
- `TitipanReportExport` constructor terima `$sellerId`/nama seller terpilih untuk ditampilkan di header sheet (opsional, untuk konteks file export).
- `titipan_pdf.blade.php`: tampilkan info "Penitip: <nama>" jika difilter, atau "Semua Penitip" jika tidak.

## 7. Upload Foto — crop 1:1 interaktif + auto resize/compress
Currently 3 duplicate plain `<input type="file">`:
- `resources/js/Pages/Products/Index.jsx` (~line 92-95)
- `resources/js/Pages/Vendor/Menu/Index.jsx` (~line 207-211)
- `resources/js/Pages/Vendor/Profile.jsx` (~line 40-42)

**New dependency**: add `react-easy-crop` (npm install) untuk UI crop interaktif (drag/zoom).

**New component**: `resources/js/Components/ImageUploadField.jsx`
- Props: `label`, `value` (current File/null), `onChange(file)`, `currentImageUrl` (preview existing), `error`.
- Flow: pilih file → modal/overlay crop (react-easy-crop, aspect 1:1, zoom slider) → on "Pakai" → render crop area ke `<canvas>`, resize ke max 800x800, `canvas.toBlob('image/jpeg', 0.8)` → bungkus jadi `File` → panggil `onChange(file)`.
- Tampilkan preview thumbnail hasil crop + tombol "Ganti Foto".

**Integration**: ganti 3 input file di atas dengan `<ImageUploadField label="..." value={data.image} onChange={f => setData('image', f)} currentImageUrl={...} error={errors.image} />` (untuk Vendor/Profile pakai field `logo`/`logo_url`).

Backend tidak perlu berubah — hasil sudah JPEG ≤800x800, validasi `image|mimes:jpeg,png,jpg|max:2048` di `ProductController`, `MenuItemController` (line ~108), `DashboardController` (line 43/49) tetap berlaku dan akan selalu pass karena ukuran sudah dikecilkan.

## Verification
- `php artisan test` (pastikan test laporan existing masih lulus, tambah test baru kalau ada test report).
- Manual: jalankan `php artisan serve` + `npm run dev`.
  - Laporan Penjualan & Titipan: klik "Semua" → data full muncul; export PDF & Excel cek isi sesuai rentang/​"Semua".
  - Laporan Stok Harian: halaman tanpa filter tanggal, selalu data hari ini.
  - Landing page (`/`) di mobile width (<600px): tombol Masuk terlihat di navbar.
  - Laporan Titipan: filter per penitip berfungsi di web, PDF, xlsx.
  - Upload foto produk: crop 1:1 muncul, hasil gambar persegi & terkompresi, tersimpan & tampil di list.
- Update `context/pos-transactions.md` / buat catatan di `context/` index kalau ada perubahan struktur signifikan (laporan stok no longer date-filterable, titipan export filter baru).
