@extends('layouts.app')

@section('title', 'Riwayat Transaksi')

@section('content')
<div class="space-y-4">
    <!-- Header panel -->
    <div class="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <h3 class="text-sm md:text-base font-bold text-slate-900">Daftar Transaksi Kantin</h3>
        <span class="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-full">Total: {{ $transactions->total() }} Transaksi</span>
    </div>

    @if($transactions->isEmpty())
        <div class="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            Belum ada transaksi yang tercatat.
        </div>
    @else
        <!-- Mobile View: Card Stack (Visible on small screens) -->
        <div class="grid grid-cols-1 gap-3 md:hidden">
            @foreach($transactions as $t)
                <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-slate-950 font-mono text-sm">{{ $t->transaction_code }}</span>
                        <span class="text-[10px] text-slate-400 font-medium">{{ $t->created_at->format('d/m/Y H:i') }}</span>
                    </div>

                    <div class="flex justify-between items-center text-xs py-2 border-y border-slate-100">
                        <div>
                            <p class="text-slate-400 font-semibold">Petugas Kasir</p>
                            <p class="font-bold text-slate-700 mt-0.5">{{ $t->user->name }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-slate-400 font-semibold">Total Belanja</p>
                            <p class="font-extrabold text-slate-900 text-sm mt-0.5">Rp{{ number_format($t->total_amount, 0, ',', '.') }}</p>
                        </div>
                    </div>

                    <div class="flex justify-between items-center text-[11px] text-slate-500">
                        <span>Tunai: Rp{{ number_format($t->paid_amount, 0, ',', '.') }}</span>
                        <span class="text-emerald-600 font-bold">Kembalian: Rp{{ number_format($t->change_amount, 0, ',', '.') }}</span>
                    </div>

                    <div class="pt-1">
                        <a href="{{ route('transactions.show', $t->id) }}" 
                           class="block w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition">
                            Lihat Struk / Rincian
                        </a>
                    </div>
                </div>
            @endforeach
        </div>

        <!-- Desktop View: Table (Visible on medium/large screens) -->
        <div class="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100">
                    <thead>
                        <tr class="bg-slate-50">
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Kode Transaksi</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Kasir / Petugas</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal & Waktu</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Total Belanja</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Uang Bayar</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Kembalian</th>
                            <th class="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 bg-white">
                        @foreach($transactions as $t)
                            <tr class="hover:bg-slate-50 transition">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-950 font-mono">{{ $t->transaction_code }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ $t->user->name }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ $t->created_at->format('d M Y H:i') }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-slate-950">Rp{{ number_format($t->total_amount, 0, ',', '.') }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600">Rp{{ number_format($t->paid_amount, 0, ',', '.') }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-600 font-semibold">Rp{{ number_format($t->change_amount, 0, ',', '.') }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <a href="{{ route('transactions.show', $t->id) }}" 
                                       class="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded transition">
                                        Detail / Struk
                                    </a>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>

        <div class="px-5 py-4 border-t border-slate-100 bg-slate-50">
            {{ $transactions->links() }}
        </div>
    @endif
</div>
@endsection
