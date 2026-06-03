import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Products({
    allProducts = [],
    topProductsKantin = [],
    topProductsSiswa = [],
    lowStockProductsKantin = [],
    lowStockProductsSiswa = []
}) {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');

    const handleExportExcel = () => {
        window.location.href = route('reports.products', { export: 'xlsx' });
    };

    const handleExportPdf = () => {
        window.open(route('reports.products', { export: 'pdf' }), '_blank');
    };

    const formatRupiah = (value) =>
        'Rp' + new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);

    const lowStockAll = [...lowStockProductsKantin, ...lowStockProductsSiswa];

    const filteredProducts = allProducts.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.code || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.category?.name || '').toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'all' || p.type === filterType;
        return matchSearch && matchType;
    });

    return (
        <AuthenticatedLayout title="Laporan Produk & Stok">
            <Head title="Laporan Produk & Stok" />

            <div className="space-y-6">

                {/* Header Action Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Laporan Produk & Stok</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {allProducts.length} produk terdaftar
                                {lowStockAll.length > 0 && (
                                    <span className="ml-2 text-rose-600 font-bold">⚠ {lowStockAll.length} produk stok kritis</span>
                                )}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleExportExcel} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                                Excel
                            </button>
                            <button onClick={handleExportPdf} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                                PDF
                            </button>
                        </div>
                    </div>

                    {/* Stok Kritis Banner */}
                    {lowStockAll.length > 0 && (
                        <div className="px-6 py-3 bg-rose-50 border-t border-rose-100 flex flex-wrap gap-2 items-center">
                            <span className="text-xs font-bold text-rose-700">⚠ Stok Kritis (≤5 pcs):</span>
                            {lowStockAll.map(p => (
                                <span key={p.id} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-white border border-rose-200 text-rose-800 rounded-full font-semibold">
                                    {p.name}
                                    <span className="text-rose-500 font-bold">{p.stock}</span>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* === BAGIAN 1: SEMUA PRODUK (UTAMA) === */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-base font-bold text-slate-900">Daftar Semua Produk & Stok</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Filter type */}
                            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-bold">
                                {[['all','Semua'], ['kantin','Kantin'], ['siswa','Titipan']].map(([val, label]) => (
                                    <button
                                        key={val}
                                        onClick={() => setFilterType(val)}
                                        className={`px-3 py-1.5 transition ${filterType === val ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            {/* Search */}
                            <div className="relative">
                                <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input
                                    type="text"
                                    placeholder="Cari produk..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
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
                                {filteredProducts.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center py-10 text-slate-400 text-sm">Tidak ada produk ditemukan.</td></tr>
                                ) : filteredProducts.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition">
                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-mono font-bold text-slate-500">{p.code || '-'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-bold text-slate-900">{p.name}</div>
                                            {p.seller && <div className="text-[10px] text-slate-400">{p.seller.name}</div>}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">{p.category?.name || '-'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                p.type === 'kantin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                                            }`}>
                                                {p.type === 'kantin' ? 'Kantin' : 'Titipan'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                p.stock <= 5
                                                    ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                                    : p.stock <= 15
                                                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            }`}>
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
                </div>

                {/* === BAGIAN 2: INSIGHT TERLARIS (SEKUNDER) === */}
                <div className="pt-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-8 h-px bg-slate-200 inline-block"></span>
                        Insight Tambahan — Produk Terlaris
                        <span className="flex-1 h-px bg-slate-200 inline-block"></span>
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[
                            { title: 'Terlaris Kantin', products: topProductsKantin, color: 'indigo' },
                            { title: 'Terlaris Titipan Siswa', products: topProductsSiswa, color: 'orange' }
                        ].map(({ title, products, color }) => (
                            <div key={title} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className={`px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between`}>
                                    <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top 15</span>
                                </div>
                                {products.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-sm">Belum ada data penjualan.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-100">
                                            <thead>
                                                <tr className="bg-slate-50">
                                                    <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase w-10">#</th>
                                                    <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">Produk</th>
                                                    <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-400 uppercase">Terjual</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {products.map((p, i) => (
                                                    <tr key={p.id} className="hover:bg-slate-50 transition">
                                                        <td className="px-4 py-2.5 whitespace-nowrap text-xs font-mono text-slate-400">
                                                            {i === 0 && <span className="text-amber-500 font-black">🥇</span>}
                                                            {i === 1 && <span className="text-slate-400 font-black">🥈</span>}
                                                            {i === 2 && <span className="text-orange-600 font-black">🥉</span>}
                                                            {i > 2 && `#${i + 1}`}
                                                        </td>
                                                        <td className="px-4 py-2.5 whitespace-nowrap">
                                                            <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono">{p.code}</div>
                                                        </td>
                                                        <td className="px-4 py-2.5 whitespace-nowrap text-right text-sm font-bold text-slate-700">{p.sold_count} pcs</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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
