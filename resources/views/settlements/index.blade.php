@extends('layouts.app')

@section('title', 'Pembayaran Penitip')

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6" x-data="{ payModal: false, paySellerId: '', paySellerName: '', payAmount: 0, payNotes: '' }">
    
    <!-- Left Column: Unpaid Consignments (2/3 width) -->
    <div class="lg:col-span-2 flex flex-col gap-4">
        
        <!-- Header panel -->
        <div class="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <h3 class="text-sm md:text-base font-bold text-slate-900">Uang Titipan Belum Dibayar</h3>
            <span class="text-[10px] md:text-xs px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-bold rounded-full">Tarik Tunai Siswa</span>
        </div>

        @if($sellers->where('unpaid_amount', '>', 0)->isEmpty())
            <div class="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
                Semua uang titipan siswa telah lunas dibayarkan!
            </div>
        @else
            <!-- Mobile View: Card Stack (Visible on small screens) -->
            <div class="grid grid-cols-1 gap-3 md:hidden">
                @foreach($sellers as $s)
                    @if($s->unpaid_amount > 0)
                        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-bold text-slate-950 text-sm">{{ $s->name }}</h4>
                                    <span class="text-xs text-slate-500 font-medium">Kelas: {{ $s->class }}</span>
                                </div>
                                <div class="text-right">
                                    <p class="text-[10px] text-slate-400 font-semibold">Tunggakan</p>
                                    <span class="font-extrabold text-amber-600 text-sm">Rp{{ number_format($s->unpaid_amount, 0, ',', '.') }}</span>
                                </div>
                            </div>
                            <button @click="
                                payModal = true;
                                paySellerId = '{{ $s->id }}';
                                paySellerName = '{{ addslashes($s->name) }}';
                                payAmount = '{{ (int)$s->unpaid_amount }}';
                                payNotes = 'Pembayaran titipan untuk {{ addslashes($s->name) }}';
                            " class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-sm">
                                Tandai Sudah Dibayar
                            </button>
                        </div>
                    @endif
                @endforeach
            </div>

            <!-- Desktop View: Table (Visible on medium/large screens) -->
            <div class="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-100">
                        <thead>
                            <tr class="bg-slate-50">
                                <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Siswa</th>
                                <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Kelas</th>
                                <th class="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Uang Belum Dibayar</th>
                                <th class="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 bg-white">
                            @foreach($sellers as $s)
                                @if($s->unpaid_amount > 0)
                                    <tr class="hover:bg-slate-50 transition">
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-950">{{ $s->name }}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ $s->class }}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-amber-600">
                                            Rp{{ number_format($s->unpaid_amount, 0, ',', '.') }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <button @click="
                                                payModal = true;
                                                paySellerId = '{{ $s->id }}';
                                                paySellerName = '{{ addslashes($s->name) }}';
                                                payAmount = '{{ (int)$s->unpaid_amount }}';
                                                payNotes = 'Pembayaran titipan untuk {{ addslashes($s->name) }}';
                                            " class="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-sm">
                                                Tandai Sudah Dibayar
                                            </button>
                                        </td>
                                    </tr>
                                @endif
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        @endif
    </div>

    <!-- Right Column: Quick Stats -->
    <div class="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <h3 class="text-sm md:text-base font-bold text-slate-900 mb-4">Total Tunggakan Penitip</h3>
        <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <p class="text-xs text-amber-700 font-semibold uppercase tracking-wider">Total Uang Siswa</p>
            <h2 class="text-2xl font-extrabold text-amber-800 mt-1">
                Rp{{ number_format($sellers->sum('unpaid_amount'), 0, ',', '.') }}
            </h2>
            <p class="text-[10px] text-amber-600 mt-1.5">Harus segera dibayarkan ke siswa penitip barang.</p>
        </div>
    </div>

    <!-- Bottom Full-Width Column: Settlement Payout History -->
    <div class="lg:col-span-3 flex flex-col gap-4 mt-4">
        
        <div class="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <h3 class="text-sm md:text-base font-bold text-slate-900">Riwayat Pembayaran Penitip</h3>
            <span class="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-full">{{ $settlements->total() }} Transaksi</span>
        </div>

        @if($settlements->isEmpty())
            <div class="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
                Belum ada riwayat pembayaran penitip.
            </div>
        @else
            <!-- Mobile View: Card Stack for History -->
            <div class="grid grid-cols-1 gap-3 md:hidden">
                @foreach($settlements as $set)
                    <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-semibold text-slate-500">#SET-{{ str_pad($set->id, 4, '0', STR_PAD_LEFT) }}</span>
                            <span class="text-[10px] text-slate-400">{{ $set->settlement_date->format('d/m/Y H:i') }}</span>
                        </div>
                        
                        <div class="flex justify-between items-baseline py-1 border-b border-slate-100">
                            <div>
                                <p class="text-[10px] text-slate-400 font-medium">Siswa</p>
                                <h4 class="font-bold text-slate-950 text-sm">{{ $set->seller->name }}</h4>
                            </div>
                            <div class="text-right">
                                <p class="text-[10px] text-slate-400 font-medium">Nominal Paid</p>
                                <span class="font-extrabold text-slate-900 text-sm">Rp{{ number_format($set->total_amount, 0, ',', '.') }}</span>
                            </div>
                        </div>

                        <div class="text-[11px] text-slate-500">
                            Catatan: {{ $set->notes ?? '-' }}
                        </div>

                        <div class="pt-1">
                            <a href="{{ route('settlements.show', $set->id) }}" 
                               class="block w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition">
                                Lihat Rincian
                            </a>
                        </div>
                    </div>
                @endforeach
            </div>

            <!-- Desktop View: Table for History -->
            <div class="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-100">
                        <thead>
                            <tr class="bg-slate-50">
                                <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">ID Pembayaran</th>
                                <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Siswa Penitip</th>
                                <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Pembayar</th>
                                <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                                <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Catatan</th>
                                <th class="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Nominal Bayar</th>
                                <th class="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Detail</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 bg-white">
                            @foreach($settlements as $set)
                                <tr class="hover:bg-slate-50 transition">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-500">#SET-{{ str_pad($set->id, 4, '0', STR_PAD_LEFT) }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-950">{{ $set->seller->name }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ $set->user->name }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ $set->settlement_date->format('d/m/Y H:i') }}</td>
                                    <td class="px-6 py-4 text-sm text-slate-500 truncate max-w-xs">{{ $set->notes ?? '-' }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-slate-900">
                                        Rp{{ number_format($set->total_amount, 0, ',', '.') }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <a href="{{ route('settlements.show', $set->id) }}" 
                                           class="inline-flex items-center px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded transition">
                                            Rincian
                                        </a>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="px-5 py-4 border-t border-slate-100 bg-slate-50">
                {{ $settlements->links() }}
            </div>
        @endif
    </div>

    <!-- Alpine.js Payment Modal Confirmation -->
    <div x-show="payModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4" x-cloak>
        <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100" @click.away="payModal = false">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-bold text-slate-900">Konfirmasi Pembayaran</h3>
                <button @click="payModal = false" class="text-slate-400 hover:text-slate-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form action="{{ route('settlements.store') }}" method="POST">
                @csrf
                <input type="hidden" name="seller_id" :value="paySellerId">
                
                <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 text-sm space-y-1">
                    <div class="flex justify-between">
                        <span class="text-slate-500 font-semibold">Nama Siswa:</span>
                        <span class="font-bold text-slate-950" x-text="paySellerName"></span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-500 font-semibold">Total Dibayar:</span>
                        <span class="font-extrabold text-emerald-600" x-text="'Rp' + new Intl.NumberFormat('id-ID').format(payAmount)"></span>
                    </div>
                </div>

                <div class="mb-5">
                    <label for="notes" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Catatan Pembayaran (Opsional)</label>
                    <textarea name="notes" id="notes" rows="3" x-model="payNotes"
                        class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"></textarea>
                </div>
                
                <div class="flex justify-end gap-2">
                    <button type="button" @click="payModal = false" 
                        class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition">
                        Batal
                    </button>
                    <button type="submit" 
                        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition">
                        Konfirmasi Pembayaran
                    </button>
                </div>
            </form>
        </div>
    </div>

</div>
@endsection
