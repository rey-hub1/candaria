# P2 — Redundansi & UI-02: Dua Tombol "Hapus" di Keyboard Kasir

## Masalah
Di Keyboard Kasir ada 2 tombol berlabel "Hapus" dengan fungsi sama. Di HP makan ruang layar.

## Akar Penyebab
`resources/js/Components/CustomKeyboard.jsx` — di layout mode prefix, dua tombol punya display "Hapus":

- `{bksp}` → display `"⌫ Hapus"` (line 134)
- `{clear}` → display `"Hapus"` (line 139)

Layout `default` (prefix mode), line 94-99:
```js
default: [
    "1 2 3 4 5 6 7 8 9 0 {bksp}",       // ⌫ Hapus
    ...prefixRows,
    "{mode} {clear} {close} {enter}"     // Hapus (clear)
]
```
Keduanya tampak sebagai "Hapus" walau beda fungsi: `{bksp}` hapus 1 karakter, `{clear}` hapus semua. Tester anggap duplikat karena label sama.

## Rencana Fix
Bedakan jelas atau buang salah satu:

### Opsi A — Bedakan label (rekomendasi, simpel)
Ubah display agar tak ambigu (line 133-141):
```js
"{bksp}": "⌫ Hapus",          // hapus 1 karakter
"{clear}": "🗑️ Hapus Semua",  // hapus seluruh teks
```

### Opsi B — Buang `{clear}` dari baris bawah
Hapus `{clear}` di line 98, sisakan `{bksp}` saja. Layout jadi `"{mode} {close} {enter}"`. Hemat ruang HP, tapi hilang fungsi "hapus semua" (kasir bisa long-press bksp / tahan).

**Rekomendasi:** Opsi A — pertahankan fungsi, hilangkan kebingungan. Kalau prioritas hemat ruang HP → Opsi B.

## File Disentuh
- `resources/js/Components/CustomKeyboard.jsx` (line 98 layout, line 134/139 display)

## Verifikasi
1. Buka Keyboard Kasir mode prefix → cek label kedua tombol jelas beda.
2. `⌫ Hapus` → hapus 1 karakter. `Hapus Semua` → kosongkan field.
3. Cek layout mode `full` & `numeric` tak ikut rusak.
4. Cek tampilan HP tidak overflow.
