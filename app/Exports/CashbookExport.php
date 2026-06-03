<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class CashbookExport implements FromView, ShouldAutoSize
{
    protected $exportData;
    protected $exportTotalDebit;
    protected $exportTotalCredit;
    protected $exportCurrentBalance;

    public function __construct($exportData, $exportTotalDebit, $exportTotalCredit, $exportCurrentBalance)
    {
        $this->exportData = $exportData;
        $this->exportTotalDebit = $exportTotalDebit;
        $this->exportTotalCredit = $exportTotalCredit;
        $this->exportCurrentBalance = $exportCurrentBalance;
    }

    public function view(): View
    {
        return view('reports.cashbooks_xlsx', [
            'exportData' => $this->exportData,
            'exportTotalDebit' => $this->exportTotalDebit,
            'exportTotalCredit' => $this->exportTotalCredit,
            'exportCurrentBalance' => $this->exportCurrentBalance,
        ]);
    }
}
