@extends('layouts.app')

@section('title', 'Detail Pembayaran Penitip')

@section('content')
<div class="max-w-3xl mx-auto">
    
    <div class="mb-6 flex items-center justify-between">
        <a href="{{ route('settlements.index') }}" class="text-sm font-semibold text-slate-600 hover:text-slate-900">
            &larr; Kembali ke Daftar Pembayaran
        </a>
        <button onclick="window.print()" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg shadow-sm transition">
            Cetak Bukti Bayar
        </button>
    </div>

    <!-- Settlement Details Card -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-8" id="settlement-receipt">
        
        <div class="text-center pb-6 border-b border-slate-100 mb-6">
            <h2 class="text-xl font-extrabold text-slate-900 tracking-wide uppercase">BUKTI PEMBAYARAN KONSIGNASI</h2>
            <p class="text-xs text-slate-500 mt-1">KANTIN SEKOLAH SMAN PEMBANGUNAN</p>
        </div>

        <div class="grid grid-cols-2 gap-6 text-sm text-slate-600 mb-8 font-mono">
            <div>
                <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Siswa Penerima</p>
                <p class="font-bold text-slate-900 text-base mt-1">{{ $settlement->seller->name }}</p>
                <p class="mt-0.5">Kelas: {{ $settlement->seller->class }}</p>
                <p>HP: {{ $settlement->seller->phone ?? '-' }}</p>
            </div>
            <div class="text-right">
                <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Metadata Pembayaran</p>
                <p class="font-bold text-slate-900 mt-1">#SET-{{ str_pad($settlement->id, 4, '0', STR_PAD_LEFT) }}</p>
                <p class="mt-0.5">Tanggal: {{ $settlement->settlement_date->format('d/m/Y H:i') }}</p>
                <p>Oleh: Admin {{ $settlement->user->name }}</p>
            </div>
        </div>

        <!-- Items Table -->
        <div class="mb-8">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Rincian Barang Terjual</h4>
            <table class="w-full text-xs text-slate-700 font-mono">
                <thead>
                    <tr class="border-b border-slate-200 font-bold text-slate-900 text-left">
                        <th class="pb-2">Nama Produk</th>
                        <th class="pb-2 text-center">Jumlah Terjual</th>
                        <th class="pb-2 text-right">Harga Siswa</th>
                        <th class="pb-2 text-right">Total Uang Siswa</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @foreach($settlement->transactionItems as $item)
                        <tr>
                            <td class="py-3 font-semibold text-slate-950">
                                {{ $item->product->name }}
                                <div class="text-[9px] text-slate-400">Terjual pada {{ $item->created_at->format('d/m/Y') }}</div>
                            </td>
                            <td class="py-3 text-center">{{ $item->quantity }} pcs</td>
                            <td class="py-3 text-right">Rp{{ number_format($item->cost_price, 0, ',', '.') }}</td>
                            <td class="py-3 text-right font-bold text-slate-950">Rp{{ number_format($item->profit_seller, 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- Grand Total and Notes -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
            <div>
                <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Catatan</p>
                <p class="text-xs text-slate-600 mt-1 bg-slate-50 border border-slate-200 rounded-lg p-3 italic">
                    {{ $settlement->notes ?? 'Tidak ada catatan tambahan.' }}
                </p>
            </div>
            <div class="flex flex-col justify-end text-right font-mono">
                <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider">TOTAL UANG DIBAYARKAN</span>
                <span class="text-2xl font-extrabold text-emerald-600 mt-1">
                    Rp{{ number_format($settlement->total_amount, 0, ',', '.') }}
                </span>
            </div>
        </div>

        <!-- Signatures (Visible during print) -->
        <div class="hidden print:grid grid-cols-2 gap-12 mt-16 text-center text-xs font-mono">
            <div>
                <p class="text-slate-500">Penerima (Siswa)</p>
                <div class="h-20"></div>
                <p class="font-bold text-slate-900">({{ $settlement->seller->name }})</p>
            </div>
            <div>
                <p class="text-slate-500">Petugas Kantin</p>
                <div class="h-20"></div>
                <p class="font-bold text-slate-900">({{ $settlement->user->name }})</p>
            </div>
        </div>

    </div>
</div>

<!-- Print Styles -->
<style>
    @media print {
        body * {
            visibility: hidden;
        }
        #settlement-receipt, #settlement-receipt * {
            visibility: visible;
        }
        #settlement-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            padding: 0;
            box-shadow: none;
        }
        .print\:hidden {
            display: none !important;
        }
    }
</style>
@endsection
