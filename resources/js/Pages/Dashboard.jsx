import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({
    todaySalesCount,
    todaySalesTotal,
    recentTransactions = [],
    totalSellers = 0,
    totalProducts = 0,
    pendingSettlementAmount = 0,
    todayProfit = 0,
    thisMonthSales = 0,
    thisMonthProfit = 0,
    lowStockProducts = [],
    isPenitip = false,
    myProducts = [],
    myEarningsToday = 0,
    myEarningsMonth = 0,
    myPendingSettlement = 0,
    mySettlements = [],
    myLowStockProducts = [],
    mySalesChart = [],
    topProducts = []
}) {
    const { auth } = usePage().props;

    const formatRupiah = (value) => {
        return 'Rp' + new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
        <AuthenticatedLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* Welcome Header */}
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-lg">
                <div className="max-w-3xl">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Selamat Datang, {auth.user.name}!
                    </h2>
                    <p className="mt-2 text-slate-300 text-sm sm:text-base">
                        {auth.user.role === 'admin'
                            ? 'Kelola produk, stok, kategori, penitip, pembayaran, dan pantau laporan penjualan kantin Anda di sini.'
                            : 'Lakukan penjualan dengan cepat dan mudah menggunakan menu Kasir.'}
                    </p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {/* Today's Sales Card */}
                {auth.user.role !== 'penitip' && (
                    <Link href={route('transactions.index')} className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 p-6 flex items-center gap-4 group">
                        <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-100 transition">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5M5.25 7.5h13.5m-12 3h10.5m-12 3h12m-12.75 3h13.5"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-emerald-600 transition">Penjualan Hari Ini</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatRupiah(todaySalesTotal || 0)}</h3>
                            <p className="text-xs text-slate-400 mt-1">{todaySalesCount || 0} Transaksi</p>
                        </div>
                    </Link>
                )}

                {auth.user.role === 'admin' ? (
                    <>
                        {/* Today's Profit Card */}
                        <Link href={route('reports.sales')} className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 p-6 flex items-center gap-4 group">
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition">Keuntungan Kantin Hari Ini</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatRupiah(todayProfit)}</h3>
                                <p className="text-xs text-slate-400 mt-1">Bersih milik kantin</p>
                            </div>
                        </Link>

                        {/* Unpaid Consignments Card */}
                        <Link href={route('settlements.index')} className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 p-6 flex items-center gap-4 group">
                            <div className="p-3 bg-amber-50 rounded-lg text-amber-600 group-hover:bg-amber-100 transition">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H3.75A1.125 1.125 0 0 0 2.625 3.375v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-2.25M16.5 7.5l-3.375-3.375m0 0H18v3.375m-9-3.375v12.75"></path>
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-amber-600 transition">Uang Siswa Belum Dibayar</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatRupiah(pendingSettlementAmount)}</h3>
                                <p className="text-xs text-amber-600 font-semibold mt-1 flex items-center gap-1 group-hover:underline">
                                    Bayar Penitip &rarr;
                                </p>
                            </div>
                        </Link>
                    </>
                ) : auth.user.role === 'penitip' ? (
                    <>
                        <div className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
                            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Titipan Belum Dibayar</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatRupiah(myPendingSettlement)}</h3>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5M5.25 7.5h13.5m-12 3h10.5m-12 3h12m-12.75 3h13.5"></path>
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pendapatan Bulan Ini</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatRupiah(myEarningsMonth)}</h3>
                            </div>
                        </div>

                        <a href="https://wa.me/6287898048001" target="_blank" rel="noopener noreferrer" className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 p-6 flex items-center gap-4 group">
                            <div className="p-3 bg-green-50 rounded-lg text-green-600 group-hover:bg-green-100 transition">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"></path>
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-green-600 transition">Hubungi Penjaga</p>
                                <h3 className="text-lg font-bold text-slate-900 mt-1">WhatsApp Sekarang</h3>
                            </div>
                        </a>
                    </>
                ) : (
                    /* Cashier Action Card */
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden rounded-xl border border-emerald-200 shadow-sm p-6 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500 rounded-lg text-white">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-emerald-800">Buka Kasir Sekarang</p>
                            <h3 className="text-xs text-emerald-600 mt-1">Mulai melayani pembeli</h3>
                            <Link href={route('transactions.create')} className="inline-block mt-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition">
                                Buka Kasir &rarr;
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {auth.user.role === 'admin' && (
                <>
                    {/* Admin Stats Detail Row */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Kinerja Bulan Ini</h4>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <p className="text-xs text-slate-400">Total Omset</p>
                                    <p className="text-xl font-bold text-slate-800">{formatRupiah(thisMonthSales)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Total Keuntungan Kantin</p>
                                    <p className="text-xl font-bold text-emerald-600">{formatRupiah(thisMonthProfit)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-6 flex justify-around items-center">
                            <Link href={route('products.index')} className="text-center group block hover:bg-slate-50 p-4 rounded-xl transition">
                                <p className="text-3xl font-extrabold text-slate-800 group-hover:text-emerald-600 transition">{totalProducts}</p>
                                <p className="text-xs text-slate-400 mt-1 group-hover:text-emerald-500">Total Produk &rarr;</p>
                            </Link>
                            <div className="h-12 w-px bg-slate-200"></div>
                            <Link href={route('sellers.index')} className="text-center group block hover:bg-slate-50 p-4 rounded-xl transition">
                                <p className="text-3xl font-extrabold text-slate-800 group-hover:text-emerald-600 transition">{totalSellers}</p>
                                <p className="text-xs text-slate-400 mt-1 group-hover:text-emerald-500">Siswa Penitip &rarr;</p>
                            </Link>
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    {lowStockProducts.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"></path>
                                </svg>
                                <h3 className="text-base font-bold text-amber-800">Peringatan Stok Hampir Habis!</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-amber-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-amber-700 uppercase">Kode</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-amber-700 uppercase">Produk</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-amber-700 uppercase">Kategori</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-amber-700 uppercase">Jenis</th>
                                            <th className="px-4 py-2 text-center text-xs font-semibold text-amber-700 uppercase">Stok Sisa</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-amber-100">
                                        {lowStockProducts.map((p) => (
                                            <tr key={p.id}>
                                                <td className="px-4 py-2 text-xs font-mono text-amber-800">{p.code ?? '-'}</td>
                                                <td className="px-4 py-2 text-xs font-semibold text-amber-900">{p.name}</td>
                                                <td className="px-4 py-2 text-xs text-amber-800">{p.category?.name}</td>
                                                <td className="px-4 py-2 text-xs text-amber-800 capitalize">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                        p.type === 'kantin' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                        {p.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-xs text-center font-bold text-rose-600 bg-rose-50 rounded-lg">{p.stock}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 text-right">
                                <Link href={route('products.index')} className="text-xs font-bold text-amber-700 hover:underline">
                                    Kelola Stok Produk &rarr;
                                </Link>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Recent Transactions */}
            {auth.user.role !== 'penitip' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-slate-900">Transaksi Terbaru</h3>
                        <Link href={route('transactions.index')} className="text-xs font-semibold text-emerald-600 hover:underline">
                            Lihat Semua &rarr;
                        </Link>
                    </div>
                    
                    {(!recentTransactions || recentTransactions.length === 0) ? (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            Belum ada transaksi hari ini.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Kode</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Petugas</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Waktu</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Total Belanja</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentTransactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50 transition">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-900 font-mono">
                                                {t.transaction_code}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                                {t.user?.name}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                                {formatDate(t.created_at)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-slate-900">
                                                {formatRupiah(t.total_amount)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                                <Link
                                                    href={route('transactions.show', t.id)}
                                                    className="inline-flex items-center px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded transition"
                                                >
                                                    Detail / Struk
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Penitip Products */}
            {auth.user.role === 'penitip' && (
                <div className="space-y-8 mt-8">
                    {/* Action Header */}
                    <div className="flex justify-end">
                        <a href={route('penitip.export')} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg shadow transition">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"></path>
                            </svg>
                            Download Laporan Penjualan (CSV)
                        </a>
                    </div>

                    {/* Low Stock Alerts */}
                    {myLowStockProducts.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"></path>
                                </svg>
                                <h3 className="text-base font-bold text-amber-800">Peringatan Stok Hampir Habis!</h3>
                            </div>
                            <div className="text-sm text-amber-700 mb-4">
                                Produk berikut stoknya menipis di kantin. Harap segera siapkan stok baru untuk dititipkan besok.
                            </div>
                            <ul className="space-y-2">
                                {myLowStockProducts.map(p => (
                                    <li key={p.id} className="flex justify-between items-center bg-white px-4 py-2 rounded shadow-sm border border-amber-100">
                                        <span className="font-semibold text-slate-800">{p.name}</span>
                                        <span className="text-rose-600 font-bold text-sm bg-rose-50 px-2 py-1 rounded">Sisa {p.stock}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Sales Chart */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 mb-4">Grafik Penjualan (7 Hari Terakhir)</h3>
                            {mySalesChart.length === 0 || mySalesChart.every(item => item.amount === 0) ? (
                                <div className="text-center py-10 text-slate-400 text-sm">
                                    Belum ada data penjualan 7 hari terakhir.
                                </div>
                            ) : (
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={mySalesChart.slice().reverse()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `Rp${value / 1000}k`} />
                                            <RechartsTooltip 
                                                cursor={{ fill: '#f1f5f9' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value) => [formatRupiah(value), 'Pendapatan']}
                                                labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                                            />
                                            <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        {/* Top Products */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 mb-4">Produk Terlaris</h3>
                            {topProducts.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    Belum ada produk yang terjual.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {topProducts.map((p, i) => (
                                        <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    #{i + 1}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                                                    <p className="text-xs text-slate-500">Terjual {p.qty} item</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-emerald-600">{formatRupiah(p.profit)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* My Products Table */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 mb-4">Status Produk Titipan Saya</h3>
                            {myProducts.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    Belum ada produk yang dititipkan.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-100">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Produk</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Harga (Modal)</th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Sisa Stok</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {myProducts.map((p) => (
                                                <tr key={p.id} className="hover:bg-slate-50 transition">
                                                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                                                        {p.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-bold text-emerald-600">
                                                        {formatRupiah(p.cost_price)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-center font-bold text-slate-900">
                                                        {p.stock}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Settlement History */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 mb-4">Riwayat Pencairan Terakhir</h3>
                            {mySettlements.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    Belum ada riwayat pencairan dari kantin.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {mySettlements.map((s) => (
                                        <div key={s.id} className="flex items-center justify-between p-3 rounded border border-slate-100 bg-slate-50">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{formatDate(s.created_at)}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{s.notes || 'Pencairan dana otomatis'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-emerald-600">+{formatRupiah(s.total_amount)}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Berhasil</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
