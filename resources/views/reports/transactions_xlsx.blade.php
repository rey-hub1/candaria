<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
@php
    $total = $transactions->where('status', 'completed')->sum('total_amount');
    $count = $transactions->count();
    $voided = $transactions->where('status', 'voided')->count();
@endphp
<table>
    <thead>
        <tr><th colspan="7" style="font-weight:bold;font-size:14px;text-align:left;">Kantin Smekda</th></tr>
        <tr><th colspan="7" style="font-weight:bold;font-size:12px;text-align:left;">Riwayat Transaksi Kantin</th></tr>
        <tr><th colspan="7" style="font-size:10px;color:#555;text-align:left;">
            Periode:
            {{ !empty($filters['start_date']) ? \Carbon\Carbon::parse($filters['start_date'])->format('d M Y') : 'Awal' }}
            s/d
            {{ !empty($filters['end_date']) ? \Carbon\Carbon::parse($filters['end_date'])->format('d M Y') : 'Sekarang' }}
        </th></tr>
        <tr><th colspan="7"></th></tr>
        <tr>
            <th colspan="2" style="font-weight:bold;background:#f1f5f9;border:1px solid #cbd5e1;">Total Omset (Completed)</th>
            <th colspan="2" style="font-weight:bold;background:#f1f5f9;border:1px solid #cbd5e1;">Jumlah Transaksi</th>
            <th colspan="3" style="font-weight:bold;background:#f1f5f9;border:1px solid #cbd5e1;">Dibatalkan</th>
        </tr>
        <tr>
            <td colspan="2" style="font-weight:bold;border:1px solid #cbd5e1;">Rp{{ number_format($total, 0, ',', '.') }}</td>
            <td colspan="2" style="font-weight:bold;border:1px solid #cbd5e1;">{{ $count }}</td>
            <td colspan="3" style="font-weight:bold;border:1px solid #cbd5e1;">{{ $voided }}</td>
        </tr>
        <tr><th colspan="7"></th></tr>
        <tr>
            <th style="font-weight:bold;background:#e2e8f0;border:1px solid #cbd5e1;text-align:center;">No</th>
            <th style="font-weight:bold;background:#e2e8f0;border:1px solid #cbd5e1;text-align:left;">Kode</th>
            <th style="font-weight:bold;background:#e2e8f0;border:1px solid #cbd5e1;text-align:left;">Tanggal</th>
            <th style="font-weight:bold;background:#e2e8f0;border:1px solid #cbd5e1;text-align:left;">Kasir</th>
            <th style="font-weight:bold;background:#e2e8f0;border:1px solid #cbd5e1;text-align:right;">Total</th>
            <th style="font-weight:bold;background:#e2e8f0;border:1px solid #cbd5e1;text-align:right;">Bayar</th>
            <th style="font-weight:bold;background:#e2e8f0;border:1px solid #cbd5e1;text-align:left;">Status</th>
        </tr>
    </thead>
    <tbody>
        @foreach($transactions as $i => $t)
        <tr>
            <td style="border:1px solid #cbd5e1;text-align:center;">{{ $i + 1 }}</td>
            <td style="border:1px solid #cbd5e1;">{{ $t->transaction_code }}</td>
            <td style="border:1px solid #cbd5e1;">{{ $t->created_at->format('d/m/Y H:i') }}</td>
            <td style="border:1px solid #cbd5e1;">{{ $t->user?->name }}</td>
            <td style="border:1px solid #cbd5e1;text-align:right;">{{ number_format($t->total_amount, 0, ',', '.') }}</td>
            <td style="border:1px solid #cbd5e1;text-align:right;">{{ number_format($t->paid_amount, 0, ',', '.') }}</td>
            <td style="border:1px solid #cbd5e1;">{{ $t->status === 'voided' ? 'Dibatalkan' : 'Selesai' }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
</body>
</html>
