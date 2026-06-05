# P1 — FN-02/FN-03: Notifikasi Sukses Muncul 2x

## Masalah
Setiap aksi krusal berhasil (checkout, batal transaksi / kembalikan stok), pop-up notifikasi sukses muncul **2 kali berturut-turut**.

## Akar Penyebab
`resources/js/Layouts/AuthenticatedLayout.jsx` punya **dua sumber toast** untuk flash yang sama:

1. **Mount effect** (line 22-30): saat layout mount, baca `flash?.success` → `addToast`.
2. **Listener navigasi** (line 32-46): `router.on('success')` → baca `pageFlash.success` → `addToast`.

Layout dipasang per-page (`<AuthenticatedLayout>` di dalam render tiap page, bukan persistent layout Inertia). Jadi setiap redirect-after-POST:
- event `success` memicu listener (#2) → toast 1
- page tujuan mount ulang → mount effect (#1) baca flash sama → toast 2

= **dobel**.

## Rencana Fix (pilih satu)

### Opsi A — Satu sumber saja (paling simpel, rekomendasi)
Hapus mount effect (line 22-30), andalkan listener `router.on('success')`. Tapi listener tidak nangkap flash saat **initial full page load** (login pertama). Solusi: gunakan `router.on('success')` + handle initial load via cek apakah event sudah pernah jalan. Lebih aman → Opsi B.

### Opsi B — Jadikan layout persistent (akar masalah sebenarnya)
Pakai persistent layout Inertia supaya layout tidak remount tiap navigasi:
```jsx
// di tiap Page, ganti pembungkus <AuthenticatedLayout> jadi:
Page.layout = (page) => <AuthenticatedLayout children={page} />
```
Dengan persistent layout, mount effect cuma jalan 1x (initial), listener handle sisanya → tidak dobel. Tapi ini perubahan besar ke banyak page.

### Opsi C — Dedupe by flash signature (paling kecil blast radius)
Simpan signature flash terakhir (mis. `flash.success + timestamp`) di ref/state; skip kalau sama. Atau beri tiap flash id unik dari server dan track yang sudah ditampilkan.

**Rekomendasi praktis:** Opsi A varian — hapus mount effect, dan untuk initial flash gunakan flag/sessionStorage agar tidak hilang. Atau Opsi C kalau mau minimal risiko.

## Catatan tambahan
- Line 11-13: toast `success` di-suppress khusus route `transactions.create`. Artinya notif checkout datang dari mekanisme lain (cek `Create.jsx` apakah ada toast lokal). Pastikan setelah fix, checkout tetap kasih **1** notif, bukan 0 atau 2.
- Verifikasi interaksi dengan plan 02 (void) — sumber notif batal transaksi.

## File Disentuh
- `resources/js/Layouts/AuthenticatedLayout.jsx` (line 10-46)
- Mungkin `resources/js/Pages/Transactions/Create.jsx` (cek toast checkout lokal)

## Verifikasi
1. Checkout → notif sukses muncul **tepat 1x**.
2. Batal transaksi → notif sukses **1x**.
3. Aksi lain (tambah produk, edit kategori) → notif tetap 1x.
4. Login pertama (full page load) dengan flash → notif tetap muncul (jangan sampai hilang).
