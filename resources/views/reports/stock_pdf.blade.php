<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Stok Harian Produk</title>
    <style>
        @page {
            margin: 1.2cm;
        }
        body {
            font-family: sans-serif;
            font-size: 9px;
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
            font-size: 15px;
            font-weight: bold;
            color: #1e293b;
            text-transform: uppercase;
        }
        .brand-subtitle {
            font-size: 8px;
            color: #64748b;
            margin-top: 1px;
        }
        .report-title {
            font-size: 11px;
            font-weight: bold;
            color: #1e293b;
            text-align: right;
            text-transform: uppercase;
        }
        .report-period {
            font-size: 8px;
            color: #64748b;
            text-align: right;
            margin-top: 1px;
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
            font-size: 7.5px;
            padding: 5px 6px;
            border: 1px solid #cbd5e1;
        }
        .data-table td {
            padding: 5px 6px;
            border: 1px solid #e2e8f0;
        }
        .data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .data-table tr.total-row {
            background-color: #f1f5f9 !important;
            font-weight: bold;
        }
        .data-table tr.total-row td {
            border-top: 1.5px solid #94a3b8;
            border-bottom: 1.5px solid #94a3b8;
            font-weight: bold;
            color: #0f172a;
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
            font-size: 8px;
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
                    <div class="brand-subtitle">Laporan Keuangan & Inventaris Sekolah</div>
                </td>
                <td>
                    <div class="report-title">Laporan Stok Harian Produk</div>
                    <div class="report-period">
                        Tanggal: {{ \Carbon\Carbon::parse($date)->format('d F Y') }}
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Data Table -->
    <table class="data-table">
        <thead>
            <tr>
                <th class="text-center" style="width: 3%;">No</th>
                <th style="width: 20%;">Nama Produk</th>
                <th class="text-center" style="width: 7%;">Stok Pagi</th>
                <th class="text-center" style="width: 9%;">Tambahan Masuk</th>
                <th class="text-center" style="width: 7%;">Total Stok</th>
                <th class="text-center" style="width: 7%;">Sisa Stok</th>
                <th style="width: 13%;">Pemilik</th>
                <th class="text-center" style="width: 8%;">Jumlah Terjual</th>
                <th class="text-right" style="width: 8%;">HPP</th>
                <th class="text-right" style="width: 8%;">Harga Jual</th>
                <th class="text-right" style="width: 10%;">Total Harga</th>
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
                @endphp
                <tr>
                    <td class="text-center font-mono">{{ $index + 1 }}</td>
                    <td><strong>{{ $row->product->name }}</strong></td>
                    <td class="text-center font-mono">{{ $row->stok_pagi }}</td>
                    <td class="text-center font-mono">{{ $row->tambahan_stok }}</td>
                    <td class="text-center font-mono">{{ $row->total_stok }}</td>
                    <td class="text-center font-mono">{{ $row->sisa_stok }}</td>
                    <td>{{ $row->pemilik }}</td>
                    <td class="text-center font-mono">{{ $row->qty_sold }}</td>
                    <td class="text-right font-mono">Rp{{ number_format($row->cost_price, 0, ',', '.') }}</td>
                    <td class="text-right font-mono">Rp{{ number_format($row->selling_price, 0, ',', '.') }}</td>
                    <td class="text-right font-mono">Rp{{ number_format($row->total_harga, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="11" class="text-center" style="color: #64748b; padding: 20px;">Tidak ada data produk.</td>
                </tr>
            @endforelse

            @if(!empty($reportData))
                <tr class="total-row">
                    <td colspan="2" class="text-center">TOTAL</td>
                    <td class="text-center font-mono">{{ collect($reportData)->sum('stok_pagi') }}</td>
                    <td class="text-center font-mono">{{ collect($reportData)->sum('tambahan_stok') }}</td>
                    <td class="text-center font-mono">{{ collect($reportData)->sum('total_stok') }}</td>
                    <td class="text-center font-mono">{{ collect($reportData)->sum('sisa_stok') }}</td>
                    <td>-</td>
                    <td class="text-center font-mono">{{ $grandTotalTerjual }}</td>
                    <td colspan="2" class="text-center">-</td>
                    <td class="text-right font-mono">Rp{{ number_format($grandTotalRevenue, 0, ',', '.') }}</td>
                </tr>
            @endif
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
                    <div class="signature-title">Sidoarjo, {{ \Carbon\Carbon::now()->format('d F Y') }}</div>
                    <div class="signature-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    <div class="signature-role">Pengelola Kantin Smekda</div>
                </div>
            </td>
        </tr>
    </table>

</body>
</html>
