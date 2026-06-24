import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/utils/format';
import {
    BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from 'recharts';

/* ---------- small reusable bits ---------- */

const ICONS = {
    sales: 'M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5M5.25 7.5h13.5m-12 3h10.5m-12 3h12m-12.75 3h13.5',
    profit: 'M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    wallet: 'M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3',
    box: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z',
    download: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3',
    wa: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
    warning: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
    chevron: 'M8.25 4.5l7.5 7.5-7.5 7.5',
    cart: 'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z',
    plus: 'M12 4.5v15m7.5-7.5h-15',
    report: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
};

const ACCENTS = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-600', bar: 'bg-primary-600', hover: 'group-hover:bg-primary-100', ring: 'group-hover:text-primary-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-600', hover: 'group-hover:bg-blue-100', ring: 'group-hover:text-blue-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-600', hover: 'group-hover:bg-amber-100', ring: 'group-hover:text-amber-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600', bar: 'bg-green-600', hover: 'group-hover:bg-green-100', ring: 'group-hover:text-green-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', bar: 'bg-rose-600', hover: 'group-hover:bg-rose-100', ring: 'group-hover:text-rose-600' },
};

function Icon({ path, className = 'w-6 h-6' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    );
}

function StatCard({ icon, label, value, sub, accent = 'primary', href, as }) {
    const a = ACCENTS[accent];
    const Comp = href ? Link : (as || 'div');
    const interactive = href ? 'hover:shadow-md hover:-translate-y-0.5' : '';
    return (
        <Comp
            {...(href ? { href } : {})}
            className={`relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 p-5 flex items-center gap-4 group ${interactive}`}
        >
            <div className={`absolute inset-y-0 left-0 w-1 ${a.bar} opacity-70`} />
            <div className={`p-3 rounded-xl ${a.bg} ${a.text} ${a.hover} transition shrink-0`}>
                <Icon path={ICONS[icon]} className="w-7 h-7" />
            </div>
            <div className="min-w-0">
                <p className={`text-[11px] font-semibold text-slate-500 uppercase tracking-wider transition ${a.ring}`}>{label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-0.5 truncate">{value}</h3>
                {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </Comp>
    );
}

function SectionCard({ title, action, children, className = '' }) {
    return (
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 ${className}`}>
            {(title || action) && (
                <div className="flex items-center justify-between mb-4">
                    {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
                    {action}
                </div>
            )}
            {children}
        </div>
    );
}

function QuickAction({ href, icon, label, sub, accent = 'primary' }) {
    const a = ACCENTS[accent];
    return (
        <Link
            href={href}
            className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-300 transition group"
        >
            <div className={`p-2.5 rounded-xl ${a.bg} ${a.text} ${a.hover} transition shrink-0`}>
                <Icon path={ICONS[icon]} className="w-5 h-5" />
            </div>
            <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 group-hover:text-primary-700 transition truncate">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{sub}</p>
            </div>
            <Icon path={ICONS.chevron} className="w-4 h-4 text-slate-300 ml-auto group-hover:text-primary-500 transition shrink-0" />
        </Link>
    );
}

const emptyState = (text) => (
    <div className="text-center py-10 text-slate-400 text-sm">{text}</div>
);

/* ---------- page ---------- */

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
    titipanSoldWeek = 0,
    titipanSoldMonth = 0,
    titipanSoldAll = 0,
    salesChart = [],
    adminTopProducts = [],
    isPenitip = false,
    myProducts = [],
    myEarningsToday = 0,
    myEarningsMonth = 0,
    myPendingSettlement = 0,
    mySettlements = [],
    myLowStockProducts = [],
    mySalesChart = [],
    topProducts = [],
}) {
    const { auth, settings } = usePage().props;
    const waNumber = settings?.admin_whatsapp || '6287898048001';
    const role = auth.user.role;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        const p = (n) => String(n).padStart(2, '0');
        return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
    };

    const todayLabel = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    const chartTooltip = {
        cursor: { fill: '#f1f5f9' },
        contentStyle: { borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px -6px rgb(0 0 0 / 0.18)', fontSize: '12px' },
        labelStyle: { fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' },
    };

    return (
        <AuthenticatedLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* Hero */}
            <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 text-white shadow-xl">
                <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-primary-500/20 blur-3xl" />
                <div className="absolute -right-24 bottom-0 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div className="max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-widest text-primary-300/90">{todayLabel}</p>
                        <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Selamat Datang, {auth.user.name}!
                        </h2>
                        <p className="mt-2 text-slate-300 text-sm sm:text-base">
                            {role === 'admin'
                                ? 'Kelola produk, stok, penitip, pembayaran, dan pantau laporan penjualan kantin Anda di sini.'
                                : role === 'penitip'
                                    ? 'Pantau penjualan titipan, pendapatan, dan riwayat pencairan Anda.'
                                    : 'Lakukan penjualan dengan cepat dan mudah menggunakan menu Kasir.'}
                        </p>
                    </div>
                    {role !== 'penitip' && (
                        <Link
                            href={route('transactions.create')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-bold text-sm rounded-xl shadow-lg hover:bg-slate-100 transition shrink-0"
                        >
                            <Icon path={ICONS.cart} className="w-5 h-5" />
                            Buka Kasir
                        </Link>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                {role !== 'penitip' && (
                    <StatCard
                        href={route('transactions.index')}
                        icon="sales" accent="primary"
                        label="Penjualan Hari Ini"
                        value={formatRupiah(todaySalesTotal || 0)}
                        sub={`${todaySalesCount || 0} Transaksi`}
                    />
                )}

                {role === 'admin' ? (
                    <>
                        <StatCard
                            href={route('reports.sales')}
                            icon="profit" accent="blue"
                            label="Keuntungan Kantin Hari Ini"
                            value={formatRupiah(todayProfit)}
                            sub="Bersih milik kantin"
                        />
                        <StatCard
                            href={route('settlements.index')}
                            icon="wallet" accent="amber"
                            label="Uang Siswa Belum Dibayar"
                            value={formatRupiah(pendingSettlementAmount)}
                            sub="Bayar Penitip →"
                        />
                    </>
                ) : role === 'penitip' ? (
                    <>
                        <StatCard
                            icon="wallet" accent="amber"
                            label="Titipan Belum Dibayar"
                            value={formatRupiah(myPendingSettlement)}
                            sub="Akan dicairkan kantin"
                        />
                        <StatCard
                            icon="profit" accent="blue"
                            label="Pendapatan Bulan Ini"
                            value={formatRupiah(myEarningsMonth)}
                            sub={`Hari ini: ${formatRupiah(myEarningsToday)}`}
                        />
                        <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank" rel="noopener noreferrer"
                            className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 p-5 flex items-center gap-4 group hover:shadow-md hover:-translate-y-0.5"
                        >
                            <div className="absolute inset-y-0 left-0 w-1 bg-green-600 opacity-70" />
                            <div className="p-3 rounded-xl bg-green-50 text-green-600 group-hover:bg-green-100 transition shrink-0">
                                <Icon path={ICONS.wa} className="w-7 h-7" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-green-600 transition">Hubungi Penjaga</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">WhatsApp</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Tap untuk chat →</p>
                            </div>
                        </a>
                    </>
                ) : (
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden rounded-2xl border border-primary-200 shadow-sm p-6 flex items-center gap-4">
                        <div className="p-3 bg-primary-500 rounded-xl text-white">
                            <Icon path={ICONS.plus} className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-primary-800">Buka Kasir Sekarang</p>
                            <h3 className="text-xs text-primary-600 mt-1">Mulai melayani pembeli</h3>
                            <Link href={route('transactions.create')} className="inline-block mt-2 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-lg shadow-sm transition">
                                Buka Kasir →
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* ---------- ADMIN ---------- */}
            {role === 'admin' && (
                <>
                    {/* Quick actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <QuickAction href={route('consignments.index')} icon="box" accent="amber"
                            label="Stok Titipan Harian" sub="Terima & ambil sisa per penitip" />
                        <QuickAction href={route('daily-upload.index')} icon="download" accent="primary"
                            label="Laporan Harian" sub="Download harian & konsyiansi" />
                        <QuickAction href={route('reports.sales')} icon="report" accent="blue"
                            label="Laporan Penjualan" sub="Omset & keuntungan kantin" />
                        <QuickAction href={route('reports.titipan')} icon="box" accent="green"
                            label="Laporan Titipan" sub="Barang titipan terjual" />
                    </div>

                    {/* Chart + month performance */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                        <SectionCard
                            title="Tren Penjualan (7 Hari)"
                            className="lg:col-span-2"
                            action={<span className="text-xs font-semibold text-slate-400">Omset & keuntungan</span>}
                        >
                            {salesChart.length === 0 || salesChart.every((d) => d.omset === 0 && d.profit === 0) ? (
                                emptyState('Belum ada data penjualan 7 hari terakhir.')
                            ) : (
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={salesChart} margin={{ top: 10, right: 8, left: 4, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="gOmset" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={8} />
                                            <YAxis width={52} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `${v / 1000}k`} />
                                            <RechartsTooltip {...chartTooltip} formatter={(v, n) => [formatRupiah(v), n === 'omset' ? 'Omset' : 'Keuntungan']} />
                                            <Legend formatter={(v) => (v === 'omset' ? 'Omset' : 'Keuntungan Kantin')} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                                            <Area type="monotone" dataKey="omset" stroke="#6366f1" strokeWidth={2.5} fill="url(#gOmset)" />
                                            <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} fill="url(#gProfit)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </SectionCard>

                        <div className="space-y-5">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kinerja Bulan Ini</h4>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <p className="text-xs text-slate-400">Total Omset</p>
                                        <p className="text-xl font-bold text-slate-800">{formatRupiah(thisMonthSales)}</p>
                                    </div>
                                    <div className="h-px bg-slate-100" />
                                    <div>
                                        <p className="text-xs text-slate-400">Keuntungan Kantin</p>
                                        <p className="text-xl font-bold text-primary-600">{formatRupiah(thisMonthProfit)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex justify-around items-center">
                                <Link href={route('products.index')} className="text-center group block hover:bg-slate-50 px-4 py-3 rounded-xl transition">
                                    <p className="text-3xl font-extrabold text-slate-800 group-hover:text-primary-600 transition">{totalProducts}</p>
                                    <p className="text-xs text-slate-400 mt-1 group-hover:text-primary-500">Produk →</p>
                                </Link>
                                <div className="h-12 w-px bg-slate-200" />
                                <Link href={route('sellers.index')} className="text-center group block hover:bg-slate-50 px-4 py-3 rounded-xl transition">
                                    <p className="text-3xl font-extrabold text-slate-800 group-hover:text-primary-600 transition">{totalSellers}</p>
                                    <p className="text-xs text-slate-400 mt-1 group-hover:text-primary-500">Penitip →</p>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Top products + titipan terjual */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                        <SectionCard
                            title="Produk Terlaris"
                            action={<Link href={route('reports.products')} className="text-xs font-semibold text-primary-600 hover:underline">Laporan →</Link>}
                        >
                            {adminTopProducts.length === 0 ? emptyState('Belum ada produk terjual.') : (
                                <div className="space-y-2.5">
                                    {adminTopProducts.map((p, i) => (
                                        <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>#{i + 1}</div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-800 text-sm truncate">{p.name}</p>
                                                    <p className="text-xs text-slate-500">Terjual {p.qty} item{p.type ? ` · ${p.type}` : ''}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-primary-600 shrink-0 ml-2">{formatRupiah(p.profit)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        <Link href={route('reports.titipan')} className="block bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-primary-300 hover:shadow-md transition group">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-base font-bold text-slate-900">Barang Titipan Terjual</h3>
                                <span className="text-xs font-semibold text-slate-400 group-hover:text-primary-600 transition">Laporan →</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    ['Minggu Ini', titipanSoldWeek, 'text-slate-800'],
                                    ['Bulan Ini', titipanSoldMonth, 'text-slate-800'],
                                    ['Total', titipanSoldAll, 'text-primary-600'],
                                ].map(([label, val, color]) => (
                                    <div key={label} className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs text-slate-400">{label}</p>
                                        <p className={`text-2xl font-extrabold mt-1 ${color}`}>{val}<span className="text-sm font-semibold text-slate-400"> pcs</span></p>
                                    </div>
                                ))}
                            </div>
                        </Link>
                    </div>

                    {/* Low stock */}
                    {lowStockProducts.length > 0 && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Icon path={ICONS.warning} className="w-5 h-5 text-amber-600" />
                                <h3 className="text-base font-bold text-amber-800">Peringatan Stok Hampir Habis!</h3>
                                <span className="ml-auto text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{lowStockProducts.length} produk</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-amber-200">
                                    <thead>
                                        <tr>
                                            {['Kode', 'Produk', 'Kategori', 'Jenis'].map((h) => (
                                                <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-amber-700 uppercase">{h}</th>
                                            ))}
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
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${p.type === 'kantin' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>{p.type}</span>
                                                </td>
                                                <td className="px-4 py-2 text-xs text-center font-bold text-rose-600"><span className="bg-rose-50 px-2 py-1 rounded-lg">{p.stock}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 text-right">
                                <Link href={route('products.index')} className="text-xs font-bold text-amber-700 hover:underline">Kelola Stok Produk →</Link>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ---------- RECENT TRANSACTIONS (admin + cashier) ---------- */}
            {role !== 'penitip' && (
                <SectionCard
                    title="Transaksi Terbaru"
                    action={<Link href={route('transactions.index')} className="text-xs font-semibold text-primary-600 hover:underline">Lihat Semua →</Link>}
                >
                    {(!recentTransactions || recentTransactions.length === 0) ? (
                        emptyState('Belum ada transaksi hari ini.')
                    ) : (
                        <div className="overflow-x-auto -mx-2">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead>
                                    <tr>
                                        {['Kode', 'Petugas', 'Waktu'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Total Belanja</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentTransactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50 transition">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-900 font-mono">{t.transaction_code}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{t.user?.name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{formatDate(t.created_at)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-slate-900">{formatRupiah(t.total_amount)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                                <Link href={route('transactions.show', t.id)} className="inline-flex items-center px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition">Detail / Struk</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </SectionCard>
            )}

            {/* ---------- PENITIP ---------- */}
            {role === 'penitip' && (
                <div className="space-y-6 mt-2">
                    <div className="flex flex-wrap gap-3 justify-end">
                        <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow transition">
                            <Icon path={ICONS.wa} className="w-4 h-4" /> Hubungi Penjaga
                        </a>
                        <a href={route('penitip.export')} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg shadow transition">
                            <Icon path={ICONS.download} className="w-4 h-4" /> Download Laporan (CSV)
                        </a>
                    </div>

                    {myLowStockProducts.length > 0 && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Icon path={ICONS.warning} className="w-5 h-5 text-amber-600" />
                                <h3 className="text-base font-bold text-amber-800">Stok Hampir Habis!</h3>
                            </div>
                            <p className="text-sm text-amber-700 mb-4">Produk berikut stoknya menipis di kantin. Harap segera siapkan stok baru untuk dititipkan besok.</p>
                            <ul className="space-y-2">
                                {myLowStockProducts.map((p) => (
                                    <li key={p.id} className="flex justify-between items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-amber-100">
                                        <span className="font-semibold text-slate-800">{p.name}</span>
                                        <span className="text-rose-600 font-bold text-sm bg-rose-50 px-2 py-1 rounded">Sisa {p.stock}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <SectionCard title="Grafik Penjualan (7 Hari)">
                            {mySalesChart.length === 0 || mySalesChart.every((i) => i.amount === 0) ? (
                                emptyState('Belum ada data penjualan 7 hari terakhir.')
                            ) : (
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={mySalesChart} margin={{ top: 10, right: 10, left: 4, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                            <YAxis width={52} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `Rp${v / 1000}k`} />
                                            <RechartsTooltip {...chartTooltip} formatter={(v) => [formatRupiah(v), 'Pendapatan']} />
                                            <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </SectionCard>

                        <SectionCard title="Produk Terlaris">
                            {topProducts.length === 0 ? emptyState('Belum ada produk yang terjual.') : (
                                <div className="space-y-3">
                                    {topProducts.map((p, i) => (
                                        <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-600'}`}>#{i + 1}</div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-800 text-sm truncate">{p.name}</p>
                                                    <p className="text-xs text-slate-500">Terjual {p.qty} item</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-primary-600 shrink-0 ml-2">{formatRupiah(p.profit)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <SectionCard title="Status Produk Titipan Saya">
                            {myProducts.length === 0 ? emptyState('Belum ada produk yang dititipkan.') : (
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
                                                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{p.name}</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-primary-600">{formatRupiah(p.cost_price)}</td>
                                                    <td className="px-4 py-3 text-sm text-center font-bold text-slate-900">{p.stock}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </SectionCard>

                        <SectionCard title="Riwayat Pencairan Terakhir">
                            {mySettlements.length === 0 ? emptyState('Belum ada riwayat pencairan dari kantin.') : (
                                <div className="space-y-3">
                                    {mySettlements.map((s) => (
                                        <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{formatDate(s.created_at)}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{s.notes || 'Pencairan dana otomatis'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-primary-600">+{formatRupiah(s.total_amount)}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-bold rounded uppercase">Berhasil</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
