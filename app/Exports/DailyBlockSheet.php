<?php

namespace App\Exports;

use App\Services\WeeklyReportService;
use Carbon\Carbon;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

/** Satu sheet yang merangkai tiap hari aktif sebagai blok terpisah dalam satu view. */
class DailyBlockSheet implements FromView, WithTitle, ShouldAutoSize
{
    public function __construct(
        protected string $sheetTitle,
        protected string $viewName,
        protected array $days,
        protected Carbon $start,
        protected Carbon $end,
        protected WeeklyReportService $service,
    ) {}

    public function title(): string
    {
        return $this->sheetTitle;
    }

    public function view(): View
    {
        return view($this->viewName, [
            'days' => $this->days,
            'start' => $this->start,
            'end' => $this->end,
            'service' => $this->service,
        ]);
    }
}
