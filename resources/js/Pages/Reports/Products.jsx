import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/utils/format';
import DownloadMenu from '@/Components/DownloadMenu';

const stockTone = (stock) =>
    stock <= 5
        ? 'bg-secondary-100 text-secondary-800 border-secondary-300'
        : 'bg-primary-50 text-primary-700 border-primary-200';

const TypeBadge = ({ type }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
        type === 'kantin' ? 'bg-primary-50 text-primary-700 border border-primary-100' : 'bg-secondary-100 text-secondary-800 border border-secondary-200'
    }`}>
        {type === 'kantin' ? 'Kantin' : 'Titipan'}
    </span>
);

export default function Products({
    allProducts = [],
    topProductsKantin = [],
    topProductsSiswa = [],
    lowStockProductsKantin = [],
    lowStockProductsSiswa = []
}) {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showAllLow, setShowAllLow] = useState(false);

    const handleExportExcel = () => { window.location.href = route('reports.products', { export: 'xlsx' }); };
    const handleExportPdf = () => { window.open(route('reports.products', { export: 'pdf' }), '_blank'); };

    // Pisah "habis" (0) vs "menipis" (1–5); urutkan menipis dulu biar yang masih bisa di-restock paling depan
    const lowStockAll = useMemo(() => {
        const all = [...lowStockProductsKantin, ...lowStockProductsSiswa];
        const habis = all.filter(p => (p.stock || 0) <= 0);
        const menipis = all.filter(p => (p.stock || 0) > 0);
        return { all, habis, menipis, sorted: [...menipis, ...habis] };
    }, [lowStockProductsKantin, lowStockProductsSiswa]);
    const LOW_PREVIEW = 8;

    const filteredProducts = useMemo(() => allProducts.filter(p => {
        const q = search.toLowerCase();
        const matchSearch = p.name.toLowerCase().includes(q) ||
            (p.code || '').toLowerCase().includes(q) ||
            (p.category?.name || '').toLowerCase().includes(q);
        const matchType = filterType === 'all' || p.type === filterType;
        return matchSearch && matchType;
    }), [allProducts, search, filterType]);

    // KPI mirror the rows currently shown so the totals always match the table
    const isFiltered = filterType !== 'all' || search.trim() !== '';
    const stats = useMemo(() => {
        const kantin = filteredProducts.filter(p => p.type === 'kantin').length;
        const titipan = filteredProducts.filter(p => p.type === 'siswa').length;
        const stockUnits = filteredProducts.reduce((s, p) => s + (p.stock || 0), 0);
        const stockValue = filteredProducts.reduce((s, p) => s + (p.stock || 0) * (p.selling_price || 0), 0);
        const totalSold = filteredProducts.reduce((s, p) => s + (p.sold_count || 0), 0);
        const lowStock = filteredProducts.filter(p => (p.stock || 0) <= 5).length;
        return { kantin, titipan, stockUnits, stockValue, totalSold, lowStock };
    }, [filteredProducts]);

    const kpis = [
        {
            label: 'Total Produk', value: filteredProducts.length, unit: '',
            sub: `${stats.kantin} Kantin · ${stats.titipan} Titipan`,
        },
        {
            label: 'Total Stok', value: stats.stockUnits, unit: 'pcs',
            sub: `Nilai ${formatRupiah(stats.stockValue)}`,
        },
        {
            label: 'Stok Kritis', value: stats.lowStock, unit: 'item',
            sub: stats.lowStock > 0 ? 'Perlu restock segera' : 'Semua aman',
        },
        {
            label: 'Total Terjual', value: stats.totalSold, unit: 'pcs',
            sub: isFiltered ? 'Sesuai filter aktif' : 'Akumulasi semua waktu',
        },
    ];

    return (
        <AuthenticatedLayout title="Laporan Produk & Stok">
            <Head title="Laporan Produk & Stok" />

            <style>{`
                @keyframes repUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .rep-up { animation: repUp .45s cubic-bezier(.22,1,.36,1) both; }
            `}</style>

            <div className="space-y-6">

                {/* === KPI STATS === */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                    {kpis.map((k, i) => {
                        const critical = k.label === 'Stok Kritis' && stats.lowStock > 0;
                        return (
                            <div key={k.label} style={{ animationDelay: `${i * 70}ms` }}
                                className={`rep-up p-4 sm:p-6 rounded-xl border shadow-sm ${critical ? 'bg-secondary-50 border-secondary-200' : 'bg-white border-slate-200'}`}>
                                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">{k.label}</p>
                                <h3 className={`text-lg sm:text-2xl font-extrabold mt-0.5 sm:mt-1 ${critical ? 'text-secondary-700' : 'text-slate-900'}`}>
                                    {k.value.toLocaleString('id-ID')}
                                    {k.unit && <span className="text-xs sm:text-sm font-bold text-slate-400 ml-1">{k.unit}</span>}
                                </h3>
                                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 truncate">{k.sub}</p>
                            </div>
                        );
                    })}
                </div>

                {/* === HEADER + EXPORT === */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Laporan Produk & Stok</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{allProducts.length} produk terdaftar dalam inventaris</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <DownloadMenu onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} />
                        </div>
                    </div>

                    {/* Stok Kritis Banner — ringkas + bisa dibuka penuh */}
                    {lowStockAll.all.length > 0 && (
                        <div className="px-5 md:px-6 py-3 bg-secondary-50 border-t border-secondary-200">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span className="text-xs font-bold text-secondary-800 inline-flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                    Stok Kritis (≤5 pcs):
                                </span>
                                {lowStockAll.menipis.length > 0 && (
                                    <span className="text-xs font-semibold text-amber-700">{lowStockAll.menipis.length} menipis</span>
                                )}
                                {lowStockAll.habis.length > 0 && (
                                    <span className="text-xs font-semibold text-rose-700">{lowStockAll.habis.length} habis</span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 items-center mt-2">
                                {(showAllLow ? lowStockAll.sorted : lowStockAll.sorted.slice(0, LOW_PREVIEW)).map(p => (
                                    <span key={p.id} className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-semibold border ${
                                        (p.stock || 0) <= 0 ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white border-secondary-300 text-secondary-800'
                                    }`}>
                                        {p.name}
                                        <span className="font-bold">{p.stock}</span>
                                    </span>
                                ))}
                                {lowStockAll.sorted.length > LOW_PREVIEW && (
                                    <button
                                        onClick={() => setShowAllLow(v => !v)}
                                        className="text-xs font-bold text-secondary-700 underline underline-offset-2 hover:text-secondary-900"
                                    >
                                        {showAllLow ? 'Tutup' : `Lihat semua (${lowStockAll.sorted.length})`}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* === DAFTAR PRODUK === */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 md:px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-col gap-3">
                        <h3 className="text-base font-bold text-slate-900">Daftar Semua Produk & Stok</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            {/* Filter type */}
                            <div className="grid grid-cols-3 sm:flex rounded-lg border border-slate-200 overflow-hidden text-xs font-bold">
                                {[['all', 'Semua'], ['kantin', 'Kantin'], ['siswa', 'Titipan']].map(([val, label]) => (
                                    <button
                                        key={val}
                                        onClick={() => setFilterType(val)}
                                        className={`px-3 py-2 sm:py-1.5 transition ${filterType === val ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            {/* Search */}
                            <div className="relative flex-1 sm:max-w-xs">
                                <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input
                                    type="text"
                                    placeholder="Cari nama / kode / kategori..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 sm:py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm">Tidak ada produk ditemukan.</div>
                    ) : (
                        <>
                            {/* Mobile: Card Stack */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {filteredProducts.map((p) => (
                                    <div key={p.id} className="p-4 space-y-2.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold text-slate-900 truncate">{p.name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.code || '-'}{p.seller ? ` · ${p.seller.name}` : ''}</div>
                                            </div>
                                            <span className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-bold border ${stockTone(p.stock)}`}>
                                                {p.stock} pcs
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <TypeBadge type={p.type} />
                                                <span className="text-[11px] text-slate-500">{p.category?.name || '-'}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold font-mono text-slate-800">{formatRupiah(p.selling_price)}</div>
                                                <div className="text-[10px] text-slate-400">Terjual {p.sold_count} pcs</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop: Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Kode</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Produk</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Jenis</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Stok</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Harga Jual</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Total Terjual</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {filteredProducts.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-50 transition">
                                                <td className="px-4 py-3 whitespace-nowrap text-xs font-mono font-bold text-slate-500">{p.code || '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-slate-900">{p.name}</div>
                                                    {p.seller && <div className="text-[10px] text-slate-400">{p.seller.name}</div>}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">{p.category?.name || '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap"><TypeBadge type={p.type} /></td>
                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${stockTone(p.stock)}`}>
                                                        {p.stock} pcs
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-mono text-slate-700">{formatRupiah(p.selling_price)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-bold text-slate-700">{p.sold_count} pcs</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* === INSIGHT TERLARIS === */}
                <div className="pt-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-8 h-px bg-slate-200 inline-block"></span>
                        Insight Tambahan — Produk Terlaris
                        <span className="flex-1 h-px bg-slate-200 inline-block"></span>
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[
                            { title: 'Terlaris Kantin', products: topProductsKantin },
                            { title: 'Terlaris Titipan Siswa', products: topProductsSiswa }
                        ].map(({ title, products }) => (
                            <div key={title} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-5 md:px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top 15</span>
                                </div>
                                {products.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-sm">Belum ada data penjualan.</div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {products.map((p, i) => (
                                            <div key={p.id} className="px-5 md:px-6 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition">
                                                <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                                                    i === 0 ? 'bg-secondary-200 text-secondary-800'
                                                        : i < 3 ? 'bg-primary-100 text-primary-700'
                                                            : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                    {i + 1}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-sm font-semibold text-slate-900 truncate">{p.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-mono">{p.code}</div>
                                                </div>
                                                <span className="shrink-0 text-sm font-bold text-slate-700">{p.sold_count} <span className="text-[10px] text-slate-400 font-medium">pcs</span></span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
