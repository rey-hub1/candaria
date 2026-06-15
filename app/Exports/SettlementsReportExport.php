<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class SettlementsReportExport implements FromView, ShouldAutoSize
{
    protected $sellers;
    protected $startDate;
    protected $endDate;
    protected $totalUnpaid;

    public function __construct($sellers, $startDate, $endDate, $totalUnpaid)
    {
        $this->sellers = $sellers;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->totalUnpaid = $totalUnpaid;
    }

    public function view(): View
    {
        return view('reports.settlements_xlsx', [
            'sellers' => $this->sellers,
            'startDate' => $this->startDate,
            'endDate' => $this->endDate,
            'totalUnpaid' => $this->totalUnpaid,
        ]);
    }
}
