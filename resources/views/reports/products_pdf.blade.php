<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Produk Terlaris &amp; Stok</title>
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
        .header-wrap { margin-bottom: 22px; border-bottom: 2px solid #1b3a6b; padding-bottom: 12px; }
        .header-table { width: 100%; border-collapse: collapse; }
        .header-table td { border: none; padding: 0; vertical-align: top; }
        .brand-name { font-size: 19px; font-weight: bold; color: #1b3a6b; letter-spacing: 1px; text-transform: uppercase; }
        .brand-tagline { font-size: 8px; color: #8fa3b1; margin-top: 2px; letter-spacing: 0.4px; }
        .doc-title { font-size: 12px; font-weight: bold; color: #1b3a6b; text-align: right; text-transform: uppercase; letter-spacing: 0.4px; }
        .doc-sub { font-size: 8px; color: #8fa3b1; text-align: right; margin-top: 3px; }

        /* ─── SECTION HEADING ─── */
        .section-head {
            font-size: 10px;
            font-weight: bold;
            color: #1b3a6b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 7px;
            margin-top: 18px;
            padding: 5px 8px;
            background-color: #eef2f8;
            border-left: 3px solid #1b3a6b;
        }
        .section-head.warning {
            background-color: #fef9ec;
            border-left-color: #b45309;
            color: #b45309;
        }
        .section-head.first { margin-top: 0; }

        /* ─── TABLE ─── */
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
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
        .data-table tbody td { padding: 6px 8px; border-bottom: 1px solid #e8edf3; font-size: 9.5px; }
        .data-table tbody tr:nth-child(even) td { background-color: #f4f7fb; }

        /* Rank badge */
        .rank { font-weight: bold; font-size: 10px; color: #1b3a6b; font-family: 'DejaVu Sans Mono', monospace; }
        .rank.top3 { color: #b45309; }
        .code { font-size: 7.5px; color: #b0bec5; font-family: 'DejaVu Sans Mono', monospace; margin-top: 1px; }

        /* Low stock indicator */
        .stock-val { font-family: 'DejaVu Sans Mono', monospace; font-weight: bold; font-size: 10px; }
        .stock-critical { color: #b91c1c; }
        .stock-low { color: #b45309; }
        .stock-ok { color: #0c6b3a; }

        .r { text-align: right; }
        .c { text-align: center; }
        .mn { font-family: 'DejaVu Sans Mono', monospace; }

        .page-break { page-break-before: always; }

        /* ─── FOOTER ─── */
        .footer-wrap { margin-top: 28px; border-top: 1px solid #dde1eb; padding-top: 12px; }
        .footer-table { width: 100%; border-collapse: collapse; }
        .footer-table td { border: none; padding: 0; width: 50%; vertical-align: top; }
        .print-info { font-size: 7.5px; color: #b0bec5; padding-top: 2px; }
        .sig-area { text-align: right; }
        .sig-date { font-size: 9px; color: #4a5568; margin-bottom: 38px; }
        .sig-line { font-weight: bold; color: #1e2d3d; border-top: 1px solid #718096; padding-top: 3px; font-size: 9px; }
        .sig-role { font-size: 7.5px; color: #8fa3b1; margin-top: 2px; }

        /* Empty state */
        .empty-state { color: #b0bec5; padding: 15px; text-align: center; font-style: italic; background-color: #f9fafc; }
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
                <div class="doc-title">Laporan Produk Terlaris &amp; Stok</div>
                <div class="doc-sub">Tanggal Cetak: {{ \Carbon\Carbon::now()->format('d M Y') }}</div>
            </td>
        </tr>
    </table>
</div>

<!-- Top Products: Kantin -->
<div class="section-head first">15 Produk Terlaris &mdash; Kantin</div>
<table class="data-table">
    <thead>
        <tr>
            <th class="c" style="width:7%;">Rank</th>
            <th style="width:48%;">Nama Produk</th>
            <th style="width:30%;">Kategori</th>
            <th class="r" style="width:15%;">Total Terjual</th>
        </tr>
    </thead>
    <tbody>
        @forelse($topProductsKantin as $index => $p)
            <tr>
                <td class="c">
                    <span class="rank {{ $index < 3 ? 'top3' : '' }}">#{{ $index + 1 }}</span>
                </td>
                <td>
                    <strong>{{ $p->name }}</strong>
                    <div class="code">{{ $p->code ?? 'Tanpa Kode' }}</div>
                </td>
                <td>{{ $p->category->name }}</td>
                <td class="r mn" style="font-weight:bold;">{{ number_format($p->sold_count) }} pcs</td>
            </tr>
        @empty
            <tr><td colspan="4" class="empty-state">Belum ada data penjualan produk kantin.</td></tr>
        @endforelse
    </tbody>
</table>

<!-- Top Products: Siswa -->
<div class="section-head">15 Produk Terlaris &mdash; Titipan Siswa</div>
<table class="data-table">
    <thead>
        <tr>
            <th class="c" style="width:7%;">Rank</th>
            <th style="width:48%;">Nama Produk</th>
            <th style="width:30%;">Kategori</th>
            <th class="r" style="width:15%;">Total Terjual</th>
        </tr>
    </thead>
    <tbody>
        @forelse($topProductsSiswa as $index => $p)
            <tr>
                <td class="c">
                    <span class="rank {{ $index < 3 ? 'top3' : '' }}">#{{ $index + 1 }}</span>
                </td>
                <td>
                    <strong>{{ $p->name }}</strong>
                    <div class="code">{{ $p->code ?? 'Tanpa Kode' }}</div>
                </td>
                <td>{{ $p->category->name }}</td>
                <td class="r mn" style="font-weight:bold;">{{ number_format($p->sold_count) }} pcs</td>
            </tr>
        @empty
            <tr><td colspan="4" class="empty-state">Belum ada data penjualan produk titipan siswa.</td></tr>
        @endforelse
    </tbody>
</table>

<div class="page-break"></div>

<!-- Page 2 Header -->
<div class="header-wrap">
    <table class="header-table">
        <tr>
            <td>
                <div class="brand-name">Kantin Smekda</div>
                <div class="brand-tagline">Laporan Keuangan Sekolah</div>
            </td>
            <td>
                <div class="doc-title">Laporan Produk Terlaris &amp; Stok</div>
                <div class="doc-sub">Stok Menipis &mdash; hal. 2</div>
            </td>
        </tr>
    </table>
</div>

<!-- Low Stock: Kantin -->
<div class="section-head warning first">Stok Menipis &mdash; Produk Kantin (Stok &le; 5)</div>
<table class="data-table">
    <thead>
        <tr>
            <th style="width:50%;">Nama Produk</th>
            <th style="width:35%;">Kategori</th>
            <th class="c" style="width:15%;">Sisa Stok</th>
        </tr>
    </thead>
    <tbody>
        @forelse($lowStockProductsKantin as $p)
            <tr>
                <td><strong>{{ $p->name }}</strong></td>
                <td>{{ $p->category->name }}</td>
                <td class="c">
                    <span class="stock-val {{ $p->stock == 0 ? 'stock-critical' : ($p->stock <= 2 ? 'stock-low' : 'stock-ok') }}">
                        {{ $p->stock }} pcs
                    </span>
                </td>
            </tr>
        @empty
            <tr>
                <td colspan="3" class="c" style="color:#0c6b3a; padding:12px; background-color:#f0fdf4; font-weight:bold;">
                    &#10003; Semua stok produk kantin aman.
                </td>
            </tr>
        @endforelse
    </tbody>
</table>

<!-- Low Stock: Siswa -->
<div class="section-head warning">Stok Menipis &mdash; Titipan Siswa (Stok &le; 5)</div>
<table class="data-table">
    <thead>
        <tr>
            <th style="width:38%;">Nama Produk</th>
            <th style="width:27%;">Kategori</th>
            <th style="width:20%;">Penitip / Kelas</th>
            <th class="c" style="width:15%;">Sisa Stok</th>
        </tr>
    </thead>
    <tbody>
        @forelse($lowStockProductsSiswa as $p)
            <tr>
                <td><strong>{{ $p->name }}</strong></td>
                <td>{{ $p->category->name }}</td>
                <td>
                    {{ $p->seller->name ?? '-' }}
                    @if($p->seller->class ?? null)
                        <div style="font-size:7.5px; color:#8fa3b1;">Kelas {{ $p->seller->class }}</div>
                    @endif
                </td>
                <td class="c">
                    <span class="stock-val {{ $p->stock == 0 ? 'stock-critical' : ($p->stock <= 2 ? 'stock-low' : 'stock-ok') }}">
                        {{ $p->stock }} pcs
                    </span>
                </td>
            </tr>
        @empty
            <tr>
                <td colspan="4" class="c" style="color:#0c6b3a; padding:12px; background-color:#f0fdf4; font-weight:bold;">
                    &#10003; Semua stok produk titipan siswa aman.
                </td>
            </tr>
        @endforelse
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
