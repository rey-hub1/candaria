<table>
    <thead>
        <tr>
            <th colspan="11" style="font-weight: bold; font-size: 14px; text-align: left;">Kantin Smekda</th>
        </tr>
        <tr>
            <th colspan="11" style="font-weight: bold; font-size: 12px; text-align: left;">Laporan Stok Harian Produk</th>
        </tr>
        <tr>
            <th colspan="11" style="font-size: 10px; color: #555555; text-align: left;">
                Tanggal Laporan: {{ \Carbon\Carbon::parse($date)->format('d F Y') }}
            </th>
        </tr>
        <tr>
            <th colspan="11"></th>
        </tr>
        <!-- Table Header -->
        <tr>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: center;">No</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: left;">Nama Produk</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: center;">Stok Pagi</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: center;">Tambahan Stok Masuk</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: center;">Total Stok</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: center;">Sisa Stok</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: left;">Pemilik</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: center;">Jumlah Terjual</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: right;">HPP</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: right;">Harga Jual</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: right;">Total Harga (Penjualan)</th>
        </tr>
    </thead>
    <tbody>
        @php
            $grandTotalTerjual = 0;
            $grandTotalRevenue = 0;
        @endphp
        @foreach($reportData as $index => $row)
            @php
                $grandTotalTerjual += $row->qty_sold;
                $grandTotalRevenue += $row->total_harga;
            @endphp
            <tr>
                <td style="border: 1px solid #cbd5e1; text-align: center;">{{ $index + 1 }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: left;">{{ $row->product->name }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: center;">{{ $row->stok_pagi }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: center;">{{ $row->tambahan_stok }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: center;">{{ $row->total_stok }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: center;">{{ $row->sisa_stok }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: left;">{{ $row->pemilik }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: center;">{{ $row->qty_sold }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($row->cost_price, 0, ',', '.') }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($row->selling_price, 0, ',', '.') }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($row->total_harga, 0, ',', '.') }}</td>
            </tr>
        @endforeach

        @if(!empty($reportData))
            <tr>
                <td colspan="2" style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: center;">TOTAL</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: center;">{{ collect($reportData)->sum('stok_pagi') }}</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: center;">{{ collect($reportData)->sum('tambahan_stok') }}</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: center;">{{ collect($reportData)->sum('total_stok') }}</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: center;">{{ collect($reportData)->sum('sisa_stok') }}</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1;">-</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: center;">{{ $grandTotalTerjual }}</td>
                <td colspan="2" style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: center;">-</td>
                <td style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #cbd5e1; text-align: right;">Rp{{ number_format($grandTotalRevenue, 0, ',', '.') }}</td>
            </tr>
        @endif
    </tbody>
</table>
