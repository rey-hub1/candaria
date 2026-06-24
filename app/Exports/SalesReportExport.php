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
    protected $changeDebts;
    protected $changeDebtTotal;
    protected $changeDebtUnpaid;

    public function __construct($salesData, $startDate, $endDate, $grandTotalSales, $grandTotalProfitKantin, $grandTotalProfitSeller, $changeDebts = null, $changeDebtTotal = 0, $changeDebtUnpaid = 0)
    {
        $this->salesData = $salesData;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->grandTotalSales = $grandTotalSales;
        $this->grandTotalProfitKantin = $grandTotalProfitKantin;
        $this->grandTotalProfitSeller = $grandTotalProfitSeller;
        $this->changeDebts = $changeDebts ?? collect();
        $this->changeDebtTotal = $changeDebtTotal;
        $this->changeDebtUnpaid = $changeDebtUnpaid;
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
            'changeDebts' => $this->changeDebts,
            'changeDebtTotal' => $this->changeDebtTotal,
            'changeDebtUnpaid' => $this->changeDebtUnpaid,
        ]);
    }
}
