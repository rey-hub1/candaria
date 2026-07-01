<?php

namespace App\Console\Commands;

use App\Jobs\SendWhatsAppMessage;
use App\Models\FeatureFlag;
use App\Models\Setting;
use App\Models\User;
use App\Services\WhatsAppService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckWaHealth extends Command
{
    protected $signature   = 'wa:health-check';
    protected $description = 'Pantau Waha; alert kalau mati sementara ada fitur WA yang nyala';

    // Setting berisi JSON: {status: up|down|disabled, checked_at, version, error}.
    public const HEALTH_KEY = 'wa_health';

    public function handle(WhatsAppService $wa): int
    {
        $flagsOn = FeatureFlag::where('group', 'whatsapp')
            ->where('is_enabled', true)
            ->exists();

        // Tidak ada fitur WA aktif → tak ada yang perlu diawasi, kosongkan alert.
        if (! $flagsOn) {
            $this->persist('disabled', null, null);
            $this->info('[WA Health] tidak ada fitur WA aktif, dilewati.');
            return self::SUCCESS;
        }

        $prev       = json_decode((string) Setting::get(self::HEALTH_KEY), true) ?: [];
        $prevStatus = $prev['status'] ?? 'unknown';

        // WA_ENABLED=false tapi flag WA nyala = salah konfigurasi, perlakukan sebagai mati.
        if (! config('services.waha.enabled')) {
            $this->alertDown('WA_ENABLED=false padahal ada fitur WA yang aktif.', $prevStatus);
            return self::SUCCESS;
        }

        $status = $wa->status();

        if ($status['ok']) {
            $this->persist('up', $status['version'] ?? null, null);

            if ($prevStatus === 'down') {
                Log::channel('daily')->info('[WA Health] Waha kembali online.');
                $this->notifyAdmins("✅ *Waha kembali online*\nLayanan WhatsApp Candaria sudah normal kembali.\n" . now()->format('d/m/Y H:i'));
            }

            $this->info('[WA Health] Waha OK.');
            return self::SUCCESS;
        }

        $this->alertDown($status['error'] ?? 'tidak diketahui', $prevStatus);
        return self::SUCCESS;
    }

    private function alertDown(string $error, string $prevStatus): void
    {
        $this->persist('down', null, $error);

        // Log tiap run supaya jejak downtime jelas; hanya sekali critical saat transisi.
        if ($prevStatus !== 'down') {
            Log::channel('daily')->critical('[WA Health] Waha MATI sementara fitur WA aktif.', ['error' => $error]);
        } else {
            Log::channel('daily')->warning('[WA Health] Waha masih mati.', ['error' => $error]);
        }

        $this->error("[WA Health] Waha MATI: {$error}");
    }

    private function persist(string $status, ?string $version, ?string $error): void
    {
        Setting::set(self::HEALTH_KEY, json_encode([
            'status'     => $status,
            'checked_at' => now()->toIso8601String(),
            'version'    => $version,
            'error'      => $error,
        ]));
    }

    // Notif WA hanya berguna saat Waha hidup (mis. saat recovery) — dispatch ke admin ber-HP.
    private function notifyAdmins(string $message): void
    {
        User::whereIn('role', ['admin', 'super_admin'])
            ->whereNotNull('phone')
            ->where('phone', '!=', '')
            ->pluck('phone')
            ->each(fn ($phone) => SendWhatsAppMessage::dispatch($phone, $message));
    }
}
