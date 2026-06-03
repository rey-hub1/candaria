<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Penjualan Harian</title>
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

        /* Summary Cards */
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: none;
        }
        .summary-table td {
            border: none;
            padding: 0 8px 0 0;
            width: 33.33%;
        }
        .summary-table td:last-child {
            padding-right: 0;
        }
        .card {
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 10px;
            background-color: #f8fafc;
        }
        .card-label {
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 2px;
        }
        .card-value {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
        }
        .card-desc {
            font-size: 8px;
            color: #64748b;
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
            margin-top: 30px;
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
                    <div class="report-title">Laporan Penjualan Harian</div>
                    <div class="report-period">
                        Periode: {{ \Carbon\Carbon::parse($startDate)->format('d M Y') }} - {{ \Carbon\Carbon::parse($endDate)->format('d M Y') }}
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Summary Cards -->
    <table class="summary-table">
        <tr>
            <td>
                <div class="card">
                    <div class="card-label">Total Omset</div>
                    <div class="card-value">Rp{{ number_format($grandTotalSales, 0, ',', '.') }}</div>
                    <div class="card-desc">Kotor keseluruhan transaksi</div>
                </div>
            </td>
            <td>
                <div class="card">
                    <div class="card-label">Profit Kantin</div>
                    <div class="card-value">Rp{{ number_format($grandTotalProfitKantin, 0, ',', '.') }}</div>
                    <div class="card-desc">Laba bersih kas kantin</div>
                </div>
            </td>
            <td>
                <div class="card">
                    <div class="card-label">Uang Penitip (Siswa)</div>
                    <div class="card-value">Rp{{ number_format($grandTotalProfitSeller, 0, ',', '.') }}</div>
                    <div class="card-desc">Bagi hasil untuk siswa</div>
                </div>
            </td>
        </tr>
    </table>

    <!-- Data Table -->
    <table class="data-table">
        <thead>
            <tr>
                <th class="text-center" style="width: 5%;">No</th>
                <th style="width: 25%;">Tanggal</th>
                <th class="text-center" style="width: 15%;">Transaksi</th>
                <th class="text-right" style="width: 18%;">Total Omset</th>
                <th class="text-right" style="width: 18%;">Profit Kantin</th>
                <th class="text-right" style="width: 19%;">Uang Siswa</th>
            </tr>
        </thead>
        <tbody>
            @forelse($salesData as $index => $data)
                <tr>
                    <td class="text-center font-mono">{{ $index + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($data->date)->format('d M Y') }}</td>
                    <td class="text-center font-mono">{{ $data->transaction_count }}</td>
                    <td class="text-right font-mono">Rp{{ number_format($data->total_sales, 0, ',', '.') }}</td>
                    <td class="text-right font-mono">Rp{{ number_format($data->profit_kantin, 0, ',', '.') }}</td>
                    <td class="text-right font-mono">Rp{{ number_format($data->profit_seller, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="text-center" style="color: #64748b; padding: 20px;">Tidak ada data penjualan pada rentang tanggal tersebut.</td>
                </tr>
            @endforelse

            @if(!$salesData->isEmpty())
                <tr class="total-row">
                    <td colspan="2" class="text-center">TOTAL</td>
                    <td class="text-center font-mono">{{ $salesData->sum('transaction_count') }}</td>
                    <td class="text-right font-mono">Rp{{ number_format($grandTotalSales, 0, ',', '.') }}</td>
                    <td class="text-right font-mono">Rp{{ number_format($grandTotalProfitKantin, 0, ',', '.') }}</td>
                    <td class="text-right font-mono">Rp{{ number_format($grandTotalProfitSeller, 0, ',', '.') }}</td>
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
                    <div class="signature-title">Sidoarjo, {{ \Carbon\Carbon::now()->format('d M Y') }}</div>
                    <div class="signature-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    <div class="signature-role">Pengelola Kantin Smekda</div>
                </div>
            </td>
        </tr>
    </table>

</body>
</html>
