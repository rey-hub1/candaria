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
    <tr><th colspan="4" style="font-weight:bold; font-size:13px; text-align:left;">RINCIAN PENGELUARAN CANDARIA</th></tr>
    <tr><th colspan="4"></th></tr>
    @foreach($days as $date)
        @php $rows = $service->dailyExpenses($date); $total = 0; @endphp
        <tr>
            <th style="{{ $hd }} text-align:left;">TANGGAL</th>
            <th style="{{ $hd }} text-align:left;">KETERANGAN</th>
            <th style="{{ $hd }} text-align:center;">QTY</th>
            <th style="{{ $hd }} text-align:right;">TOTAL</th>
        </tr>
        <tr>
            <td style="{{ $bd }}">{{ $service->namaHari($date) }}, {{ $service->tanggalIndo($date) }}</td>
            <td colspan="3" style="{{ $bd }}"></td>
        </tr>
        @forelse($rows as $r)
            @php $total += $r['total']; @endphp
            <tr>
                <td style="{{ $bd }}"></td>
                <td style="{{ $bd }}">{{ $r['keterangan'] }}</td>
                <td style="{{ $bd }} text-align:center;"></td>
                <td style="{{ $bd }} text-align:right;">{{ $rp($r['total']) }}</td>
            </tr>
        @empty
            <tr>
                <td style="{{ $bd }}"></td>
                <td colspan="3" style="{{ $bd }} color:#999;">Tidak ada pengeluaran tercatat</td>
            </tr>
        @endforelse
        <tr>
            <td style="{{ $hd }} text-align:left;">TOTAL</td>
            <td style="{{ $hd }}"></td>
            <td style="{{ $hd }}"></td>
            <td style="{{ $hd }} text-align:right;">{{ $rp($total) }}</td>
        </tr>
        <tr><th colspan="4"></th></tr>
    @endforeach
</table>
</body>
</html>
