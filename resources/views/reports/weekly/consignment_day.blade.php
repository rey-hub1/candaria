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
    <thead>
        <tr><th colspan="14" style="font-weight:bold; font-size:13px; text-align:left;">Hari/Tanggal : {{ $hari }}, {{ $tanggal }}</th></tr>
        <tr>
            <th style="{{ $hd }} text-align:left;">Nama</th>
            <th style="{{ $hd }} text-align:left;">Kelas</th>
            <th style="{{ $hd }} text-align:left;">No HP</th>
            <th style="{{ $hd }} text-align:left;">Nama Produk</th>
            <th style="{{ $hd }} text-align:center;">Stok awal</th>
            <th style="{{ $hd }} text-align:center;">Sisa Stok</th>
            <th style="{{ $hd }} text-align:center;">Jumlah terjual</th>
            <th style="{{ $hd }} text-align:right;">Harga Reseller</th>
            <th style="{{ $hd }} text-align:right;">Harga Jual</th>
            <th style="{{ $hd }} text-align:right;">Jumlah Penerimaan</th>
            <th style="{{ $hd }} text-align:right;">Jumlah Stor</th>
            <th style="{{ $hd }} text-align:right;">Laba</th>
            <th style="{{ $hd }} text-align:left;">Ket</th>
            <th style="{{ $hd }} text-align:right;">Total Stor</th>
        </tr>
    </thead>
    <tbody>
        @php $gTerima = 0; $gStor = 0; $gLaba = 0; @endphp
        @foreach($rows as $seller)
            @php $gStor += $seller['subtotal_stor']; @endphp
            @if(empty($seller['products']))
                <tr>
                    <td style="{{ $bd }}">{{ $seller['name'] }}</td>
                    <td style="{{ $bd }}">{{ $seller['class'] }}</td>
                    <td style="{{ $bd }}">{{ $seller['phone'] }}</td>
                    <td colspan="10" style="{{ $bd }} color:#999;">—</td>
                    <td style="{{ $bd }} text-align:right;">0</td>
                </tr>
            @else
                @foreach($seller['products'] as $i => $p)
                    @php $gTerima += $p['penerimaan']; $gLaba += $p['laba']; @endphp
                    <tr>
                        <td style="{{ $bd }}">{{ $i === 0 ? $seller['name'] : '' }}</td>
                        <td style="{{ $bd }}">{{ $i === 0 ? $seller['class'] : '' }}</td>
                        <td style="{{ $bd }}">{{ $i === 0 ? $seller['phone'] : '' }}</td>
                        <td style="{{ $bd }}">{{ $p['name'] }}</td>
                        <td style="{{ $bd }} text-align:center;">{{ $p['stok_awal'] }}</td>
                        <td style="{{ $bd }} text-align:center;">{{ $p['sisa'] }}</td>
                        <td style="{{ $bd }} text-align:center;">{{ $p['terjual'] }}</td>
                        <td style="{{ $bd }} text-align:right;">{{ $rp($p['harga_reseller']) }}</td>
                        <td style="{{ $bd }} text-align:right;">{{ $rp($p['harga_jual']) }}</td>
                        <td style="{{ $bd }} text-align:right;">{{ $rp($p['penerimaan']) }}</td>
                        <td style="{{ $bd }} text-align:right;">{{ $rp($p['stor']) }}</td>
                        <td style="{{ $bd }} text-align:right;">{{ $rp($p['laba']) }}</td>
                        <td style="{{ $bd }}"></td>
                        <td style="{{ $bd }} text-align:right; font-weight:bold;">{{ $i === 0 ? $rp($seller['subtotal_stor']) : '' }}</td>
                    </tr>
                @endforeach
            @endif
        @endforeach
        <tr>
            <td colspan="9" style="{{ $hd }} text-align:right;">TOTAL</td>
            <td style="{{ $hd }} text-align:right;">{{ $rp($gTerima) }}</td>
            <td style="{{ $hd }} text-align:right;">{{ $rp($gStor) }}</td>
            <td style="{{ $hd }} text-align:right;">{{ $rp($gLaba) }}</td>
            <td style="{{ $hd }}"></td>
            <td style="{{ $hd }} text-align:right;">{{ $rp($gStor) }}</td>
        </tr>
    </tbody>
</table>
</body>
</html>
