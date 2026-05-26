@extends('layouts.app')

@section('title', 'Laporan Titipan Siswa')

@section('content')
<div class="space-y-6">
    
    <!-- Filter Card -->
    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <form action="{{ route('reports.titipan') }}" method="GET" class="flex flex-wrap items-end gap-4">
            <div>
                <label for="start_date" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tanggal Mulai</label>
                <input type="date" name="start_date" id="start_date" value="{{ $startDate }}" required
                    class="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div>
                <label for="end_date" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tanggal Selesai</label>
                <input type="date" name="end_date" id="end_date" value="{{ $endDate }}" required
                    class="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition">
                Filter Laporan
            </button>
            <button type="button" onclick="window.print()" class="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg transition print:hidden ml-auto">
                Cetak Laporan
            </button>
        </form>
    </div>

    <!-- Summary Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Barang Terjual</p>
            <h3 class="text-2xl font-extrabold text-slate-900 mt-1">{{ number_format($summary->total_qty) }} pcs</h3>
            <p class="text-xs text-slate-400 mt-1">Akumulasi kuantitas terjual</p>
        </div>
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Hasil untuk Siswa</p>
            <h3 class="text-2xl font-extrabold text-blue-600 mt-1">Rp{{ number_format($summary->total_seller, 0, ',', '.') }}</h3>
            <p class="text-xs text-slate-400 mt-1">Total yang harus diserahkan ke penitip</p>
        </div>
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Keuntungan Kantin (Bagi Hasil Rp500)</p>
            <h3 class="text-2xl font-extrabold text-emerald-600 mt-1">Rp{{ number_format($summary->total_kantin, 0, ',', '.') }}</h3>
            <p class="text-xs text-emerald-500 font-semibold mt-1">Bersih untuk kantin (Rp500 / barang)</p>
        </div>
    </div>

    <!-- Reports Table -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="report-table">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 class="text-base font-bold text-slate-900">Rincian Penjualan Barang Titipan</h3>
        </div>
        
        @if($items->isEmpty())
            <div class="text-center py-12 text-slate-400 text-sm">
                Tidak ada data penjualan barang titipan pada rentang tanggal tersebut.
            </div>
        @else
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100">
                    <thead>
                        <tr class="bg-slate-50">
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal & Waktu</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Siswa Penitip</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Produk</th>
                            <th class="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Harga Siswa</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Hasil Siswa</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Laba Kantin</th>
                            <th class="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Status Bayar</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 bg-white">
                        @foreach($items as $item)
                            <tr class="hover:bg-slate-50 transition">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">{{ $item->created_at->format('d/m/Y H:i') }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-950">{{ $item->product->seller->name ?? '-' }} ({{ $item->product->seller->class ?? '-' }})</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">{{ $item->product->name }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-slate-700">{{ $item->quantity }} pcs</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600">Rp{{ number_format($item->cost_price, 0, ',', '.') }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">Rp{{ number_format($item->profit_seller, 0, ',', '.') }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-emerald-600">Rp{{ number_format($item->profit_kantin, 0, ',', '.') }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    @if($item->seller_settlement_id)
                                        <a href="{{ route('settlements.show', $item->seller_settlement_id) }}" 
                                           class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:underline">
                                            Lunas (#SET-{{ str_pad($item->seller_settlement_id, 4, '0', STR_PAD_LEFT) }})
                                        </a>
                                    @else
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                            Belum Dibayar
                                        </span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <div class="px-6 py-4 border-t border-slate-100 bg-slate-50">
                {{ $items->links() }}
            </div>
        @endif
    </div>

</div>

<!-- Print Styles -->
<style>
    @media print {
        body {
            background-color: white !important;
        }
        aside, header, form {
            display: none !important;
        }
        main {
            padding: 0 !important;
        }
        #report-table {
            border: none !important;
            box-shadow: none !important;
        }
    }
</style>
@endsection
