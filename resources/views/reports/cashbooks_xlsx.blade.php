<table>
    <thead>
        <tr>
            <th colspan="5" style="font-weight: bold; font-size: 14px; text-align: left;">Kantin Smekda</th>
        </tr>
        <tr>
            <th colspan="5" style="font-weight: bold; font-size: 12px; text-align: left;">Laporan Buku Kas & Mutasi Saldo</th>
        </tr>
        <tr>
            <th colspan="5" style="font-size: 10px; color: #555555; text-align: left;">
                Tanggal Cetak: {{ \Carbon\Carbon::now()->format('d F Y H:i') }}
            </th>
        </tr>
        <tr>
            <th colspan="5"></th>
        </tr>
        <tr>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: center;">No</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: left;">Tanggal</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: left;">Keterangan</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: right;">Debit (Masuk)</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: right;">Kredit (Keluar)</th>
        </tr>
    </thead>
    <tbody>
        @foreach($exportData as $index => $item)
            <tr>
                <td style="border: 1px solid #cbd5e1; text-align: center;">{{ $index + 1 }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: left;">{{ \Carbon\Carbon::parse($item->date)->format('d/m/Y') }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: left;">
                    {{ $item->description }} 
                    ({{ $item->source === 'manual' ? 'Manual' : ($item->source === 'transaction' ? 'Penjualan' : 'Pelunasan') }})
                </td>
                <td style="border: 1px solid #cbd5e1; text-align: right;">
                    {{ $item->type === 'debit' ? $item->amount : 0 }}
                </td>
                <td style="border: 1px solid #cbd5e1; text-align: right;">
                    {{ $item->type === 'credit' ? $item->amount : 0 }}
                </td>
            </tr>
        @endforeach
        <tr>
            <td colspan="3" style="font-weight: bold; text-align: right; border: 1px solid #cbd5e1;">Total:</td>
            <td style="font-weight: bold; text-align: right; border: 1px solid #cbd5e1;">{{ $exportTotalDebit }}</td>
            <td style="font-weight: bold; text-align: right; border: 1px solid #cbd5e1;">{{ $exportTotalCredit }}</td>
        </tr>
        <tr>
            <td colspan="3" style="font-weight: bold; text-align: right; border: 1px solid #cbd5e1;">Saldo Saat Ini:</td>
            <td colspan="2" style="font-weight: bold; text-align: right; border: 1px solid #cbd5e1;">{{ $exportCurrentBalance }}</td>
        </tr>
    </tbody>
</table>
