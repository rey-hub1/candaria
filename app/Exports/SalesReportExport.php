<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class SalesReportExport implements FromView, ShouldAutoSize
{
    protected $salesData;
    protected $startDate;
    protected $endDate;
    protected $grandTotalSales;
    protected $grandTotalProfitKantin;
    protected $grandTotalProfitSeller;

    public function __construct($salesData, $startDate, $endDate, $grandTotalSales, $grandTotalProfitKantin, $grandTotalProfitSeller)
    {
        $this->salesData = $salesData;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->grandTotalSales = $grandTotalSales;
        $this->grandTotalProfitKantin = $grandTotalProfitKantin;
        $this->grandTotalProfitSeller = $grandTotalProfitSeller;
    }

    public function view(): View
    {
        return view('reports.sales_xlsx', [
            'salesData' => $this->salesData,
            'startDate' => $this->startDate,
            'endDate' => $this->endDate,
            'grandTotalSales' => $this->grandTotalSales,
            'grandTotalProfitKantin' => $this->grandTotalProfitKantin,
            'grandTotalProfitSeller' => $this->grandTotalProfitSeller,
        ]);
    }
}
