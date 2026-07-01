<?php

namespace App\Console\Commands;

use App\Jobs\SendWhatsAppMessage;
use App\Models\FeatureFlag;
use App\Models\Setting;
use App\Models\Transaction;
use App\Models\User;
use App\Services\WeeklyReportService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendDailyReportWa extends Command
{
    protected $signature   = 'wa:daily-report {--force : Kirim meski sudah terkirim hari ini}';
    protected $description = 'Kirim ringkasan laporan harian via WhatsApp ke admin';

    public const SENT_KEY = 'wa_daily_report_sent';

    public function handle(WeeklyReportService $svc): int
    {
        if (! FeatureFlag::enabled('wa_daily_report')) {
            $this->info('[WA Daily] flag wa_daily_report mati, dilewati.');
            return self::SUCCESS;
        }

        $today = now()->toDateString();

        if (! $this->option('force') && Setting::get(self::SENT_KEY) === $today) {
            $this->info('[WA Daily] sudah terkirim hari ini, dilewati.');
            return self::SUCCESS;
        }

        $recipients = User::where('role', 'admin')
            ->whereNotNull('phone')
            ->where('phone', '!=', '')
            ->pluck('phone');

        if ($recipients->isEmpty()) {
            $this->warn('[WA Daily] tidak ada admin dengan nomor HP terdaftar.');
            return self::SUCCESS;
        }

        $message = $this->buildMessage($svc, Carbon::today());

        foreach ($recipients as $phone) {
            SendWhatsAppMessage::dispatch($phone, $message);
        }

        Setting::set(self::SENT_KEY, $today);

        $this->info("[WA Daily] dispatched ke {$recipients->count()} admin.");

        return self::SUCCESS;
    }

    private function buildMessage(WeeklyReportService $svc, Carbon $date): string
    {
        $finance = $svc->dailyFinance($date);

        $totalTxn = Transaction::active()
            ->whereDate('transaction_date', $date->toDateString())
            ->count();

        $hari = $svc->namaHari($date);
        $tgl  = $svc->tanggalIndo($date);

        $fmt = fn ($n) => 'Rp ' . number_format($n, 0, ',', '.');

        return implode("\n", [
            "*Laporan Harian Kantin*",
            "{$hari}, {$tgl}",
            "",
            "Penjualan Kantin   : {$fmt($finance['penjualan_harian'])}",
            "Omset Konsyiansi   : {$fmt($finance['omset_konsyiansi'])}",
            "Pengeluaran        : {$fmt($finance['pengeluaran'])}",
            "Hutang Kembalian   : {$fmt($finance['hutang_customer'])}",
            "Pelunasan Hutang   : {$fmt($finance['pembayaran_utang'])}",
            "",
            "Total Transaksi    : {$totalTxn} transaksi",
            "",
            "Candaria - " . now()->format('H:i'),
        ]);
    }
}
