<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body>
    <table>
    <thead>
        <tr>
            <th colspan="5" style="font-weight: bold; font-size: 14px; text-align: left;">Kantin Smekda</th>
        </tr>
        <tr>
            <th colspan="5" style="font-weight: bold; font-size: 12px; text-align: left;">Laporan Pembayaran Penitip (Pencairan Dana)</th>
        </tr>
        <tr>
            <th colspan="5" style="font-size: 10px; color: #555555; text-align: left;">
                @if($startDate && $endDate)
                    Periode: {{ \Carbon\Carbon::parse($startDate)->format('d F Y') }} - {{ \Carbon\Carbon::parse($endDate)->format('d F Y') }}
                @else
                    Periode: Semua Waktu
                @endif
            </th>
        </tr>
        <tr>
            <th colspan="5"></th>
        </tr>
        <tr>
            <th colspan="5" style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: left;">Total Tanggungan (Belum Dibayar)</th>
        </tr>
        <tr>
            <td colspan="5" style="font-weight: bold; text-align: left; border: 1px solid #cbd5e1;">Rp{{ number_format($totalUnpaid, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <th colspan="5"></th>
        </tr>
        <tr>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: center;">No</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: left;">Nama Penitip</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: right;">Total Omzet</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: right;">Sudah Dicairkan</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: right;">Sisa Saldo (Belum Dibayar)</th>
        </tr>
    </thead>
    <tbody>
        @foreach($sellers as $index => $seller)
            <tr>
                <td style="border: 1px solid #cbd5e1; text-align: center;">{{ $index + 1 }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: left;">{{ $seller->name }} ({{ $seller->class }})</td>
                <td style="border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($seller->total_earnings, 0, ',', '.') }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($seller->total_paid, 0, ',', '.') }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($seller->unpaid_amount, 0, ',', '.') }}</td>
            </tr>
        @endforeach

        @if(!$sellers->isEmpty())
            <tr>
                <td colspan="2" style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: center;">TOTAL</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($sellers->sum('total_earnings'), 0, ',', '.') }}</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($sellers->sum('total_paid'), 0, ',', '.') }}</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($totalUnpaid, 0, ',', '.') }}</td>
            </tr>
        @endif
    </tbody>
</table>
</body>
</html>
