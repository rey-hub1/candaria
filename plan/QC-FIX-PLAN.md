# QC Fix Plan — Candaria SMEKDA

Sumber: `QC - Check List - Candaria SMEKDA - V2.pdf` (Tester: Helma, 7 Juni 2026)
Status validasi: 9/10 temuan VALID & ke-pin di kode. 1 (J) nyata tapi root-cause butuh repro runtime.

## Daftar fix

| # | Bug | File | Aksi |
|---|-----|------|------|
| A | Hardcoded "Sidoarjo" di 5 PDF | `resources/views/reports/{cashbooks,titipan,stock,sales,products}_pdf.blade.php` | Ganti "Sidoarjo" → "Purwakarta" |
| B | Kalender putih-di-putih (mobile) | `resources/css/app.css` (global) + komponen | Tambah rule global `input[type=date]` `-webkit-text-fill-color:#0f172a` + `color-scheme:light` |
| C | Tombol "Hapus" keyboard kepotong/meluber | `resources/js/Components/CustomKeyboard.jsx` | Breakpoint mobile 640→768, hapus `overflow:hidden` di span, lebarkan + perkecil font tombol fungsi |
| D | Progress bar hijau | `resources/js/app.jsx` | `#10b981` → `#6366f1` (indigo brand) |
| E | "Transaksi Selanjutnya" vs "Void" mepet | `resources/js/Pages/Transactions/Show.jsx` | `gap-2` → `gap-3`, stack vertikal di mobile |
| F | Keranjang belanja kependekan | `resources/js/Pages/Transactions/Create.jsx` | Tambah `min-h-0` di container list |
| G | Dropdown "Pilih siswa" gak searchable | `resources/js/Components/SearchableSelect.jsx` (baru) + `Pages/Products/Index.jsx` | Combobox searchable |
| H | Tombol "Lihat Semua Menu" nabrak teks | `resources/js/Pages/Welcome.jsx` | Jadikan block + margin bawah cukup |
| I | Label "Rp" sumbu Y grafik kepotong | `resources/js/Pages/Dashboard.jsx` | `margin left:-20` → `left:0`, format `value/1000` |
| J | Profile penitip CRASH (CRITICAL) | `resources/js/Pages/Profile/Edit.jsx` | Defensive null-guard `auth.user`; root-cause butuh repro DevTools mobile |

## Eksekusi
1. Edit semua file di atas.
2. `npm run build`.
3. Commit.
