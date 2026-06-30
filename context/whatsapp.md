# WhatsApp Integration (Waha)

Notifikasi & OTP via WhatsApp menggunakan [Waha](https://waha.devlike.pro/) — self-hosted WhatsApp HTTP API.

## Infra (Fase 0)

### Konfigurasi
- `.env`: `WA_ENABLED`, `WA_BASE_URL` (default `http://localhost:3000`), `WA_API_KEY`, `WA_SESSION` (default `default`).
- `config/services.php` blok `waha`.

### Kode
- `App\Services\WhatsAppService` — `send(phone, message): bool`. Normalisasi nomor `08xx`/`8xx` → `628xx@c.us`. Jika `WA_ENABLED=false`, skip tanpa throw. Log gagal ke channel `daily`.
- `App\Jobs\SendWhatsAppMessage` — queued (implements `ShouldQueue`), retry 3x, backoff 60s. Semua kirim WA harus lewat job ini, jangan langsung dari request.

### Waha API endpoint
- `POST {WA_BASE_URL}/api/sendText` — `{ session, chatId, text }`.
- Auth header: `X-Api-Key: {WA_API_KEY}` (opsional jika Waha tanpa auth).

### Feature flags (group `whatsapp`, semua default `false`)
| Key | Fitur |
|-----|-------|
| `wa_change_debt` | Notif hutang kembalian |
| `wa_weekly_report` | Kirim laporan mingguan tiap Senin |
| `wa_penitip_otp` | OTP reset password penitip |

## Fase berikutnya
- **Fase 1** (`wa_change_debt`): tambah `customer_phone` ke `change_debts`, dispatch job saat checkout + tombol "Ingatkan" manual. Lihat [[change-debt]].
- **Fase 2** (`wa_weekly_report`): command + scheduler kirim 2 file Excel. Lihat [[weekly-report]].
- **Fase 3** (`wa_penitip_otp`): OTP 6 digit via cache (TTL 5 mnt), rate-limit, flow ubah PW. Lihat [[student-accounts]].

## Prasyarat deploy
- Waha berjalan dan session `default` sudah terhubung ke WA.
- Queue worker aktif: `php artisan queue:work`.
- Scheduler aktif (untuk Fase 2): `php artisan schedule:work` atau cron `* * * * * php artisan schedule:run`.
