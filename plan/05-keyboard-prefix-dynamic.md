# P1 — FN-01 & FN-05: Prefix Kategori di Keyboard Tidak Dinamis

## Masalah
- FN-01: kategori baru ditambah → tombol prefix-nya tak otomatis muncul di Keyboard Kasir.
- FN-05: prefix kategori diubah (mis. 'A'→'B') → tombol di keyboard checkout masih tampilkan kode lama.

## Akar Penyebab — **Kolom DB Mismatch**
Ada DUA kolom prefix di tabel `categories`:
- `code` (varchar 2) — migrasi `2026_06_02_173236_add_code_to_categories_table.php`
- `prefix` (varchar 5) — migrasi `2026_06_03_022629_add_prefix_to_categories_table.php`

Penulisan vs pembacaan beda kolom:
- **Tulis** → `app/Http/Controllers/CategoryController.php:32,50` (`store`/`update`) menyimpan ke kolom **`prefix`**.
- **Baca** → `app/Http/Controllers/TransactionController.php:54`:
  ```php
  $prefixes = Category::select('code')->whereNotNull('code')->distinct()->pluck('code')->values();
  ```
  Membaca kolom **`code`** (kolom lama).

Jadi: tambah/edit kategori update `prefix`, tapi keyboard baca `code` yang stale/null → tombol salah atau hilang.

## Rencana Fix
Satukan ke satu kolom. **Rekomendasi: pakai `prefix` (yang aktif ditulis)**, pensiunkan `code`.

1. Ubah `TransactionController::create()` line 54 → baca `prefix`:
   ```php
   $prefixes = Category::whereNotNull('prefix')
       ->distinct()->pluck('prefix')->values();
   ```
2. Audit semua referensi kolom `code` di codebase (`grep -rn "'code'" app resources`). Pastikan tak ada konsumen lain.
3. (Opsional, bersih-bersih) Migrasi data `code`→`prefix` untuk kategori lama yang `prefix`-nya null, lalu drop kolom `code` di migrasi baru.

## Catatan CustomKeyboard
`CustomKeyboard.jsx:50-58` `getPrefixRows` sudah `toUpperCase()` & susun per 10 tombol. Prop `prefixes` reaktif terhadap props halaman — begitu controller kirim data benar (dan halaman reload saat masuk checkout), tombol langsung update. Tak perlu ubah komponen.

## File Disentuh
- `app/Http/Controllers/TransactionController.php` (line 54)
- (opsional) migrasi baru untuk konsolidasi/ drop kolom `code`
- (opsional) `app/Models/Category.php` `$fillable` (line 14) bila kolom `code` dibuang

## Verifikasi
1. Tambah kategori baru dengan prefix → buka checkout → tombol prefix baru muncul.
2. Edit prefix kategori 'A'→'B' → buka checkout → tombol berubah 'B'.
3. Pencarian produk via tombol prefix masih filter benar.
4. Kategori lama (yang dulu pakai `code`) tetap punya prefix tampil (cek butuh migrasi data).
