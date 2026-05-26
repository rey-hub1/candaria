@extends('layouts.app')

@section('title', 'Laporan Produk Terlaris & Stok')

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

    <!-- Column 1: Top Selling Products -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900">Produk Paling Laku (Terlaris)</h3>
            <span class="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">15 Teratas</span>
        </div>

        @if($topProducts->isEmpty())
            <div class="text-center py-16 text-slate-400 text-sm">
                Belum ada data penjualan produk.
            </div>
        @else
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100">
                    <thead>
                        <tr class="bg-slate-50">
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-16">Rank</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Produk</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori & Jenis</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Total Terjual</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 bg-white">
                        @foreach($topProducts as $index => $p)
                            <tr class="hover:bg-slate-50 transition">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-slate-500">
                                    @if($index == 0)
                                        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs">🥇</span>
                                    @elseif($index == 1)
                                        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs">🥈</span>
                                    @elseif($index == 2)
                                        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-xs">🥉</span>
                                    @else
                                        #{{ $index + 1 }}
                                    @endif
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-bold text-slate-950">{{ $p->name }}</div>
                                    <div class="text-xs text-slate-400 font-mono">{{ $p->code ?? 'Tanpa Kode' }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-xs font-semibold text-slate-600">{{ $p->category->name }}</div>
                                    <div class="mt-1">
                                        <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase {{ $p->type === 'kantin' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700' }}">
                                            {{ $p->type }}
                                        </span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-slate-900">{{ number_format($p->sold_count) }} pcs</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </div>

    <!-- Column 2: Low Stock Products -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-fit">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900">Stok Hampir Habis</h3>
            <span class="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">Stok &le; 5</span>
        </div>

        @if($lowStockProducts->isEmpty())
            <div class="text-center py-16 text-slate-400 text-sm">
                Semua stok produk aman (di atas 5 pcs).
            </div>
        @else
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100">
                    <thead>
                        <tr class="bg-slate-50">
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Produk</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori & Jenis</th>
                            <th class="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Sisa Stok</th>
                            <th class="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 bg-white">
                        @foreach($lowStockProducts as $p)
                            <tr class="hover:bg-slate-50 transition">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-bold text-slate-950">{{ $p->name }}</div>
                                    @if($p->seller)
                                        <div class="text-[10px] text-slate-500 font-medium">Titipan: {{ $p->seller->name }}</div>
                                    @endif
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-xs font-semibold text-slate-600">{{ $p->category->name }}</div>
                                    <div class="mt-1">
                                        <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase {{ $p->type === 'kantin' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700' }}">
                                            {{ $p->type }}
                                        </span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <span class="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                                        {{ $p->stock }} pcs
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <a href="{{ route('products.index') }}" 
                                       class="inline-flex items-center px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded transition">
                                        Tambah Stok
                                    </a>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </div>

</div>
@endsection
