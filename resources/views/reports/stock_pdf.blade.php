<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Stok Harian Produk</title>
    <style>
        @page { margin: 1.5cm 1.2cm; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 8.5px;
            line-height: 1.5;
            color: #1e2d3d;
            margin: 0;
            padding: 0;
        }

        /* ─── HEADER ─── */
        .header-wrap { margin-bottom: 18px; border-bottom: 2px solid #1b3a6b; padding-bottom: 11px; }
        .header-table { width: 100%; border-collapse: collapse; }
        .header-table td { border: none; padding: 0; vertical-align: top; }
        .brand-name { font-size: 17px; font-weight: bold; color: #1b3a6b; letter-spacing: 1px; text-transform: uppercase; }
        .brand-tagline { font-size: 7.5px; color: #8fa3b1; margin-top: 2px; }
        .doc-title { font-size: 11px; font-weight: bold; color: #1b3a6b; text-align: right; text-transform: uppercase; letter-spacing: 0.3px; }
        .doc-sub { font-size: 7.5px; color: #8fa3b1; text-align: right; margin-top: 3px; }

        /* ─── TABLE ─── */
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        .data-table thead tr { background-color: #1b3a6b; }
        .data-table th {
            color: #ffffff;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 6.5px;
            letter-spacing: 0.3px;
            padding: 6px 5px;
            border: none;
        }
        .data-table tbody td { padding: 5px 5px; border-bottom: 1px solid #e8edf3; font-size: 8px; }
        .data-table tbody tr:nth-child(even) td { background-color: #f4f7fb; }
        .total-row td {
            background-color: #1b3a6b !important;
            color: #ffffff !important;
            font-weight: bold;
            font-size: 8px;
            padding: 6px 5px;
            border: none !important;
        }

        /* Stock level indicators */
        .sisa { font-family: 'DejaVu Sans Mono', monospace; font-weight: bold; }
        .sisa-zero { color: #b91c1c; }
        .sisa-low  { color: #b45309; }
        .sisa-ok   { color: #0c6b3a; }

        .r { text-align: right; }
        .c { text-align: center; }
        .mn { font-family: 'DejaVu Sans Mono', monospace; }

        /* ─── FOOTER ─── */
        .footer-wrap { margin-top: 22px; border-top: 1px solid #dde1eb; padding-top: 11px; }
        .footer-table { width: 100%; border-collapse: collapse; }
        .footer-table td { border: none; padding: 0; width: 50%; vertical-align: top; }
        .print-info { font-size: 7px; color: #b0bec5; padding-top: 2px; }
        .sig-area { text-align: right; }
        .sig-date { font-size: 8.5px; color: #4a5568; margin-bottom: 36px; }
        .sig-line { font-weight: bold; color: #1e2d3d; border-top: 1px solid #718096; padding-top: 3px; font-size: 8.5px; }
        .sig-role { font-size: 7px; color: #8fa3b1; margin-top: 2px; }
    </style>
</head>
<body>

<div class="header-wrap">
    <table class="header-table">
        <tr>
            <td>
                <div class="brand-name">Kantin Smekda</div>
                <div class="brand-tagline">Laporan Keuangan &amp; Inventaris Sekolah</div>
            </td>
            <td>
                <div class="doc-title">Laporan Stok Harian Produk</div>
                <div class="doc-sub">Tanggal: {{ \Carbon\Carbon::parse($date)->format('d F Y') }}</div>
            </td>
        </tr>
    </table>
</div>

<table class="data-table">
    <thead>
        <tr>
            <th class="c" style="width:3%;">No</th>
            <th style="width:18%;">Nama Produk</th>
            <th class="c" style="width:7%;">Stok Pagi</th>
            <th class="c" style="width:8%;">Tambahan</th>
            <th class="c" style="width:7%;">Total Stok</th>
            <th class="c" style="width:7%;">Sisa</th>
            <th style="width:12%;">Pemilik</th>
            <th class="c" style="width:7%;">Terjual</th>
            <th class="r" style="width:9%;">HPP</th>
            <th class="r" style="width:9%;">Harga Jual</th>
            <th class="r" style="width:13%;">Total</th>
        </tr>
    </thead>
    <tbody>
        @php
            $grandTotalTerjual = 0;
            $grandTotalRevenue = 0;
        @endphp
        @forelse($reportData as $index => $row)
            @php
                $grandTotalTerjual += $row->qty_sold;
                $grandTotalRevenue += $row->total_harga;
                $sisaClass = $row->sisa_stok == 0 ? 'sisa-zero' : ($row->sisa_stok <= 3 ? 'sisa-low' : 'sisa-ok');
            @endphp
            <tr>
                <td class="c mn">{{ $index + 1 }}</td>
                <td><strong>{{ $row->product->name }}</strong></td>
                <td class="c mn">{{ $row->stok_pagi }}</td>
                <td class="c mn">{{ $row->tambahan_stok }}</td>
                <td class="c mn">{{ $row->total_stok }}</td>
                <td class="c"><span class="sisa {{ $sisaClass }}">{{ $row->sisa_stok }}</span></td>
                <td style="font-size:7.5px;">{{ $row->pemilik }}</td>
                <td class="c mn" style="font-weight:bold;">{{ $row->qty_sold }}</td>
                <td class="r mn" style="font-size:7.5px;">Rp{{ number_format($row->cost_price, 0, ',', '.') }}</td>
                <td class="r mn" style="font-size:7.5px;">Rp{{ number_format($row->selling_price, 0, ',', '.') }}</td>
                <td class="r mn">Rp{{ number_format($row->total_harga, 0, ',', '.') }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="11" class="c" style="color:#b0bec5; padding:20px; font-style:italic;">
                    Tidak ada data produk.
                </td>
            </tr>
        @endforelse
        @if(!empty($reportData))
            <tr class="total-row">
                <td colspan="2" class="c">TOTAL</td>
                <td class="c mn">{{ collect($reportData)->sum('stok_pagi') }}</td>
                <td class="c mn">{{ collect($reportData)->sum('tambahan_stok') }}</td>
                <td class="c mn">{{ collect($reportData)->sum('total_stok') }}</td>
                <td class="c mn">{{ collect($reportData)->sum('sisa_stok') }}</td>
                <td>&mdash;</td>
                <td class="c mn">{{ $grandTotalTerjual }}</td>
                <td colspan="2" class="c">&mdash;</td>
                <td class="r mn">Rp{{ number_format($grandTotalRevenue, 0, ',', '.') }}</td>
            </tr>
        @endif
    </tbody>
</table>

<div class="footer-wrap">
    <table class="footer-table">
        <tr>
            <td><div class="print-info">Dicetak: {{ \Carbon\Carbon::now()->format('d M Y, H:i:s') }} WIB</div></td>
            <td>
                <div class="sig-area">
                    <div class="sig-date">Purwakarta, {{ \Carbon\Carbon::now()->format('d F Y') }}</div>
                    <div class="sig-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    <div class="sig-role">Pengelola Kantin Smekda</div>
                </div>
            </td>
        </tr>
    </table>
</div>

</body>
</html>
