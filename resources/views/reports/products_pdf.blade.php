<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Produk Terlaris & Stok</title>
    <style>
        @page {
            margin: 1.5cm;
        }
        body {
            font-family: sans-serif;
            font-size: 10.5px;
            line-height: 1.4;
            color: #334155;
            margin: 0;
            padding: 0;
        }
        /* Header style */
        .report-header {
            margin-bottom: 20px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 10px;
        }
        .report-header table {
            width: 100%;
            border-collapse: collapse;
            border: none;
        }
        .report-header td {
            border: none;
            padding: 0;
        }
        .brand-title {
            font-size: 16px;
            font-weight: bold;
            color: #1e293b;
            text-transform: uppercase;
        }
        .brand-subtitle {
            font-size: 9px;
            color: #64748b;
            margin-top: 1px;
        }
        .report-title {
            font-size: 12px;
            font-weight: bold;
            color: #1e293b;
            text-align: right;
            text-transform: uppercase;
        }
        .report-period {
            font-size: 9px;
            color: #64748b;
            text-align: right;
            margin-top: 1px;
        }

        .section-title {
            font-size: 11.5px;
            font-weight: bold;
            color: #1e293b;
            margin-top: 15px;
            margin-bottom: 8px;
            border-bottom: 1px solid #94a3b8;
            padding-bottom: 3px;
            text-transform: uppercase;
        }

        /* Data Table */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .data-table th {
            background-color: #f1f5f9;
            color: #1e293b;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 8.5px;
            padding: 6px 8px;
            border: 1px solid #cbd5e1;
        }
        .data-table td {
            padding: 6px 8px;
            border: 1px solid #e2e8f0;
        }
        .data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .font-mono {
            font-family: 'Courier New', Courier, monospace;
        }
        .badge {
            display: inline-block;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-kantin {
            color: #334155;
        }
        .badge-siswa {
            color: #64748b;
        }
        .badge-low-stock {
            color: #0f172a;
            font-weight: bold;
        }

        .page-break {
            page-break-before: always;
        }

        /* Footer / Signatures */
        .footer-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
            border: none;
        }
        .footer-table td {
            border: none;
            padding: 0;
            width: 50%;
            vertical-align: top;
        }
        .signature-section {
            text-align: right;
            padding-right: 10px;
        }
        .signature-title {
            margin-bottom: 45px;
            color: #475569;
        }
        .signature-line {
            font-weight: bold;
            text-decoration: underline;
            color: #0f172a;
        }
        .signature-role {
            font-size: 8.5px;
            color: #64748b;
            margin-top: 2px;
        }
        .print-info {
            font-size: 8px;
            color: #94a3b8;
            margin-top: 35px;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <div class="report-header">
        <table>
            <tr>
                <td>
                    <div class="brand-title">Kantin Smekda</div>
                    <div class="brand-subtitle">Laporan Keuangan Sekolah</div>
                </td>
                <td>
                    <div class="report-title">Laporan Produk Terlaris & Stok</div>
                    <div class="report-period">
                        Tanggal Cetak: {{ \Carbon\Carbon::now()->format('d M Y') }}
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Section 1: Top Products (Kantin) -->
    <div class="section-title">15 Produk Terlaris - Kantin</div>
    <table class="data-table">
        <thead>
            <tr>
                <th class="text-center" style="width: 8%;">Rank</th>
                <th style="width: 37%;">Nama Produk</th>
                <th style="width: 25%;">Kategori</th>
                <th class="text-right" style="width: 15%;">Total Terjual</th>
            </tr>
        </thead>
        <tbody>
            @forelse($topProductsKantin as $index => $p)
                <tr>
                    <td class="text-center font-mono" style="font-weight: bold;">
                        #{{ $index + 1 }}
                    </td>
                    <td>
                        <strong>{{ $p->name }}</strong>
                        <div style="font-size: 7.5px; color: #94a3b8; font-family: monospace;">{{ $p->code ?? 'Tanpa Kode' }}</div>
                    </td>
                    <td>{{ $p->category->name }}</td>
                    <td class="text-right font-mono" style="font-weight: bold; color: #0f172a;">{{ number_format($p->sold_count) }} pcs</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" class="text-center" style="color: #64748b; padding: 15px;">Belum ada data penjualan produk kantin.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Section 2: Top Products (Siswa) -->
    <div class="section-title">15 Produk Terlaris - Titipan Siswa</div>
    <table class="data-table">
        <thead>
            <tr>
                <th class="text-center" style="width: 8%;">Rank</th>
                <th style="width: 37%;">Nama Produk</th>
                <th style="width: 25%;">Kategori</th>
                <th class="text-right" style="width: 15%;">Total Terjual</th>
            </tr>
        </thead>
        <tbody>
            @forelse($topProductsSiswa as $index => $p)
                <tr>
                    <td class="text-center font-mono" style="font-weight: bold;">
                        #{{ $index + 1 }}
                    </td>
                    <td>
                        <strong>{{ $p->name }}</strong>
                        <div style="font-size: 7.5px; color: #94a3b8; font-family: monospace;">{{ $p->code ?? 'Tanpa Kode' }}</div>
                    </td>
                    <td>{{ $p->category->name }}</td>
                    <td class="text-right font-mono" style="font-weight: bold; color: #0f172a;">{{ number_format($p->sold_count) }} pcs</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" class="text-center" style="color: #64748b; padding: 15px;">Belum ada data penjualan produk titipan siswa.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Force page break to keep document clean and organized -->
    <div class="page-break"></div>

    <!-- Header for page 2 -->
    <div class="report-header">
        <table>
            <tr>
                <td>
                    <div class="brand-title">Kantin Smekda</div>
                    <div class="brand-subtitle">Laporan Keuangan Sekolah</div>
                </td>
                <td>
                    <div class="report-title">Laporan Produk Terlaris & Stok</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Section 3: Low Stock Products (Kantin) -->
    <div class="section-title">Produk Kantin dengan Stok Menipis (Stok &le; 5)</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 45%;">Nama Produk</th>
                <th style="width: 35%;">Kategori</th>
                <th class="text-center" style="width: 20%;">Sisa Stok</th>
            </tr>
        </thead>
        <tbody>
            @forelse($lowStockProductsKantin as $p)
                <tr>
                    <td><strong>{{ $p->name }}</strong></td>
                    <td>{{ $p->category->name }}</td>
                    <td class="text-center font-mono">
                        <span class="badge badge-low-stock">
                            {{ $p->stock }} pcs
                        </span>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="3" class="text-center" style="color: #475569; background-color: #f8fafc; padding: 15px;">
                        Semua stok produk kantin aman.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Section 4: Low Stock Products (Siswa) -->
    <div class="section-title">Produk Titipan Siswa dengan Stok Menipis (Stok &le; 5)</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 35%;">Nama Produk</th>
                <th style="width: 25%;">Kategori</th>
                <th style="width: 20%;">Penitip / Seller</th>
                <th class="text-center" style="width: 20%;">Sisa Stok</th>
            </tr>
        </thead>
        <tbody>
            @forelse($lowStockProductsSiswa as $p)
                <tr>
                    <td><strong>{{ $p->name }}</strong></td>
                    <td>{{ $p->category->name }}</td>
                    <td>{{ $p->seller->name ?? '-' }}</td>
                    <td class="text-center font-mono">
                        <span class="badge badge-low-stock">
                            {{ $p->stock }} pcs
                        </span>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" class="text-center" style="color: #475569; background-color: #f8fafc; padding: 15px;">
                        Semua stok produk titipan siswa aman.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Footer Signatures -->
    <table class="footer-table">
        <tr>
            <td>
                <div class="print-info">
                    Dicetak pada: {{ \Carbon\Carbon::now()->format('d M Y H:i:s') }}
                </div>
            </td>
            <td>
                <div class="signature-section">
                    <div class="signature-title">Sidoarjo, {{ \Carbon\Carbon::now()->format('d M Y') }}</div>
                    <div class="signature-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    <div class="signature-role">Pengelola Kantin Smekda</div>
                </div>
            </td>
        </tr>
    </table>

</body>
</html>
