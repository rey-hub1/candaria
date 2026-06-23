<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
@php
    $rp = fn ($n) => $n ? number_format($n, 0, ',', '.') : '0';
    $bd = 'border: 1px solid #cbd5e1;';
    $hd = 'font-weight: bold; background-color: #e2e8f0;' . $bd;
@endphp
<table>
    <tr><th colspan="9" style="font-weight:bold; font-size:13px; text-align:left;">LAPORAN PENJUALAN HARIAN</th></tr>
    <tr><th colspan="9"></th></tr>
    @foreach($days as $date)
        @php $rows = $service->dailySales($date); $tHarga = 0; @endphp
        <tr><th colspan="9" style="font-weight:bold; text-align:left; background-color:#f1f5f9; {{ $bd }}">{{ $service->namaHari($date) }}, {{ $service->tanggalIndo($date) }}</th></tr>
        <tr>
            <th style="{{ $hd }} text-align:left;">Nama Produk</th>
            <th style="{{ $hd }} text-align:center;">Stok Pagi</th>
            <th style="{{ $hd }} text-align:center;">Tambahan Stok Masuk</th>
            <th style="{{ $hd }} text-align:center;">Total Stok</th>
            <th style="{{ $hd }} text-align:center;">Sisa Stok</th>
            <th style="{{ $hd }} text-align:center;">Jumlah Terjual</th>
            <th style="{{ $hd }} text-align:right;">HPP</th>
            <th style="{{ $hd }} text-align:right;">Harga jual</th>
            <th style="{{ $hd }} text-align:right;">Total harga</th>
        </tr>
        @foreach($rows as $r)
            @php $tHarga += $r['total_harga']; @endphp
            <tr>
                <td style="{{ $bd }}">{{ $r['name'] }}</td>
                <td style="{{ $bd }} text-align:center;">{{ $r['stok_pagi'] }}</td>
                <td style="{{ $bd }} text-align:center;">{{ $r['tambahan'] }}</td>
                <td style="{{ $bd }} text-align:center;">{{ $r['total_stok'] }}</td>
                <td style="{{ $bd }} text-align:center;">{{ $r['sisa'] }}</td>
                <td style="{{ $bd }} text-align:center;">{{ $r['terjual'] }}</td>
                <td style="{{ $bd }} text-align:right;">{{ $rp($r['hpp']) }}</td>
                <td style="{{ $bd }} text-align:right;">{{ $rp($r['harga_jual']) }}</td>
                <td style="{{ $bd }} text-align:right;">{{ $rp($r['total_harga']) }}</td>
            </tr>
        @endforeach
        <tr>
            <td colspan="8" style="{{ $hd }} text-align:right;">TOTAL</td>
            <td style="{{ $hd }} text-align:right;">{{ $rp($tHarga) }}</td>
        </tr>
        <tr><th colspan="9"></th></tr>
    @endforeach
</table>
</body>
</html>
