<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Titipan Siswa</title>
    <style>
        @page { margin: 1.5cm 1.2cm; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 9px;
            line-height: 1.5;
            color: #1e2d3d;
            margin: 0;
            padding: 0;
        }

        /* ─── HEADER ─── */
        .header-wrap { margin-bottom: 20px; border-bottom: 2px solid #1b3a6b; padding-bottom: 12px; }
        .header-table { width: 100%; border-collapse: collapse; }
        .header-table td { border: none; padding: 0; vertical-align: top; }
        .brand-name { font-size: 18px; font-weight: bold; color: #1b3a6b; letter-spacing: 1px; text-transform: uppercase; }
        .brand-tagline { font-size: 7.5px; color: #8fa3b1; margin-top: 2px; }
        .doc-title { font-size: 11px; font-weight: bold; color: #1b3a6b; text-align: right; text-transform: uppercase; letter-spacing: 0.3px; }
        .doc-sub { font-size: 7.5px; color: #8fa3b1; text-align: right; margin-top: 3px; }

        /* ─── SUMMARY CARDS ─── */
        .cards-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
        .cards-table td { padding: 0 5px 0 0; width: 33.33%; border: none; vertical-align: top; }
        .cards-table td:last-child { padding-right: 0; }
        .card { border: 1px solid #dde1eb; border-top: 3px solid #1b3a6b; padding: 8px 10px; background-color: #f9fafc; }
        .card.emerald { border-top-color: #0c6b3a; }
        .card.ocean { border-top-color: #1565c0; }
        .card-lbl { font-size: 6.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px; color: #8fa3b1; margin-bottom: 4px; }
        .card-val { font-size: 12px; font-weight: bold; color: #1e2d3d; font-family: 'DejaVu Sans Mono', monospace; }
        .card-note { font-size: 6.5px; color: #b0bec5; margin-top: 3px; }

        /* ─── TABLE ─── */
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
        .data-table thead tr { background-color: #1b3a6b; }
        .data-table th {
            color: #ffffff;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 7px;
            letter-spacing: 0.3px;
            padding: 6px 6px;
            border: none;
        }
        .data-table tbody td { padding: 5px 6px; border-bottom: 1px solid #e8edf3; font-size: 8.5px; }
        .data-table tbody tr:nth-child(even) td { background-color: #f4f7fb; }
        .total-row td {
            background-color: #1b3a6b !important;
            color: #ffffff !important;
            font-weight: bold;
            font-size: 8.5px;
            padding: 6px 6px;
            border: none !important;
        }

        /* Status badges */
        .badge { font-size: 7px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3px; }
        .badge-lunas { color: #0c6b3a; }
        .badge-pending { color: #b45309; font-style: italic; }

        .r { text-align: right; }
        .c { text-align: center; }
        .mn { font-family: 'DejaVu Sans Mono', monospace; }

        /* ─── FOOTER ─── */
        .footer-wrap { margin-top: 24px; border-top: 1px solid #dde1eb; padding-top: 12px; }
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
                <div class="brand-tagline">Laporan Keuangan Sekolah</div>
            </td>
            <td>
                <div class="doc-title">Laporan Penjualan Barang Titipan Siswa</div>
                <div class="doc-sub">
                    Periode: {{ \Carbon\Carbon::parse($startDate)->format('d M Y') }} &mdash; {{ \Carbon\Carbon::parse($endDate)->format('d M Y') }}
                </div>
            </td>
        </tr>
    </table>
</div>

<table class="cards-table">
    <tr>
        <td>
            <div class="card">
                <div class="card-lbl">Total Terjual</div>
                <div class="card-val">{{ number_format($summary->total_qty) }} Pcs</div>
                <div class="card-note">Akumulasi produk terjual</div>
            </div>
        </td>
        <td>
            <div class="card emerald">
                <div class="card-lbl">Hasil untuk Siswa</div>
                <div class="card-val">Rp{{ number_format($summary->total_seller, 0, ',', '.') }}</div>
                <div class="card-note">Uang kembali ke siswa</div>
            </div>
        </td>
        <td>
            <div class="card ocean">
                <div class="card-lbl">Laba Kantin</div>
                <div class="card-val">Rp{{ number_format($summary->total_kantin, 0, ',', '.') }}</div>
                <div class="card-note">Keuntungan bagi hasil kantin</div>
            </div>
        </td>
    </tr>
</table>

<table class="data-table">
    <thead>
        <tr>
            <th class="c" style="width:3%;">No</th>
            <th style="width:11%;">Tgl & Waktu</th>
            <th style="width:19%;">Siswa Penitip</th>
            <th style="width:18%;">Nama Produk</th>
            <th class="c" style="width:6%;">Jml</th>
            <th class="r" style="width:10%;">Harga Siswa</th>
            <th class="r" style="width:11%;">Hasil Siswa</th>
            <th class="r" style="width:11%;">Laba Kantin</th>
            <th class="c" style="width:11%;">Status</th>
        </tr>
    </thead>
    <tbody>
        @forelse($items as $index => $item)
            <tr>
                <td class="c mn">{{ $index + 1 }}</td>
                <td class="mn" style="font-size:8px;">{{ $item->created_at->format('d/m/Y') }}<br><span style="color:#8fa3b1;">{{ $item->created_at->format('H:i') }}</span></td>
                <td>
                    {{ $item->product->seller->name ?? '-' }}
                    @if($item->product->seller->class ?? null)
                        <br><span style="font-size:7px; color:#8fa3b1;">Kelas {{ $item->product->seller->class }}</span>
                    @endif
                </td>
                <td style="font-weight:bold;">{{ $item->product->name }}</td>
                <td class="c mn">{{ $item->quantity }} pcs</td>
                <td class="r mn">Rp{{ number_format($item->cost_price, 0, ',', '.') }}</td>
                <td class="r mn">Rp{{ number_format($item->profit_seller, 0, ',', '.') }}</td>
                <td class="r mn">Rp{{ number_format($item->profit_kantin, 0, ',', '.') }}</td>
                <td class="c">
                    @if($item->seller_settlement_id)
                        <span class="badge badge-lunas">&#10003; Lunas</span>
                    @else
                        <span class="badge badge-pending">Belum</span>
                    @endif
                </td>
            </tr>
        @empty
            <tr>
                <td colspan="9" class="c" style="color:#b0bec5; padding:20px; font-style:italic;">
                    Tidak ada data penjualan barang titipan pada rentang tanggal tersebut.
                </td>
            </tr>
        @endforelse
        @if(!$items->isEmpty())
            <tr class="total-row">
                <td colspan="4" class="c">TOTAL KESELURUHAN</td>
                <td class="c mn">{{ $summary->total_qty }} pcs</td>
                <td class="r mn">&mdash;</td>
                <td class="r mn">Rp{{ number_format($summary->total_seller, 0, ',', '.') }}</td>
                <td class="r mn">Rp{{ number_format($summary->total_kantin, 0, ',', '.') }}</td>
                <td class="c">&mdash;</td>
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
                    <div class="sig-date">Purwakarta, {{ \Carbon\Carbon::now()->format('d M Y') }}</div>
                    <div class="sig-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    <div class="sig-role">Pengelola Kantin Smekda</div>
                </div>
            </td>
        </tr>
    </table>
</div>

</body>
</html>
