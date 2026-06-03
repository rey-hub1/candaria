<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body>
    <table>
    <thead>
        <tr>
            <th colspan="5" style="font-weight: bold; font-size: 14px; text-align: left;">Kantin Smekda</th>
        </tr>
        <tr>
            <th colspan="5" style="font-weight: bold; font-size: 12px; text-align: left;">Laporan Produk Terlaris dan Stok</th>
        </tr>
        <tr>
            <th colspan="5" style="font-size: 10px; color: #555555; text-align: left;">
                Tanggal Cetak: {{ \Carbon\Carbon::now()->format('d F Y H:i') }}
            </th>
        </tr>
        <tr>
            <th colspan="5"></th>
        </tr>
        <!-- Section 1 Headers -->
        <tr>
            <th colspan="5" style="font-weight: bold; font-size: 11px; background-color: #cbd5e1; border: 1px solid #94a3b8; text-align: left;">1. 15 PRODUK TERLARIS - KANTIN</th>
        </tr>
        <tr>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: center;">Rank</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: left;">Nama Produk / Kode</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: left;">Kategori</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: right;" colspan="2">Total Terjual</th>
        </tr>
    </thead>
    <tbody>
        @foreach($topProductsKantin as $index => $p)
            <tr>
                <td style="border: 1px solid #cbd5e1; text-align: center;">#{{ $index + 1 }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: left;">
                    {{ $p->name }} {{ $p->code ? '(' . $p->code . ')' : '' }}
                </td>
                <td style="border: 1px solid #cbd5e1; text-align: left;">{{ $p->category->name }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: right;" colspan="2">{{ number_format($p->sold_count) }} pcs</td>
            </tr>
        @endforeach

        <tr>
            <td colspan="5"></td>
        </tr>
        <tr>
            <td colspan="5"></td>
        </tr>

        <!-- Section 2 Headers -->
        <tr>
            <th colspan="5" style="font-weight: bold; font-size: 11px; background-color: #cbd5e1; border: 1px solid #94a3b8; text-align: left;">2. 15 PRODUK TERLARIS - TITIPAN SISWA</th>
        </tr>
        <tr>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: center;">Rank</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: left;">Nama Produk / Kode</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: left;">Kategori</th>
            <th style="font-weight: bold; background-color: #e2e8f0; border: 1px solid #cbd5e1; text-align: right;" colspan="2">Total Terjual</th>
        </tr>

        @foreach($topProductsSiswa as $index => $p)
            <tr>
                <td style="border: 1px solid #cbd5e1; text-align: center;">#{{ $index + 1 }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: left;">
                    {{ $p->name }} {{ $p->code ? '(' . $p->code . ')' : '' }}
                </td>
                <td style="border: 1px solid #cbd5e1; text-align: left;">{{ $p->category->name }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: right;" colspan="2">{{ number_format($p->sold_count) }} pcs</td>
            </tr>
        @endforeach

        <tr>
            <td colspan="5"></td>
        </tr>
        <tr>
            <td colspan="5"></td>
        </tr>

        <!-- Section 3 Headers -->
        <tr>
            <th colspan="5" style="font-weight: bold; font-size: 11px; background-color: #fca5a5; border: 1px solid #ef4444; text-align: left;">3. PRODUK KANTIN DENGAN STOK MENIPIS (&lt;= 5)</th>
        </tr>
        <tr>
            <th style="font-weight: bold; background-color: #fee2e2; border: 1px solid #cbd5e1; text-align: left;" colspan="2">Nama Produk</th>
            <th style="font-weight: bold; background-color: #fee2e2; border: 1px solid #cbd5e1; text-align: left;" colspan="2">Kategori</th>
            <th style="font-weight: bold; background-color: #fee2e2; border: 1px solid #cbd5e1; text-align: center;">Sisa Stok</th>
        </tr>

        @forelse($lowStockProductsKantin as $p)
            <tr>
                <td style="border: 1px solid #cbd5e1; text-align: left;" colspan="2">{{ $p->name }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: left;" colspan="2">{{ $p->category->name }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #b91c1c;">{{ $p->stock }} pcs</td>
            </tr>
        @empty
            <tr>
                <td colspan="5" style="border: 1px solid #cbd5e1; text-align: center; color: #475569; padding: 10px;">Semua stok produk kantin aman.</td>
            </tr>
        @endforelse

        <tr>
            <td colspan="5"></td>
        </tr>
        <tr>
            <td colspan="5"></td>
        </tr>

        <!-- Section 4 Headers -->
        <tr>
            <th colspan="5" style="font-weight: bold; font-size: 11px; background-color: #fca5a5; border: 1px solid #ef4444; text-align: left;">4. PRODUK TITIPAN SISWA DENGAN STOK MENIPIS (&lt;= 5)</th>
        </tr>
        <tr>
            <th style="font-weight: bold; background-color: #fee2e2; border: 1px solid #cbd5e1; text-align: left;" colspan="2">Nama Produk</th>
            <th style="font-weight: bold; background-color: #fee2e2; border: 1px solid #cbd5e1; text-align: left;" colspan="2">Kategori / Penitip</th>
            <th style="font-weight: bold; background-color: #fee2e2; border: 1px solid #cbd5e1; text-align: center;">Sisa Stok</th>
        </tr>

        @forelse($lowStockProductsSiswa as $p)
            <tr>
                <td style="border: 1px solid #cbd5e1; text-align: left;" colspan="2">{{ $p->name }}</td>
                <td style="border: 1px solid #cbd5e1; text-align: left;" colspan="2">
                    {{ $p->category->name }} {{ $p->seller ? '(Penitip: ' . $p->seller->name . ')' : '' }}
                </td>
                <td style="border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #b91c1c;">{{ $p->stock }} pcs</td>
            </tr>
        @empty
            <tr>
                <td colspan="5" style="border: 1px solid #cbd5e1; text-align: center; color: #475569; padding: 10px;">Semua stok produk titipan siswa aman.</td>
            </tr>
        @endforelse
    </tbody>
</table>
</body>
</html>
