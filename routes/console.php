<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Transaction;
use App\Models\Cashbook;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('transactions:cleanup', function () {
    $sevenDaysAgo = now()->subDays(7);
    $oldIds = Transaction::where('created_at', '<', $sevenDaysAgo)->pluck('id');

    if ($oldIds->isNotEmpty()) {
        Cashbook::where('source', 'transaction')->whereIn('reference_id', $oldIds)->delete();
        Transaction::whereIn('id', $oldIds)->delete();
        $this->info("Cleaned up {$oldIds->count()} old transactions.");
    } else {
        $this->info('No old transactions to clean up.');
    }
})->purpose('Delete transactions older than 7 days');

Schedule::command('transactions:cleanup')->dailyAt('02:00');
