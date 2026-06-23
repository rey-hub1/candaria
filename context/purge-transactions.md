# Hapus Transaksi Lama (Super Admin)

Tool super-admin untuk purge arsip transaksi: hapus permanen transaksi yang **lebih tua dari** rentang terpilih (1 minggu / 1 bulan / 3 bulan / 6 bulan / 1 tahun). Data terbaru tetap.

## Semantik
- Keyed off `transactions.transaction_date`. Cutoff = `Carbon::today()->sub<rentang>()`. Hapus baris dengan `transaction_date < cutoff`.
- Rentang: `1w`/`1m`/`3m`/`6m`/`1y` (const `TransactionPurgeController::RANGES`).
- Mencakup semua status (termasuk `voided`) yang lebih tua dari cutoff.

## Cakupan hapus
- **Transaksi + `transaction_items`** — item terhapus otomatis lewat FK `onDelete('cascade')` di DB (hard delete, abaikan soft-delete). Pakai query-builder `->delete()` (SQL DELETE memicu cascade; SQLite `foreign_keys=ON` by default).
- **Cashbook DIBIARKAN** — entri `source=transaction` tidak disentuh (keputusan user). Catatan: laporan kas bisa tak cocok dgn transaksi setelah purge.
- Permanen, tidak ada undo.

## Kode
- `App\Http\Controllers\SuperAdmin\TransactionPurgeController` — `index()` (preview jumlah baris per rentang + cutoff + total & transaksi terlama), `destroy()` (validasi `range`, hapus dalam `DB::transaction`, flash jumlah terhapus).
- Routes (gated `role:super_admin`): `super-admin.purge-transactions.index` (GET), `super-admin.purge-transactions.destroy` (DELETE).
- Page: `Pages/SuperAdmin/PurgeTransactions.jsx` — kartu per rentang dgn live count, tombol nonaktif kalau 0, `ConfirmModal` sebelum hapus.
- Nav: link "Hapus Transaksi Lama" di blok super_admin `AuthenticatedLayout.jsx`.

## Gotchas
- Aksi destruktif & permanen — selalu dikonfirmasi di UI dulu.
- Cashbook tidak ikut terhapus by design; kalau perlu konsistensi penuh buku kas, hapus manual entri `source=transaction reference_id=<id>` (tapi id sudah hilang setelah purge — pertimbangkan ekspor dulu).
