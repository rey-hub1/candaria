<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class StockReportExport implements FromView, ShouldAutoSize
{
    protected $reportData;
    protected $date;

    public function __construct($reportData, $date)
    {
        $this->reportData = $reportData;
        $this->date = $date;
    }

    public function view(): View
    {
        return view('reports.stock_xlsx', [
            'reportData' => $this->reportData,
            'date' => $this->date,
        ]);
    }
}
