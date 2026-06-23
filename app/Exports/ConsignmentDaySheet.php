<?php

namespace App\Exports;

use App\Services\WeeklyReportService;
use Carbon\Carbon;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

class ConsignmentDaySheet implements FromView, WithTitle, ShouldAutoSize
{
    public function __construct(
        protected Carbon $date,
        protected WeeklyReportService $service,
    ) {}

    public function title(): string
    {
        return strtoupper($this->service->namaHari($this->date));
    }

    public function view(): View
    {
        return view('reports.weekly.consignment_day', [
            'date' => $this->date,
            'hari' => $this->service->namaHari($this->date),
            'tanggal' => $this->service->tanggalIndo($this->date),
            'rows' => $this->service->consignmentDay($this->date),
        ]);
    }
}
