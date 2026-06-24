<?php

namespace App\Exports;

use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ChangeDebtsExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles
{
    public function __construct(protected $debts, protected int $total, protected int $unpaid) {}

    public function headings(): array
    {
        return ['No', 'Tanggal', 'Nama', 'Kelas', 'Transaksi', 'Nominal', 'Status'];
    }

    public function array(): array
    {
        $rows = [];
        foreach ($this->debts as $i => $d) {
            $rows[] = [
                $i + 1,
                Carbon::parse($d->date)->format('d/m/Y'),
                $d->customer_name ?: ($d->customer_note ?: '-'),
                $d->customer_class ?: '-',
                $d->transaction->transaction_code ?? '-',
                (int) $d->amount,
                $d->status === 'paid' ? 'Lunas' : 'Belum',
            ];
        }
        $rows[] = ['', '', '', '', 'Total:', $this->total, ''];
        $rows[] = ['', '', '', '', 'Belum lunas:', $this->unpaid, ''];

        return $rows;
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:G1')->getFont()->setBold(true);
        $last = $sheet->getHighestRow();
        $sheet->getStyle('E'.($last - 1).':F'.$last)->getFont()->setBold(true);

        return [];
    }
}
