<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private string $baseUrl;
    private ?string $apiKey;
    private string $session;
    private bool $enabled;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.waha.base_url', 'http://localhost:3000'), '/');
        $this->apiKey  = config('services.waha.api_key');
        $this->session = config('services.waha.session', 'default');
        $this->enabled = (bool) config('services.waha.enabled', false);
    }

    public function send(string $phone, string $message): array
    {
        return $this->post('/api/sendText', $phone, [
            'text' => $message,
        ]);
    }

    public function sendImage(string $phone, string $caption, string $imageUrl): array
    {
        return $this->post('/api/sendImage', $phone, [
            'caption' => $caption,
            'file'    => ['url' => $imageUrl, 'mimetype' => 'image/jpeg'],
        ]);
    }

    public function sendDocument(string $phone, string $caption, string $fileUrl, string $filename = 'document.pdf'): array
    {
        return $this->post('/api/sendFile', $phone, [
            'caption' => $caption,
            'file'    => ['url' => $fileUrl, 'mimetype' => 'application/pdf', 'filename' => $filename],
        ]);
    }

    // Returns ['ok' => bool, 'error' => string|null].
    private function post(string $endpoint, string $phone, array $extra): array
    {
        if (! $this->enabled) {
            return ['ok' => false, 'error' => 'WA_ENABLED=false — pesan tidak dikirim.'];
        }

        $chatId = $this->toChatId($phone);
        if (! $chatId) {
            return ['ok' => false, 'error' => "Nomor tidak valid: {$phone}"];
        }

        $payload = array_merge(['session' => $this->session, 'chatId' => $chatId], $extra);

        try {
            $response = Http::withHeaders($this->headers())
                ->timeout(10)
                ->post("{$this->baseUrl}{$endpoint}", $payload);

            if (! $response->successful()) {
                $body = $response->body();
                Log::warning("[WA] {$endpoint} failed", ['phone' => $phone, 'status' => $response->status(), 'body' => $body]);
                return ['ok' => false, 'error' => "HTTP {$response->status()}: {$body}"];
            }

            return ['ok' => true, 'error' => null];
        } catch (\Throwable $e) {
            Log::error("[WA] {$endpoint} exception", ['phone' => $phone, 'error' => $e->getMessage()]);
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    // Ping Waha — returns ['ok', 'version'|null, 'error'|null].
    public function status(): array
    {
        try {
            $response = Http::withHeaders($this->headers())->timeout(5)->get("{$this->baseUrl}/api/version");
            if ($response->successful()) {
                return ['ok' => true, 'version' => $response->json('version'), 'error' => null];
            }
            return ['ok' => false, 'version' => null, 'error' => "HTTP {$response->status()}: {$response->body()}"];
        } catch (\Throwable $e) {
            return ['ok' => false, 'version' => null, 'error' => $e->getMessage()];
        }
    }

    // Normalize Indonesian phone to Waha chatId format (628xxx@c.us).
    public function toChatId(string $phone): ?string
    {
        $digits = preg_replace('/\D/', '', $phone);

        if (strlen($digits) < 8) {
            return null;
        }

        if (str_starts_with($digits, '0')) {
            $digits = '62' . substr($digits, 1);
        } elseif (str_starts_with($digits, '8')) {
            $digits = '62' . $digits;
        }

        return $digits . '@c.us';
    }

    private function headers(): array
    {
        $headers = ['Content-Type' => 'application/json'];
        if ($this->apiKey) {
            $headers['X-Api-Key'] = $this->apiKey;
        }
        return $headers;
    }
}
