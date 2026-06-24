<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class TransactionsExport implements FromView, ShouldAutoSize
{
    public function __construct(protected $transactions, protected array $filters = []) {}

    public function view(): View
    {
        return view('reports.transactions_xlsx', [
            'transactions' => $this->transactions,
            'filters' => $this->filters,
        ]);
    }
}
