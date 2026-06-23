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
    <tr><th colspan="5" style="font-weight:bold; font-size:13px; text-align:left;">LAPORAN KEUANGAN HARIAN CANDARIA</th></tr>
    <tr><th colspan="5" style="font-size:10px; color:#888; text-align:left;">Baris "Kas masuk" tidak tersedia dari data POS — diisi 0. Hutang customer = hutang kembalian.</th></tr>
    <tr><th colspan="5"></th></tr>
    @foreach($days as $date)
        @php
            $f = $service->dailyFinance($date);
            // baris: [keterangan, debit, kredit]
            $lines = [
                ['Kas masuk', 0, 0],
                ['Penjualan Harian', $f['penjualan_harian'], 0],
                ['Pengeluaran', 0, $f['pengeluaran']],
                ['Omset Konsyiansi', $f['omset_konsyiansi'], 0],
                ['Stor Ke Seller', 0, $f['stor_ke_seller']],
                ['Hutang pada customer', $f['hutang_customer'], 0],
                ['Pembayaran utang pada cust', 0, $f['pembayaran_utang']],
            ];
            $saldo = 0;
        @endphp
        <tr>
            <th style="{{ $hd }} text-align:left;">TANGGAL</th>
            <th style="{{ $hd }} text-align:left;">KETERANGAN</th>
            <th style="{{ $hd }} text-align:right;">D</th>
            <th style="{{ $hd }} text-align:right;">K</th>
            <th style="{{ $hd }} text-align:right;">JUMLAH</th>
        </tr>
        @foreach($lines as $i => $ln)
            @php $saldo += $ln[1] - $ln[2]; @endphp
            <tr>
                <td style="{{ $bd }}">{{ $i === 0 ? $service->namaHari($date) . ', ' . $service->tanggalIndo($date) : '' }}</td>
                <td style="{{ $bd }}">{{ $ln[0] }}</td>
                <td style="{{ $bd }} text-align:right;">{{ $rp($ln[1]) }}</td>
                <td style="{{ $bd }} text-align:right;">{{ $rp($ln[2]) }}</td>
                <td style="{{ $bd }} text-align:right;">{{ $rp($saldo) }}</td>
            </tr>
        @endforeach
        <tr>
            <td style="{{ $hd }}"></td>
            <td style="{{ $hd }} text-align:left;">Selisih kas</td>
            <td style="{{ $hd }}"></td>
            <td style="{{ $hd }}"></td>
            <td style="{{ $hd }} text-align:right;">{{ $rp($saldo) }}</td>
        </tr>
        <tr><th colspan="5"></th></tr>
    @endforeach
</table>
</body>
</html>
