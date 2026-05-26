@extends('layouts.app')

@section('title', 'Detail Transaksi')

@section('content')
<div class="max-w-2xl mx-auto">
    <!-- Back link (hidden during printing) -->
    <div class="mb-6 print:hidden flex items-center justify-between">
        <a href="{{ route('transactions.create') }}" class="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1">
            &larr; Kembali ke Kasir
        </a>
        <button onclick="window.print()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.617 0-1.11-.474-1.12-1.09L5.87 18M10.5 8.5h3M18 8.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm-6 11.25h.008v.008H12v-.008Zm0-3h.008v.008H12v-.008Zm0-3h.008v.008H12v-.008Zm0-3h.008v.008H12v-.008Z"></path>
            </svg>
            Cetak Struk
        </button>
    </div>

    <!-- Receipt Container -->
    <div class="bg-white p-8 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0" id="receipt">
        
        <!-- Receipt Header -->
        <div class="text-center pb-6 border-b border-dashed border-slate-200">
            <h2 class="text-xl font-extrabold text-slate-900 tracking-wide uppercase">KANTIN SEKOLAH</h2>
            <p class="text-xs text-slate-500 mt-1">SMA NEGERI PEMBANGUNAN</p>
            <p class="text-xs text-slate-400">Jl. Pendidikan No. 45, Surabaya</p>
        </div>

        <!-- Receipt Metadata -->
        <div class="py-4 border-b border-dashed border-slate-200 text-xs text-slate-600 space-y-1.5 font-mono">
            <div class="flex justify-between">
                <span>No. Transaksi :</span>
                <span class="font-bold text-slate-950">{{ $transaction->transaction_code }}</span>
            </div>
            <div class="flex justify-between">
                <span>Tanggal :</span>
                <span>{{ $transaction->created_at->format('d/m/Y H:i:s') }}</span>
            </div>
            <div class="flex justify-between">
                <span>Kasir :</span>
                <span>{{ $transaction->user->name }}</span>
            </div>
        </div>

        <!-- Items Table -->
        <div class="py-4 border-b border-dashed border-slate-200">
            <table class="w-full text-xs text-slate-700 font-mono">
                <thead>
                    <tr class="border-b border-slate-100 font-bold text-slate-900 pb-2">
                        <th class="text-left pb-2">Item</th>
                        <th class="text-center pb-2">Qty</th>
                        <th class="text-right pb-2">Harga</th>
                        <th class="text-right pb-2">Subtotal</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @foreach($transaction->items as $item)
                        <tr>
                            <td class="py-2.5">
                                <span class="font-bold text-slate-950">{{ $item->product->name }}</span>
                                @if($item->product->type === 'siswa')
                                    <span class="text-[9px] px-1 bg-orange-50 text-orange-700 rounded font-semibold ml-1">Siswa</span>
                                @endif
                            </td>
                            <td class="text-center py-2.5">{{ $item->quantity }}</td>
                            <td class="text-right py-2.5">Rp{{ number_format($item->selling_price, 0, ',', '.') }}</td>
                            <td class="text-right py-2.5 font-bold text-slate-950">Rp{{ number_format($item->selling_price * $item->quantity, 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- Financial Summary -->
        <div class="py-4 space-y-1.5 text-xs text-slate-700 font-mono">
            <div class="flex justify-between text-sm font-extrabold text-slate-900">
                <span>TOTAL BELANJA :</span>
                <span>Rp{{ number_format($transaction->total_amount, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between">
                <span>TUNAI / BAYAR :</span>
                <span>Rp{{ number_format($transaction->paid_amount, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between font-bold text-emerald-600">
                <span>KEMBALIAN :</span>
                <span>Rp{{ number_format($transaction->change_amount, 0, ',', '.') }}</span>
            </div>
        </div>

        <!-- Footer / Greetings -->
        <div class="pt-6 border-t border-dashed border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
            <p class="font-semibold text-slate-500">Terima Kasih Atas Kunjungan Anda!</p>
            <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
        </div>

    </div>
</div>

<!-- Print Styles -->
<style>
    @media print {
        /* Hide everything else */
        body * {
            visibility: hidden;
        }
        /* Show receipt only */
        #receipt, #receipt * {
            visibility: visible;
        }
        /* Style receipt for single paper */
        #receipt {
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
