<?php

namespace App\Jobs;

use App\Services\WhatsAppService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendWhatsAppMessage implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public readonly string $phone,
        public readonly string $message,
    ) {}

    public function handle(WhatsAppService $wa): void
    {
        $wa->send($this->phone, $this->message);
    }
}
