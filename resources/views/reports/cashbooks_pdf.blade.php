<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Buku Kas &amp; Mutasi Saldo</title>
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

        /* ─── SUMMARY CARDS ─── */
        .cards-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .cards-table td { padding: 0 5px 0 0; width: 33.33%; border: none; vertical-align: top; }
        .cards-table td:last-child { padding-right: 0; }
        .card { border: 1px solid #dde1eb; border-top: 3px solid #1b3a6b; padding: 9px 11px; background-color: #f9fafc; }
        .card.green { border-top-color: #0c6b3a; }
        .card.red { border-top-color: #b91c1c; }
        .card-lbl { font-size: 7px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px; color: #8fa3b1; margin-bottom: 4px; }
        .card-val { font-size: 13px; font-weight: bold; font-family: 'DejaVu Sans Mono', monospace; color: #1e2d3d; }
        .card-val.green { color: #0c6b3a; }
        .card-val.red { color: #b91c1c; }
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
        .data-table tbody td { padding: 6px 8px; border-bottom: 1px solid #e8edf3; font-size: 9.5px; }
        .data-table tbody tr:nth-child(even) td { background-color: #f4f7fb; }

        .type-label { font-size: 7px; color: #8fa3b1; margin-top: 1px; }
        .debit-val { color: #0c6b3a; font-weight: bold; font-family: 'DejaVu Sans Mono', monospace; }
        .credit-val { color: #b91c1c; font-weight: bold; font-family: 'DejaVu Sans Mono', monospace; }
        .dash { color: #d1d5db; font-family: 'DejaVu Sans Mono', monospace; }

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
        .sig-line { font-weight: bold; color: #1e2d3d; border-top: 1px solid #718096; padding-top: 3px; font-size: 9px; }
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
                <div class="doc-title">Laporan Buku Kas &amp; Mutasi Saldo</div>
                <div class="doc-sub">Dicetak: {{ \Carbon\Carbon::now()->format('d M Y, H:i') }} WIB</div>
            </td>
        </tr>
    </table>
</div>

<table class="cards-table">
    <tr>
        <td>
            <div class="card green">
                <div class="card-lbl">Total Debit (Masuk)</div>
                <div class="card-val green">Rp{{ number_format($exportTotalDebit, 0, ',', '.') }}</div>
                <div class="card-note">Akumulasi pemasukan kas</div>
            </div>
        </td>
        <td>
            <div class="card red">
                <div class="card-lbl">Total Kredit (Keluar)</div>
                <div class="card-val red">Rp{{ number_format($exportTotalCredit, 0, ',', '.') }}</div>
                <div class="card-note">Akumulasi pengeluaran kas</div>
            </div>
        </td>
        <td>
            <div class="card">
                <div class="card-lbl">Saldo Saat Ini</div>
                <div class="card-val green">Rp{{ number_format($exportCurrentBalance, 0, ',', '.') }}</div>
                <div class="card-note">Saldo bersih kas</div>
            </div>
        </td>
    </tr>
</table>

<table class="data-table">
    <thead>
        <tr>
            <th class="c" style="width:5%;">No</th>
            <th class="c" style="width:14%;">Tanggal</th>
            <th style="width:33%;">Keterangan</th>
            <th class="r" style="width:24%;">Debit (Masuk)</th>
            <th class="r" style="width:24%;">Kredit (Keluar)</th>
        </tr>
    </thead>
    <tbody>
        @forelse($exportData as $index => $item)
            <tr>
                <td class="c mn">{{ $index + 1 }}</td>
                <td class="c mn">{{ \Carbon\Carbon::parse($item->date)->format('d/m/Y') }}</td>
                <td>
                    <strong>{{ $item->description }}</strong>
                    <div class="type-label">
                        {{ $item->source === 'manual' ? 'Manual' : ($item->source === 'transaction' ? 'Penjualan Otomatis' : 'Pelunasan Otomatis') }}
                    </div>
                </td>
                <td class="r">
                    @if($item->type === 'debit')
                        <span class="debit-val">Rp{{ number_format($item->amount, 0, ',', '.') }}</span>
                    @else
                        <span class="dash">&mdash;</span>
                    @endif
                </td>
                <td class="r">
                    @if($item->type === 'credit')
                        <span class="credit-val">Rp{{ number_format($item->amount, 0, ',', '.') }}</span>
                    @else
                        <span class="dash">&mdash;</span>
                    @endif
                </td>
            </tr>
        @empty
            <tr>
                <td colspan="5" class="c" style="color:#b0bec5; padding:20px; font-style:italic;">
                    Data buku kas kosong.
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
                    <div class="sig-date">Sidoarjo, {{ \Carbon\Carbon::now()->format('d M Y') }}</div>
                    <div class="sig-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    <div class="sig-role">Pengelola Kantin Smekda</div>
                </div>
            </td>
        </tr>
    </table>
</div>

</body>
</html>
