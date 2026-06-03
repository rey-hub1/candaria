<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class ProductsReportExport implements FromView, ShouldAutoSize
{
    protected $topProductsKantin;
    protected $topProductsSiswa;
    protected $lowStockProductsKantin;
    protected $lowStockProductsSiswa;

    public function __construct($topProductsKantin, $topProductsSiswa, $lowStockProductsKantin, $lowStockProductsSiswa)
    {
        $this->topProductsKantin = $topProductsKantin;
        $this->topProductsSiswa = $topProductsSiswa;
        $this->lowStockProductsKantin = $lowStockProductsKantin;
        $this->lowStockProductsSiswa = $lowStockProductsSiswa;
    }

    public function view(): View
    {
        return view('reports.products_xlsx', [
            'topProductsKantin' => $this->topProductsKantin,
            'topProductsSiswa' => $this->topProductsSiswa,
            'lowStockProductsKantin' => $this->lowStockProductsKantin,
            'lowStockProductsSiswa' => $this->lowStockProductsSiswa,
        ]);
    }
}
