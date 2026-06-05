# P1 — UX-01/02 & FN-01/02 (Kasir): Keyboard Fisik Diblokir

## Masalah
On-screen keyboard (Keyboard Kasir) mematikan fungsi keyboard fisik laptop/PC total. Di kolom **Pencarian Produk** dan **Nominal Bayar**, kasir non-touchscreen dipaksa klik tombol layar pakai mouse → lambat.

## Akar Penyebab
`resources/js/Pages/Transactions/Create.jsx` — input pakai atribut `readOnly` untuk cegah keyboard native HP, tapi efek sampingnya keyboard fisik **juga mati**:
- line 311: input pencarian → `readOnly // Prevent native keyboard`
- line 569: input (cart/qty atau nominal) → `readOnly`
- line 920: input → `readOnly // Prevent native keyboard`

`readOnly` bikin field tak terima input apa pun dari keyboard fisik.

## Rencana Fix
Butuh dukung **dua skenario**: touchscreen (pakai on-screen keyboard) + desktop (keyboard fisik). Pilihan:

### Opsi A — Deteksi device, kondisikan `readOnly` (rekomendasi)
Hanya `readOnly` di perangkat touch; di non-touch biarkan editable + tetap bisa buka on-screen keyboard opsional.
```jsx
const isTouch = typeof window !== 'undefined'
  && window.matchMedia('(pointer: coarse)').matches;
// ...
readOnly={isTouch}
onClick={() => setActiveInput('search')}
onChange={(e) => setLocalSearch(e.target.value)}   // sudah ada, biar physical keyboard masuk
```
On-screen keyboard tetap muncul saat field di-tap (touch). Di desktop, user ketik langsung; on-screen keyboard tetap bisa dibuka manual kalau perlu.

### Opsi B — Buang `readOnly`, cegah native keyboard HP via teknik lain
Hapus `readOnly`, untuk HP gunakan `inputMode` + blur trik, atau biarkan native keyboard HP muncul (banyak kasir HP justru nyaman pakai native). On-screen keyboard jadi opsional via tombol.

**Rekomendasi:** Opsi A — minimal, jaga UX touchscreen yang sudah ada, sekaligus buka keyboard fisik untuk desktop.

## File Disentuh
- `resources/js/Pages/Transactions/Create.jsx` (line 311 pencarian, 569, 920 nominal — verifikasi mana yang search vs nominal)
- Pastikan handler `onChange` sudah set state yang benar (search → `setLocalSearch`, nominal → `setPaidAmount`).

## Verifikasi
1. **Desktop**: buka checkout, fokus ke kolom pencarian → ketik via keyboard fisik → teks masuk. Numpad di kolom Nominal Bayar → angka masuk.
2. **HP/touch**: tap field → on-screen keyboard muncul seperti sebelumnya, fungsi tak berubah.
3. Pastikan submit pencarian (Enter) & checkout tetap jalan.
4. Cek shortcut global 'c' untuk checkout (line 92) tak bentrok saat ketik di field (sudah di-guard via tagName INPUT line 87).
