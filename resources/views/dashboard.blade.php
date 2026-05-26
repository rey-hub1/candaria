@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
    <!-- Welcome Header -->
    <div class="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-lg">
        <div class="max-w-3xl">
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Selamat Datang, {{ Auth::user()->name }}!</h2>
            <p class="mt-2 text-slate-300 text-sm sm:text-base">
                {{ Auth::user()->role === 'admin' ? 'Kelola produk, stok, kategori, penitip, pembayaran, dan pantau laporan penjualan kantin Anda di sini.' : 'Lakukan penjualan dengan cepat dan mudah menggunakan menu Kasir.' }}
            </p>
        </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <!-- Today's Sales Card -->
        <div class="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 p-6 flex items-center gap-4">
            <div class="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5M5.25 7.5h13.5m-12 3h10.5m-12 3h12m-12.75 3h13.5"></path>
                </svg>
            </div>
            <div>
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Penjualan Hari Ini</p>
                <h3 class="text-2xl font-bold text-slate-900 mt-1">Rp{{ number_format($todaySalesTotal, 0, ',', '.') }}</h3>
                <p class="text-xs text-slate-400 mt-1">{{ $todaySalesCount }} Transaksi</p>
            </div>
        </div>

        @if (Auth::user()->role === 'admin')
            <!-- Today's Profit Card -->
            <div class="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 p-6 flex items-center gap-4">
                <div class="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
                    </svg>
                </div>
                <div>
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Keuntungan Kantin Hari Ini</p>
                    <h3 class="text-2xl font-bold text-slate-900 mt-1">Rp{{ number_format($todayProfit, 0, ',', '.') }}</h3>
                    <p class="text-xs text-slate-400 mt-1">Bersih milik kantin</p>
                </div>
            </div>

            <!-- Unpaid Consignments Card -->
            <div class="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 p-6 flex items-center gap-4">
                <div class="p-3 bg-amber-50 rounded-lg text-amber-600">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H3.75A1.125 1.125 0 0 0 2.625 3.375v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-2.25M16.5 7.5l-3.375-3.375m0 0H18v3.375m-9-3.375v12.75"></path>
                    </svg>
                </div>
                <div>
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Uang Siswa Belum Dibayar</p>
                    <h3 class="text-2xl font-bold text-slate-900 mt-1">Rp{{ number_format($pendingSettlementAmount, 0, ',', '.') }}</h3>
                    <p class="text-xs text-amber-600 font-semibold mt-1">
                        <a href="{{ route('settlements.index') }}" class="hover:underline flex items-center gap-1">
                            Bayar Penitip &rarr;
                        </a>
                    </p>
                </div>
            </div>
        @else
            <!-- Cashier Action Card -->
            <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden rounded-xl border border-emerald-200 shadow-sm p-6 flex items-center gap-4">
                <div class="p-3 bg-emerald-500 rounded-lg text-white">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
                    </svg>
                </div>
                <div>
                    <p class="text-sm font-semibold text-emerald-800">Buka Kasir Sekarang</p>
                    <h3 class="text-xs text-emerald-600 mt-1">Mulai melayani pembeli</h3>
                    <a href="{{ route('transactions.create') }}" class="inline-block mt-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition">
                        Buka Kasir &rarr;
                    </a>
                </div>
            </div>
        @endif
    </div>

    @if (Auth::user()->role === 'admin')
        <!-- Admin Stats Detail Row -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
            <div class="bg-white rounded-xl border border-slate-200 p-6">
                <h4 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">Kinerja Bulan Ini</h4>
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <p class="text-xs text-slate-400">Total Omset</p>
                        <p class="text-xl font-bold text-slate-800">Rp{{ number_format($thisMonthSales, 0, ',', '.') }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-400">Total Keuntungan Kantin</p>
                        <p class="text-xl font-bold text-emerald-600">Rp{{ number_format($thisMonthProfit, 0, ',', '.') }}</p>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-6 flex justify-around items-center">
                <div class="text-center">
                    <p class="text-3xl font-extrabold text-slate-800">{{ $totalProducts }}</p>
                    <p class="text-xs text-slate-400 mt-1">Total Produk</p>
                </div>
                <div class="h-12 w-px bg-slate-200"></div>
                <div class="text-center">
                    <p class="text-3xl font-extrabold text-slate-800">{{ $totalSellers }}</p>
                    <p class="text-xs text-slate-400 mt-1">Siswa Penitip</p>
                </div>
            </div>
        </div>

        <!-- Low Stock Alerts -->
        @if ($lowStockProducts->count() > 0)
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
                <div class="flex items-center gap-2 mb-4">
                    <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"></path>
                    </svg>
                    <h3 class="text-base font-bold text-amber-800">Peringatan Stok Hampir Habis!</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-amber-200">
                        <thead>
                            <tr>
                                <th class="px-4 py-2 text-left text-xs font-semibold text-amber-700 uppercase">Kode</th>
                                <th class="px-4 py-2 text-left text-xs font-semibold text-amber-700 uppercase">Produk</th>
                                <th class="px-4 py-2 text-left text-xs font-semibold text-amber-700 uppercase">Kategori</th>
                                <th class="px-4 py-2 text-left text-xs font-semibold text-amber-700 uppercase">Jenis</th>
                                <th class="px-4 py-2 text-center text-xs font-semibold text-amber-700 uppercase">Stok Sisa</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-amber-100">
                            @foreach ($lowStockProducts as $p)
                                <tr>
                                    <td class="px-4 py-2 text-xs font-mono text-amber-800">{{ $p->code ?? '-' }}</td>
                                    <td class="px-4 py-2 text-xs font-semibold text-amber-900">{{ $p->name }}</td>
                                    <td class="px-4 py-2 text-xs text-amber-800">{{ $p->category->name }}</td>
                                    <td class="px-4 py-2 text-xs text-amber-800 capitalize">
                                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold {{ $p->type === 'kantin' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700' }}">
                                            {{ $p->type }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2 text-xs text-center font-bold text-rose-600 bg-rose-50 rounded-lg">{{ $p->stock }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                <div class="mt-3 text-right">
                    <a href="{{ route('products.index') }}" class="text-xs font-bold text-amber-700 hover:underline">
                        Kelola Stok Produk &rarr;
                    </a>
                </div>
            </div>
        @endif
    @endif

    <!-- Recent Transactions -->
    <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-slate-900">Transaksi Terbaru</h3>
            <a href="{{ route('transactions.index') }}" class="text-xs font-semibold text-emerald-600 hover:underline">
                Lihat Semua &rarr;
            </a>
        </div>
        
        @if ($recentTransactions->isEmpty())
            <div class="text-center py-8 text-slate-400 text-sm">
                Belum ada transaksi hari ini.
            </div>
        @else
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100">
                    <thead>
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Kode</th>
                            <th class="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Petugas</th>
                            <th class="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Waktu</th>
                            <th class="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Total Belanja</th>
                            <th class="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @foreach ($recentTransactions as $t)
                            <tr class="hover:bg-slate-50 transition">
                                <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-900 font-mono">{{ $t->transaction_code }}</td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{{ $t->user->name }}</td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{{ $t->created_at->format('d/m/Y H:i') }}</td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-slate-900">Rp{{ number_format($t->total_amount, 0, ',', '.') }}</td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-center">
                                    <a href="{{ route('transactions.show', $t->id) }}" class="inline-flex items-center px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded transition">
                                        Detail / Struk
                                    </a>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </div>
@endsection
