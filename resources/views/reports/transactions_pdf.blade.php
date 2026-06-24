<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Riwayat Transaksi</title>
    <style>
        @page { margin: 1.4cm 1.2cm; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 9px; color: #1e2d3d; margin: 0; }
        .head { border-bottom: 2px solid #1b3a6b; padding-bottom: 8px; margin-bottom: 14px; }
        .brand { font-size: 16px; font-weight: bold; color: #1b3a6b; text-transform: uppercase; letter-spacing: 1px; }
        .title { font-size: 11px; font-weight: bold; color: #1b3a6b; }
        .sub { font-size: 8px; color: #8fa3b1; }
        .cards { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .cards td { width: 33.33%; padding: 8px 10px; border: 1px solid #cbd5e1; background: #f8fafc; }
        .cards .lbl { font-size: 7px; color: #64748b; text-transform: uppercase; }
        .cards .val { font-size: 12px; font-weight: bold; color: #0f172a; }
        table.data { width: 100%; border-collapse: collapse; }
        table.data th { background: #1b3a6b; color: #fff; font-size: 8px; padding: 5px 6px; text-align: left; }
        table.data td { border-bottom: 1px solid #e2e8f0; padding: 4px 6px; }
        .r { text-align: right; }
        .voided { color: #be123c; }
    </style>
</head>
<body>
    @php
        $total = $transactions->where('status', 'completed')->sum('total_amount');
        $count = $transactions->count();
        $voided = $transactions->where('status', 'voided')->count();
    @endphp
    <div class="head">
        <div class="brand">Kantin Smekda</div>
        <div class="title">Riwayat Transaksi Kantin</div>
        <div class="sub">
            Periode:
            {{ !empty($filters['start_date']) ? \Carbon\Carbon::parse($filters['start_date'])->format('d M Y') : 'Awal' }}
            s/d
            {{ !empty($filters['end_date']) ? \Carbon\Carbon::parse($filters['end_date'])->format('d M Y') : 'Sekarang' }}
        </div>
    </div>

    <table class="cards">
        <tr>
            <td><div class="lbl">Total Omset (Selesai)</div><div class="val">Rp{{ number_format($total, 0, ',', '.') }}</div></td>
            <td><div class="lbl">Jumlah Transaksi</div><div class="val">{{ $count }}</div></td>
            <td><div class="lbl">Dibatalkan</div><div class="val">{{ $voided }}</div></td>
        </tr>
    </table>

    <table class="data">
        <thead>
            <tr>
                <th>No</th><th>Kode</th><th>Tanggal</th><th>Kasir</th>
                <th class="r">Total</th><th class="r">Bayar</th><th class="r">Kembalian</th><th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $i => $t)
            <tr class="{{ $t->status === 'voided' ? 'voided' : '' }}">
                <td>{{ $i + 1 }}</td>
                <td>{{ $t->transaction_code }}</td>
                <td>{{ $t->created_at->format('d/m/Y H:i') }}</td>
                <td>{{ $t->user?->name }}</td>
                <td class="r">{{ number_format($t->total_amount, 0, ',', '.') }}</td>
                <td class="r">{{ number_format($t->paid_amount, 0, ',', '.') }}</td>
                <td class="r">{{ number_format($t->change_amount, 0, ',', '.') }}</td>
                <td>{{ $t->status === 'voided' ? 'Dibatalkan' : 'Selesai' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
