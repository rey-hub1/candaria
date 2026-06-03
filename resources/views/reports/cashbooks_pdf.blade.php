<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Buku Kas & Mutasi Saldo</title>
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
        .summary-table {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }
        .summary-table td {
            padding: 10px;
            border: 1px solid #cbd5e1;
            background-color: #f8fafc;
            text-align: center;
        }
        .summary-title {
            font-size: 9px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .summary-value {
            font-size: 14px;
            font-weight: bold;
            color: #0f172a;
        }
        .summary-value.debit { color: #059669; }
        .summary-value.credit { color: #e11d48; }
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
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-mono { font-family: 'Courier New', Courier, monospace; }
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

    <div class="report-header">
        <table>
            <tr>
                <td>
                    <div class="brand-title">Kantin Smekda</div>
                    <div class="brand-subtitle">Laporan Keuangan Sekolah</div>
                </td>
                <td>
                    <div class="report-title">Laporan Buku Kas & Mutasi Saldo</div>
                    <div class="report-period">
                        Tanggal Cetak: {{ \Carbon\Carbon::now()->format('d M Y H:i') }}
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <table class="summary-table">
        <tr>
            <td>
                <div class="summary-title">Total Debit</div>
                <div class="summary-value debit">Rp {{ number_format($exportTotalDebit, 0, ',', '.') }}</div>
            </td>
            <td>
                <div class="summary-title">Total Kredit</div>
                <div class="summary-value credit">Rp {{ number_format($exportTotalCredit, 0, ',', '.') }}</div>
            </td>
            <td>
                <div class="summary-title">Saldo Saat Ini</div>
                <div class="summary-value debit">Rp {{ number_format($exportCurrentBalance, 0, ',', '.') }}</div>
            </td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th class="text-center" style="width: 5%;">No</th>
                <th class="text-center" style="width: 15%;">Tanggal</th>
                <th style="width: 30%;">Keterangan</th>
                <th class="text-right" style="width: 25%;">Debit (Masuk)</th>
                <th class="text-right" style="width: 25%;">Kredit (Keluar)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($exportData as $index => $item)
                <tr>
                    <td class="text-center font-mono">{{ $index + 1 }}</td>
                    <td class="text-center font-mono">{{ \Carbon\Carbon::parse($item->date)->format('d/m/Y') }}</td>
                    <td>
                        <strong>{{ $item->description }}</strong>
                        <div style="font-size: 7.5px; color: #94a3b8; margin-top: 2px;">
                            {{ $item->source === 'manual' ? 'Manual' : ($item->source === 'transaction' ? 'Penjualan Otomatis' : 'Pelunasan Otomatis') }}
                        </div>
                    </td>
                    <td class="text-right font-mono" style="color: #059669; font-weight: bold;">
                        {{ $item->type === 'debit' ? 'Rp ' . number_format($item->amount, 0, ',', '.') : '-' }}
                    </td>
                    <td class="text-right font-mono" style="color: #e11d48; font-weight: bold;">
                        {{ $item->type === 'credit' ? 'Rp ' . number_format($item->amount, 0, ',', '.') : '-' }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center" style="color: #64748b; padding: 15px;">Data buku kas kosong.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

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
