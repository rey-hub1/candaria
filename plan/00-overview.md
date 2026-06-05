# Plan Perbaikan Bug QC — Candaria SMEKDA

Sumber: `public/QC - Check List - Candaria Smekda.pdf` (Tester: Helma, 5 Juni 2026)

Plan dipecah per file. Tiap file berisi: masalah, akar penyebab (root cause) dengan lokasi file:line, rencana fix, file yang disentuh, dan cara verifikasi. **Belum ada eksekusi** — ini dokumen rencana saja.

## Urutan Prioritas

| Prioritas | File Plan | Bug | Dampak |
|-----------|-----------|-----|--------|
| 🔴 P0 | [01-critical-sys01-reports-products.md](01-critical-sys01-reports-products.md) | SYS-01: Laporan Produk error 500 di hosting | Halaman down di production |
| 🔴 P0 | [02-void-batal-button.md](02-void-batal-button.md) | FN-04: Tombol Batal mati total | Fitur pembatalan tak jalan |
| 🟠 P1 | [03-double-notification.md](03-double-notification.md) | FN-02/FN-03: Notifikasi muncul 2x | Bingungkan kasir |
| 🟠 P1 | [04-physical-keyboard.md](04-physical-keyboard.md) | UX-01/02, FN-01/02: Keyboard fisik diblokir | Perlambat kerja kasir |
| 🟠 P1 | [05-keyboard-prefix-dynamic.md](05-keyboard-prefix-dynamic.md) | FN-01/FN-05: Prefix kategori tak dinamis | Tombol keyboard salah/kosong |
| 🟡 P2 | [06-duplicate-hapus-key.md](06-duplicate-hapus-key.md) | Redundansi + UI-02: 2 tombol Hapus | UX, makan ruang layar |
| 🟡 P2 | [07-mobile-ui.md](07-mobile-ui.md) | UI-01/02/03: Login responsif, kontras kalender, jarak tombol | Mobile rusak |
| 🟢 P3 | [08-suggestions.md](08-suggestions.md) | UX-04/05: Unduh struk digital, searchable dropdown | Feature request |

## Ringkasan Akar Penyebab (cepat)

1. **SYS-01** — `ReportController::products()` pakai `groupBy('products.id')` + `select('products.*')` + `orderBy('products.category_id')`. Ditolak MySQL strict `ONLY_FULL_GROUP_BY` di hosting.
2. **FN-04 (Void)** — `Transactions/Index.jsx` panggil `router.delete()` tapi `router` **tidak di-import**. → ReferenceError, klik tak ada efek.
3. **Notif ganda** — `AuthenticatedLayout.jsx` punya 2 sumber toast (mount `useEffect` baca flash + listener `router.on('success')`). Layout remount tiap navigasi → flash kebaca 2x.
4. **Keyboard fisik** — input di `Transactions/Create.jsx` pakai atribut `readOnly` (line 311, 569, 920) → keyboard fisik mati total.
5. **Prefix tak dinamis** — kolom DB mismatch. `CategoryController` tulis ke kolom `prefix`, tapi `TransactionController::create()` baca kolom `code`.
6. **2 tombol Hapus** — `CustomKeyboard.jsx` layout prefix punya `{bksp}` (display "⌫ Hapus") DAN `{clear}` (display "Hapus") berdampingan.
7. **Mobile** — login overflow horizontal, kontras kalender putih-putih, jarak tombol Detail/Void mepet.
