<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class TitipanReportExport implements FromView, ShouldAutoSize
{
    protected $items;
    protected $startDate;
    protected $endDate;
    protected $summary;

    public function __construct($items, $startDate, $endDate, $summary)
    {
        $this->items = $items;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->summary = $summary;
    }

    public function view(): View
    {
        return view('reports.titipan_xlsx', [
            'items' => $this->items,
            'startDate' => $this->startDate,
            'endDate' => $this->endDate,
            'summary' => $this->summary,
        ]);
    }
}
