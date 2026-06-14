<?php

namespace App\Exports;

use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CashbookExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles
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

    public function headings(): array
    {
        return ['No', 'Tanggal', 'Keterangan', 'Debit (Masuk)', 'Kredit (Keluar)'];
    }

    public function array(): array
    {
        $sourceLabels = [
            'manual' => 'Manual',
            'transaction' => 'Penjualan',
        ];

        $rows = [];

        foreach ($this->exportData as $index => $item) {
            $sourceLabel = $sourceLabels[$item->source] ?? 'Pelunasan';

            $rows[] = [
                $index + 1,
                Carbon::parse($item->date)->format('d/m/Y'),
                $item->description.' ('.$sourceLabel.')',
                $item->type === 'debit' ? $item->amount : 0,
                $item->type === 'credit' ? $item->amount : 0,
            ];
        }

        $rows[] = ['', '', 'Total:', $this->exportTotalDebit, $this->exportTotalCredit];
        $rows[] = ['', '', 'Saldo Saat Ini:', $this->exportCurrentBalance, ''];

        return $rows;
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:E1')->getFont()->setBold(true);

        $lastRow = $sheet->getHighestRow();
        $sheet->getStyle('C'.($lastRow - 1).':E'.$lastRow)->getFont()->setBold(true);

        return [];
    }
}
