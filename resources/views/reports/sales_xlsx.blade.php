<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body>
    <table>
    <thead>
        <tr>
            <th colspan="6" style="font-weight: bold; font-size: 14px; text-align: left;">Kantin Smekda</th>
        </tr>
        <tr>
            <th colspan="6" style="font-weight: bold; font-size: 12px; text-align: left;">Laporan Penjualan Harian</th>
        </tr>
        <tr>
            <th colspan="6" style="font-size: 10px; color: #555555; text-align: left;">
                Periode: {{ \Carbon\Carbon::parse($startDate)->format('d F Y') }} - {{ \Carbon\Carbon::parse($endDate)->format('d F Y') }}
            </th>
        </tr>
        <tr>
            <th colspan="6"></th>
        </tr>
        <!-- Summaries -->
        <tr>
            <th colspan="2" style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1;">Total Omset (Kotor)</th>
            <th colspan="2" style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1;">Total Profit Kantin (Bersih)</th>
            <th colspan="2" style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1;">Total Uang Siswa (Titipan)</th>
        </tr>
        <tr>
            <td colspan="2" style="font-weight: bold; text-align: left; border: 1px solid #cbd5e1;">Rp{{ number_format($grandTotalSales, 0, ',', '.') }}</td>
            <td colspan="2" style="font-weight: bold; text-align: left; border: 1px solid #cbd5e1;">Rp{{ number_format($grandTotalProfitKantin, 0, ',', '.') }}</td>
            <td colspan="2" style="font-weight: bold; text-align: left; border: 1px solid #cbd5e1;">Rp{{ number_format($grandTotalProfitSeller, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <th colspan="6"></th>
        </tr>
        <!-- Main Data Headers -->
        <tr>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: center;">No</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: left;">Tanggal</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: center;">Jumlah Transaksi</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: right;">Total Omset</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: right;">Profit Kantin</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: right;">Uang Siswa</th>
        </tr>
    </thead>
    <tbody>
        @foreach($salesData as $index => $data)
            <tr>
                <td style="border: 1px solid #cbd5e1; text-align: center;">{{ $index + 1 }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: left;">{{ \Carbon\Carbon::parse($data->date)->format('d M Y') }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: center;">{{ $data->transaction_count }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($data->total_sales, 0, ',', '.') }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($data->profit_kantin, 0, ',', '.') }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($data->profit_seller, 0, ',', '.') }}</td>
            </tr>
        @endforeach

        @if(!$salesData->isEmpty())
            <tr>
                <td colspan="2" style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: center;">TOTAL</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: center;">{{ $salesData->sum('transaction_count') }}</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($grandTotalSales, 0, ',', '.') }}</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($grandTotalProfitKantin, 0, ',', '.') }}</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($grandTotalProfitSeller, 0, ',', '.') }}</td>
            </tr>
        @endif
    </tbody>
</table>

@if($changeDebts->isNotEmpty())
<table>
    <thead>
        <tr><th colspan="5"></th></tr>
        <tr>
            <th colspan="5" style="font-weight: bold; font-size: 12px; text-align: left;">Hutang Kembalian ke Customer</th>
        </tr>
        <tr>
            <th colspan="3" style="font-size: 10px; color:#555; text-align:left;">Total: Rp{{ number_format($changeDebtTotal, 0, ',', '.') }}</th>
            <th colspan="2" style="font-size: 10px; color:#555; text-align:left;">Belum lunas: Rp{{ number_format($changeDebtUnpaid, 0, ',', '.') }}</th>
        </tr>
        <tr>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align:left;">Tanggal</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align:left;">Nama</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align:left;">Kelas</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align:right;">Nominal</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align:left;">Status</th>
        </tr>
    </thead>
    <tbody>
        @foreach($changeDebts as $cd)
            <tr>
                <td style="border: 1px solid #cbd5e1;">{{ \Carbon\Carbon::parse($cd->date)->format('d M Y') }}</td>
                <td style="border: 1px solid #cbd5e1;">{{ $cd->customer_name ?: ($cd->customer_note ?: '-') }}</td>
                <td style="border: 1px solid #cbd5e1;">{{ $cd->customer_class ?: '-' }}</td>
                <td style="border: 1px solid #cbd5e1; text-align:right;">Rp{{ number_format($cd->amount, 0, ',', '.') }}</td>
                <td style="border: 1px solid #cbd5e1;">{{ $cd->status === 'paid' ? 'Lunas' : 'Belum' }}</td>
            </tr>
        @endforeach
    </tbody>
</table>
@endif
</body>
</html>
