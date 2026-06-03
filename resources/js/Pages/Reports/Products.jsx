import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Products({ topProductsKantin = [], topProductsSiswa = [], lowStockProductsKantin = [], lowStockProductsSiswa = [] }) {
    const handleExportExcel = () => {
        window.location.href = route('reports.products', { export: 'xlsx' });
    };

    const handleExportPdf = () => {
        window.open(route('reports.products', { export: 'pdf' }), '_blank');
    };

    const TopProductsTable = ({ title, products, typeColor }) => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded font-bold border ${typeColor}`}>15 Teratas</span>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">
                    Belum ada data penjualan produk.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-16">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Produk</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori & Jenis</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Total Terjual</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {products.map((p, index) => (
                                <tr key={p.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-slate-500">
                                        {index === 0 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs">1</span>}
                                        {index === 1 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs">2</span>}
                                        {index === 2 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-xs">3</span>}
                                        {index > 2 && `#${index + 1}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-slate-950">{p.name}</div>
                                        <div className="text-xs text-slate-400 font-mono">{p.code || 'Tanpa Kode'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-xs font-semibold text-slate-600">{p.category?.name}</div>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                                p.type === 'kantin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                                            }`}>
                                                {p.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-slate-900">{p.sold_count} pcs</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const LowStockTable = ({ title, products }) => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-fit">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">Stok &le; 5</span>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">
                    Semua stok produk aman (di atas 5 pcs).
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Produk</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori & Jenis</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Sisa Stok</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {products.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-slate-950">{p.name}</div>
                                        {p.seller && (
                                            <div className="text-[10px] text-slate-500 font-medium">Titipan: {p.seller.name}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-xs font-semibold text-slate-600">{p.category?.name}</div>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                                p.type === 'kantin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                                            }`}>
                                                {p.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                                            {p.stock} pcs
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <Link
                                            href={route('products.index')}
                                            className="inline-flex items-center px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded transition"
                                        >
                                            Tambah Stok
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout title="Laporan Produk Terlaris & Stok">
            <Head title="Laporan Produk Terlaris & Stok" />

            <div className="space-y-6">
                
                {/* Action Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Ringkasan Produk & Stok</h3>
                        <p className="text-xs text-slate-500 mt-1">Daftar produk terlaris dan informasi produk dengan stok kritis.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportExcel}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center gap-1.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"></path>
                            </svg>
                            Ekspor Excel
                        </button>
                        <button
                            onClick={handleExportPdf}
                            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center gap-1.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"></path>
                            </svg>
                            Ekspor PDF
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <TopProductsTable 
                            title="Produk Terlaris Kantin" 
                            products={topProductsKantin} 
                            typeColor="bg-indigo-50 text-indigo-700 border-indigo-200" 
                        />
                        <TopProductsTable 
                            title="Produk Terlaris Siswa" 
                            products={topProductsSiswa} 
                            typeColor="bg-orange-50 text-orange-700 border-orange-200" 
                        />
                    </div>
                    
                    <div className="space-y-6">
                        <LowStockTable 
                            title="Stok Kritis Produk Kantin" 
                            products={lowStockProductsKantin} 
                        />
                        <LowStockTable 
                            title="Stok Kritis Produk Siswa" 
                            products={lowStockProductsSiswa} 
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
