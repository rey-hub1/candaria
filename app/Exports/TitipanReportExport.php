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
    protected $sellerId;
    protected $sellers;

    public function __construct($items, $startDate, $endDate, $summary, $sellerId = null, $sellers = [])
    {
        $this->items = $items;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->summary = $summary;
        $this->sellerId = $sellerId;
        $this->sellers = $sellers;
    }

    public function view(): View
    {
        return view('reports.titipan_xlsx', [
            'items' => $this->items,
            'startDate' => $this->startDate,
            'endDate' => $this->endDate,
            'summary' => $this->summary,
            'sellerId' => $this->sellerId,
            'sellers' => $this->sellers,
        ]);
    }
}
