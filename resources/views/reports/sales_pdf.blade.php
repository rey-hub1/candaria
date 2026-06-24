<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Penjualan Harian</title>
    <style>
        @page { margin: 1.8cm 1.5cm; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            line-height: 1.5;
            color: #1e2d3d;
            margin: 0;
            padding: 0;
        }

        /* ─── HEADER ─── */
        .header-wrap {
            margin-bottom: 22px;
            border-bottom: 2px solid #1b3a6b;
            padding-bottom: 12px;
        }
        .header-table { width: 100%; border-collapse: collapse; }
        .header-table td { border: none; padding: 0; vertical-align: top; }
        .brand-name {
            font-size: 19px;
            font-weight: bold;
            color: #1b3a6b;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .brand-tagline { font-size: 8px; color: #8fa3b1; margin-top: 2px; letter-spacing: 0.4px; }
        .doc-title {
            font-size: 12px;
            font-weight: bold;
            color: #1b3a6b;
            text-align: right;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        .doc-sub { font-size: 8px; color: #8fa3b1; text-align: right; margin-top: 3px; }

        /* ─── SUMMARY CARDS ─── */
        .cards-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .cards-table td { padding: 0 5px 0 0; width: 33.33%; border: none; vertical-align: top; }
        .cards-table td:last-child { padding-right: 0; }
        .card {
            border: 1px solid #dde1eb;
            border-top: 3px solid #1b3a6b;
            padding: 9px 11px;
            background-color: #f9fafc;
        }
        .card.emerald { border-top-color: #0c6b3a; }
        .card.ocean { border-top-color: #1565c0; }
        .card-lbl {
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #8fa3b1;
            margin-bottom: 4px;
        }
        .card-val {
            font-size: 13px;
            font-weight: bold;
            color: #1e2d3d;
            font-family: 'DejaVu Sans Mono', monospace;
        }
        .card-note { font-size: 7px; color: #b0bec5; margin-top: 3px; }

        /* ─── TABLE ─── */
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .data-table thead tr { background-color: #1b3a6b; }
        .data-table th {
            color: #ffffff;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 7.5px;
            letter-spacing: 0.4px;
            padding: 7px 8px;
            border: none;
        }
        .data-table tbody td {
            padding: 6px 8px;
            border-bottom: 1px solid #e8edf3;
            font-size: 9.5px;
        }
        .data-table tbody tr:nth-child(even) td { background-color: #f4f7fb; }
        .total-row td {
            background-color: #1b3a6b !important;
            color: #ffffff !important;
            font-weight: bold;
            font-size: 9.5px;
            padding: 7px 8px;
            border: none !important;
        }

        .r { text-align: right; }
        .c { text-align: center; }
        .mn { font-family: 'DejaVu Sans Mono', monospace; }

        /* ─── FOOTER ─── */
        .footer-wrap { margin-top: 28px; border-top: 1px solid #dde1eb; padding-top: 12px; }
        .footer-table { width: 100%; border-collapse: collapse; }
        .footer-table td { border: none; padding: 0; width: 50%; vertical-align: top; }
        .print-info { font-size: 7.5px; color: #b0bec5; padding-top: 2px; }
        .sig-area { text-align: right; }
        .sig-date { font-size: 9px; color: #4a5568; margin-bottom: 38px; }
        .sig-line {
            font-weight: bold;
            color: #1e2d3d;
            border-top: 1px solid #718096;
            padding-top: 3px;
            font-size: 9px;
        }
        .sig-role { font-size: 7.5px; color: #8fa3b1; margin-top: 2px; }
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
                <div class="doc-title">Laporan Penjualan Harian</div>
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
                <div class="card-lbl">Total Omset</div>
                <div class="card-val">Rp{{ number_format($grandTotalSales, 0, ',', '.') }}</div>
                <div class="card-note">Kotor keseluruhan transaksi</div>
            </div>
        </td>
        <td>
            <div class="card emerald">
                <div class="card-lbl">Profit Kantin</div>
                <div class="card-val">Rp{{ number_format($grandTotalProfitKantin, 0, ',', '.') }}</div>
                <div class="card-note">Laba bersih kas kantin</div>
            </div>
        </td>
        <td>
            <div class="card ocean">
                <div class="card-lbl">Uang Penitip Siswa</div>
                <div class="card-val">Rp{{ number_format($grandTotalProfitSeller, 0, ',', '.') }}</div>
                <div class="card-note">Bagi hasil untuk siswa</div>
            </div>
        </td>
    </tr>
</table>

<table class="data-table">
    <thead>
        <tr>
            <th class="c" style="width:5%;">No</th>
            <th style="width:28%;">Tanggal</th>
            <th class="c" style="width:15%;">Transaksi</th>
            <th class="r" style="width:18%;">Total Omset</th>
            <th class="r" style="width:17%;">Profit Kantin</th>
            <th class="r" style="width:17%;">Uang Siswa</th>
        </tr>
    </thead>
    <tbody>
        @forelse($salesData as $index => $data)
            <tr>
                <td class="c mn">{{ $index + 1 }}</td>
                <td>{{ \Carbon\Carbon::parse($data->date)->format('d M Y') }}</td>
                <td class="c mn">{{ $data->transaction_count }}</td>
                <td class="r mn">Rp{{ number_format($data->total_sales, 0, ',', '.') }}</td>
                <td class="r mn">Rp{{ number_format($data->profit_kantin, 0, ',', '.') }}</td>
                <td class="r mn">Rp{{ number_format($data->profit_seller, 0, ',', '.') }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="6" class="c" style="color:#b0bec5; padding:20px; font-style:italic;">
                    Tidak ada data penjualan pada rentang tanggal tersebut.
                </td>
            </tr>
        @endforelse
        @if(!$salesData->isEmpty())
            <tr class="total-row">
                <td colspan="2" class="c">TOTAL KESELURUHAN</td>
                <td class="c mn">{{ $salesData->sum('transaction_count') }}</td>
                <td class="r mn">Rp{{ number_format($grandTotalSales, 0, ',', '.') }}</td>
                <td class="r mn">Rp{{ number_format($grandTotalProfitKantin, 0, ',', '.') }}</td>
                <td class="r mn">Rp{{ number_format($grandTotalProfitSeller, 0, ',', '.') }}</td>
            </tr>
        @endif
    </tbody>
</table>

@if($changeDebts->isNotEmpty())
<div style="font-size:11px; font-weight:bold; color:#1b3a6b; text-transform:uppercase; margin: 6px 0;">
    Hutang Kembalian ke Customer
    <span style="font-weight:normal; font-size:8px; color:#8fa3b1;">
        — Total Rp{{ number_format($changeDebtTotal, 0, ',', '.') }}, Belum lunas Rp{{ number_format($changeDebtUnpaid, 0, ',', '.') }}
    </span>
</div>
<table class="data-table" style="margin-bottom:20px;">
    <thead>
        <tr>
            <th style="text-align:left;">Tanggal</th>
            <th style="text-align:left;">Nama</th>
            <th style="text-align:left;">Kelas</th>
            <th style="text-align:right;">Nominal</th>
            <th style="text-align:left;">Status</th>
        </tr>
    </thead>
    <tbody>
        @foreach($changeDebts as $cd)
            <tr>
                <td>{{ \Carbon\Carbon::parse($cd->date)->format('d M Y') }}</td>
                <td>{{ $cd->customer_name ?: ($cd->customer_note ?: '-') }}</td>
                <td>{{ $cd->customer_class ?: '-' }}</td>
                <td class="r mn">Rp{{ number_format($cd->amount, 0, ',', '.') }}</td>
                <td>{{ $cd->status === 'paid' ? 'Lunas' : 'Belum' }}</td>
            </tr>
        @endforeach
    </tbody>
</table>
@endif

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
