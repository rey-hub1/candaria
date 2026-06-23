<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body>
    <table>
    <thead>
        <tr>
            <th colspan="10" style="font-weight: bold; font-size: 14px; text-align: left;">Kantin Smekda</th>
        </tr>
        <tr>
            <th colspan="10" style="font-weight: bold; font-size: 12px; text-align: left;">Laporan Penjualan Barang Titipan Siswa</th>
        </tr>
        <tr>
            <th colspan="10" style="font-size: 10px; color: #555555; text-align: left;">
                Periode: {{ \Carbon\Carbon::parse($startDate)->format('d F Y') }} - {{ \Carbon\Carbon::parse($endDate)->format('d F Y') }}
            </th>
        </tr>
        <tr>
            <th colspan="10"></th>
        </tr>
        <!-- Summaries -->
        <tr>
            <th colspan="4" style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1;">Total Terjual</th>
            <th colspan="3" style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1;">Total Hasil untuk Siswa</th>
            <th colspan="3" style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1;">Total Laba Kantin</th>
        </tr>
        <tr>
            <td colspan="4" style="font-weight: bold; text-align: left; border: 1px solid #cbd5e1;">{{ number_format($summary->total_qty) }} Pcs</td>
            <td colspan="3" style="font-weight: bold; text-align: left; border: 1px solid #cbd5e1;">Rp{{ number_format($summary->total_seller, 0, ',', '.') }}</td>
            <td colspan="3" style="font-weight: bold; text-align: left; border: 1px solid #cbd5e1;">Rp{{ number_format($summary->total_kantin, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <th colspan="10"></th>
        </tr>
        <!-- Main Data Headers -->
        <tr>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: center;">No</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: left;">Tanggal dan Waktu</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: left;">Siswa Penitip</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: left;">Nama Produk</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: center;">Stok Awal</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: center;">Jumlah</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: right;">Harga Siswa</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: right;">Hasil Siswa</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: right;">Laba Kantin</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: center;">Status Bayar</th>
        </tr>
    </thead>
    <tbody>
        @foreach($items as $index => $item)
            <tr>
                <td style="border: 1px solid #cbd5e1; text-align: center;">{{ $index + 1 }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: left;">{{ \Illuminate\Support\Carbon::parse($item->transaction->transaction_date ?? $item->created_at)->format('d/m/Y H:i') }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: left;">{{ $item->product->seller->name ?? '-' }} ({{ $item->product->seller->class ?? '-' }})</td>
                <td style="border: 1px solid #cbd5e1; text-align: left;">{{ $item->product->name }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: center;">{{ $item->stok_awal ?? '-' }} pcs</td>
                <td style="border: 1px solid #cbd5e1; text-align: center;">{{ $item->quantity }} pcs</td>
                <td style="border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($item->cost_price, 0, ',', '.') }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($item->profit_seller, 0, ',', '.') }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($item->profit_kantin, 0, ',', '.') }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: center;">
                    {{ $item->seller_settlement_id ? 'Lunas' : 'Belum Dibayar' }}
                </td>
            </tr>
        @endforeach

        @if(!$items->isEmpty())
            <tr>
                <td colspan="4" style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: center;">TOTAL</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: center;">-</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: center;">{{ $summary->total_qty }} pcs</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: right;">-</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($summary->total_seller, 0, ',', '.') }}</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($summary->total_kantin, 0, ',', '.') }}</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: center;">-</td>
            </tr>
        @endif
    </tbody>
</table>
</body>
</html>
