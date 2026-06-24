<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Hutang Kembalian</title>
    <style>
        @page { margin: 1.8cm 1.5cm; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 10px; color: #1e2d3d; margin: 0; }
        .header-wrap { margin-bottom: 18px; border-bottom: 2px solid #1b3a6b; padding-bottom: 10px; }
        .brand-name { font-size: 18px; font-weight: bold; color: #1b3a6b; letter-spacing: 1px; text-transform: uppercase; }
        .brand-tagline { font-size: 8px; color: #8fa3b1; margin-top: 2px; }
        .doc-title { font-size: 12px; font-weight: bold; color: #1b3a6b; text-transform: uppercase; margin-top: 8px; }
        .summary { margin-bottom: 14px; font-size: 10px; }
        .summary b { color: #92400e; }
        table.data { width: 100%; border-collapse: collapse; }
        table.data thead tr { background-color: #1b3a6b; }
        table.data th { color: #fff; font-weight: bold; text-transform: uppercase; font-size: 7.5px; padding: 7px 8px; text-align: left; }
        table.data th.r, table.data td.r { text-align: right; }
        table.data td { padding: 6px 8px; border-bottom: 1px solid #e8edf3; font-size: 9.5px; }
        table.data tbody tr:nth-child(even) td { background-color: #f4f7fb; }
        .badge-paid { color: #0c6b3a; font-weight: bold; }
        .badge-unpaid { color: #b45309; font-weight: bold; }
        .footer { margin-top: 24px; font-size: 8px; color: #8fa3b1; }
    </style>
</head>
<body>
    <div class="header-wrap">
        <div class="brand-name">Kantin Smekda</div>
        <div class="brand-tagline">SMKN 2 Purwakarta</div>
        <div class="doc-title">Laporan Hutang Kembalian ke Customer</div>
    </div>

    <div class="summary">
        Total: <b>Rp{{ number_format($total, 0, ',', '.') }}</b> &nbsp;·&nbsp;
        Belum lunas: <b>Rp{{ number_format($unpaid, 0, ',', '.') }}</b> &nbsp;·&nbsp;
        {{ $debts->count() }} hutang
    </div>

    <table class="data">
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Nama</th>
                <th>Kelas</th>
                <th>Transaksi</th>
                <th class="r">Nominal</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($debts as $d)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($d->date)->format('d/m/Y') }}</td>
                    <td>{{ $d->customer_name ?: ($d->customer_note ?: '-') }}</td>
                    <td>{{ $d->customer_class ?: '-' }}</td>
                    <td>{{ $d->transaction->transaction_code ?? '-' }}</td>
                    <td class="r">Rp{{ number_format($d->amount, 0, ',', '.') }}</td>
                    <td class="{{ $d->status === 'paid' ? 'badge-paid' : 'badge-unpaid' }}">{{ $d->status === 'paid' ? 'Lunas' : 'Belum' }}</td>
                </tr>
            @empty
                <tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:20px;">Tidak ada data.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">Dicetak: {{ \Carbon\Carbon::now()->format('d M Y, H:i:s') }} WIB</div>
</body>
</html>
