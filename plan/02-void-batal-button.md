# P0 — FN-04: Tombol Batal (Void) Tidak Berfungsi

## Masalah
Tombol "Batal" di Riwayat Transaksi (Admin & Kasir) tak ada respons sama sekali saat diklik. Data transaksi tetap utuh, tak ada notifikasi/konfirmasi.

## Akar Penyebab
`resources/js/Pages/Transactions/Index.jsx:2`

```jsx
import { Head, Link } from '@inertiajs/react';   // <-- router TIDAK di-import
```

Handler tombol Batal (line 87 mobile, line 144 desktop):

```jsx
openConfirm({ message: 'Yakin batalkan transaksi ini?' },
    () => router.delete(route('transactions.destroy', t.id)));   // router undefined → ReferenceError
```

`router` dipakai tapi tidak diimpor → `Uncaught ReferenceError: router is not defined` saat callback jalan. Modal konfirmasi mungkin muncul, tapi saat klik "Ya" callback crash diam-diam. Cocok dengan gejala "bertingkah seperti tombol biasa".

## Rencana Fix
Tambahkan `router` ke import:

```jsx
import { Head, Link, router } from '@inertiajs/react';
```

Opsional, perkuat UX delete:
```jsx
() => router.delete(route('transactions.destroy', t.id), { preserveScroll: true })
```

## File Disentuh
- `resources/js/Pages/Transactions/Index.jsx` (line 2; cek juga line 87 & 144 pakai handler sama)

## Verifikasi
1. Buka Riwayat Transaksi → klik Batal → modal konfirmasi muncul → klik Ya.
2. Cek backend `TransactionController::destroy()` (line 204): stok dikembalikan, transaksi terhapus/berubah status.
3. Cek tampilan **desktop & mobile** dua-duanya (dua blok handler).
4. Pastikan notifikasi sukses muncul **1x** (lihat plan 03 — jangan sampai jadi 2x).
5. Cek tidak ada error di console browser.

## Catatan
Bug ini "silent" karena ReferenceError di dalam callback tak ditangkap. Pertimbangkan lint rule `no-undef` agar ketahuan saat build.
