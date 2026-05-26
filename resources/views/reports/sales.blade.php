@extends('layouts.app')

@section('title', 'Laporan Penjualan Harian')

@section('content')
<div class="space-y-6">
    
    <!-- Filter Card -->
    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <form action="{{ route('reports.sales') }}" method="GET" class="flex flex-wrap items-end gap-4">
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
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Penjualan (Omset)</p>
            <h3 class="text-2xl font-extrabold text-slate-900 mt-1">Rp{{ number_format($grandTotalSales, 0, ',', '.') }}</h3>
            <p class="text-xs text-slate-400 mt-1">Kotor keseluruhan transaksi</p>
        </div>
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Keuntungan Kantin</p>
            <h3 class="text-2xl font-extrabold text-emerald-600 mt-1">Rp{{ number_format($grandTotalProfitKantin, 0, ',', '.') }}</h3>
            <p class="text-xs text-emerald-500 font-semibold mt-1">Bersih untuk kas kantin</p>
        </div>
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Uang Penitip (Siswa)</p>
            <h3 class="text-2xl font-extrabold text-blue-600 mt-1">Rp{{ number_format($grandTotalProfitSeller, 0, ',', '.') }}</h3>
            <p class="text-xs text-slate-400 mt-1">Uang yang dikembalikan ke penitip</p>
        </div>
    </div>

    <!-- Reports Table -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="report-table">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 class="text-base font-bold text-slate-900">Rincian Penjualan per Tanggal</h3>
        </div>
        
        @if($salesData->isEmpty())
            <div class="text-center py-12 text-slate-400 text-sm">
                Tidak ada data penjualan pada rentang tanggal tersebut.
            </div>
        @else
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100">
                    <thead>
                        <tr class="bg-slate-50">
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                            <th class="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah Transaksi</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Total Omset</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Keuntungan Kantin</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Uang Siswa (Titipan)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 bg-white">
                        @foreach($salesData as $data)
                            <tr class="hover:bg-slate-50 transition">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 font-mono">{{ Carbon\Carbon::parse($data->date)->format('d F Y') }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-slate-600">{{ $data->transaction_count }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-slate-900">Rp{{ number_format($data->total_sales, 0, ',', '.') }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-emerald-600">Rp{{ number_format($data->profit_kantin, 0, ',', '.') }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600">Rp{{ number_format($data->profit_seller, 0, ',', '.') }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
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
        /* Hide sidebar and navigation */
        aside, header, form {
            display: none !important;
        }
        /* Show report fully */
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
