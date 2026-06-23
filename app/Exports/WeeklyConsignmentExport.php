<?php

namespace App\Exports;

use App\Services\WeeklyReportService;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

/** LAPORAN KONSYIANSI: satu sheet per hari aktif dalam minggu terpilih. */
class WeeklyConsignmentExport implements WithMultipleSheets
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

        return array_map(fn ($date) => new ConsignmentDaySheet($date, $this->service), $days);
    }
}
