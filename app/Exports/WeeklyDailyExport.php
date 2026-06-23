<?php

namespace App\Exports;

use App\Services\WeeklyReportService;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

/** LAPORAN HARIAN: 3 sheet (penjualan / pengeluaran / keuangan), tiap hari sebagai blok. */
class WeeklyDailyExport implements WithMultipleSheets
{
    public function __construct(
        protected Carbon $start,
        protected Carbon $end,
        protected WeeklyReportService $service,
    ) {}

    public function sheets(): array
    {
        $days = $this->service->activeDays($this->start, $this->end);
        if (empty($days)) {
            $days = [$this->start];
        }

        return [
            new DailyBlockSheet('PENJUALAN HARIAN', 'reports.weekly.daily_sales', $days, $this->start, $this->end, $this->service),
            new DailyBlockSheet('PENGELUARAN HARIAN', 'reports.weekly.daily_expenses', $days, $this->start, $this->end, $this->service),
            new DailyBlockSheet('KEUANGAN HARIAN', 'reports.weekly.daily_finance', $days, $this->start, $this->end, $this->service),
        ];
    }
}
