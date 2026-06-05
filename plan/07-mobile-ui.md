# P2 — Mobile UI: UI-01, UI-02, UI-03

Tiga bug mobile terpisah. Ditangani bareng karena domain sama (responsive/visual).

---

## UI-01 — Halaman Login Tidak Responsif (zoom & geser)

### Masalah
Login bisa di-zoom & digeser kanan-kiri di HP, layout berantakan.

### Catatan investigasi
`resources/views/app.blade.php:5` **sudah** ada:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```
Jadi zoom mestinya sudah dicegah. Sisa masalah → kemungkinan **horizontal overflow** yang bikin halaman bisa digeser (dan sebagian browser HP abaikan `user-scalable=no`).

### Dugaan penyebab
`resources/js/Pages/Auth/Login.jsx` — elemen dekoratif absolute di panel kiri (`w-[50%] h-[50%]`, `left-[-10%]`, blur besar, line 34-40) di dalam `hidden lg:flex ... overflow-hidden`. Mestinya ter-clip, tapi perlu cek elemen lain yang melebihi viewport (mis. `min-w`, lebar fixed, atau panel form kanan).

### Rencana Fix
1. Audit Login cari sumber overflow horizontal: buka DevTools mobile, cari elemen lebih lebar dari viewport.
2. Bungkus root dengan `overflow-x-hidden` (line 30: `min-h-screen flex bg-slate-50`):
   ```jsx
   <div className="min-h-screen flex bg-slate-50 font-sans overflow-x-hidden">
   ```
3. Pastikan panel form mobile pakai `w-full` + padding, bukan lebar fixed.
4. Verifikasi `<html>`/`<body>` tak ada overflow (cek `app.blade.php` / CSS global).

### File Disentuh
- `resources/js/Pages/Auth/Login.jsx`
- (cek) `resources/views/app.blade.php`, CSS global

---

## UI-02 — Kontras Kalender (Date Picker) Putih di Atas Putih

### Masalah
Teks bulan/tahun/tanggal kalender di HP berwarna putih di latar putih → tak terbaca.

### Akar Penyebab (perlu konfirmasi)
Komponen date di `resources/js/Components/DateRangeFilter.jsx` (dipakai via `FilterBar`). Kemungkinan:
- Native `<input type="date">` dengan `color-scheme` gelap / teks ter-inherit putih, atau
- Popup kalender native warna teksnya ikut tema putih.

### Rencana Fix
1. Temukan input tanggal di `DateRangeFilter.jsx` (scroll bawah, bagian body kartu).
2. Set warna eksplisit + paksa skema terang:
   ```css
   input[type="date"] { color: #0f172a; color-scheme: light; }
   ```
   atau class Tailwind `text-slate-900 [color-scheme:light]`.
3. Kalau pakai library kalender custom, override warna teks header (bulan/tahun) & angka.

### File Disentuh
- `resources/js/Components/DateRangeFilter.jsx` (input tanggal)
- (mungkin) CSS global / `app.css`

---

## UI-03 — Tombol "Detail Struk" & "Void" Terlalu Mepet (misclick)

### Masalah
Di HP, tombol Detail Struk & Batal/Void mepet → risiko salah pencet void saat mau lihat detail.

### Akar Penyebab
`resources/js/Pages/Transactions/Index.jsx:78-93` (kartu mobile) — dua tombol dalam `flex gap-2`:
```jsx
<div className="pt-1 flex gap-2">
  <Link ...>Lihat Struk</Link>
  <button ...>Batal</button>
</div>
```
`gap-2` (8px) terlalu sempit untuk touch target aman.

### Rencana Fix
1. Perbesar jarak: `gap-2` → `gap-3`/`gap-4`, atau pisah tombol Batal ke baris sendiri.
2. Pastikan tinggi tombol ≥ 44px (rekomendasi touch target). Saat ini `py-2` — cek cukup.
3. Pertimbangkan beri konfirmasi 2 langkah untuk Batal (sudah ada modal confirm — bagus, kurangi risiko).

### File Disentuh
- `resources/js/Pages/Transactions/Index.jsx` (blok kartu mobile line 78-93)

---

## Verifikasi (semua UI mobile)
1. Login HP: tak bisa zoom, tak bisa geser horizontal, layout pas.
2. Kalender: teks bulan/tahun/tanggal terbaca jelas (kontras).
3. Riwayat HP: jarak tombol cukup, tak mudah salah pencet.
4. Tes di lebar 360px & 390px (HP umum).
