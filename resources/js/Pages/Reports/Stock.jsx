import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/utils/format';

export default function Stock({ reportData = [], date = '' }) {
    const [search, setSearch] = useState('');
    const formatDateIndonesian = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = date.getDate();
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        const monthName = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${monthName} ${year}`;
    };

    const handleExportExcel = () => {
        window.location.href = route('reports.stock', { export: 'xlsx', date });
    };

    const handleExportPdf = () => {
        window.open(route('reports.stock', { export: 'pdf', date }), '_blank');
    };

    const handleDateChange = (e) => {
        router.get(route('reports.stock'), { date: e.target.value }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Filter berdasarkan nama produk / pemilik
    const filteredData = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return reportData;
        return reportData.filter(row =>
            (row.product?.name || '').toLowerCase().includes(q) ||
            (row.pemilik || '').toLowerCase().includes(q)
        );
    }, [reportData, search]);

    // Totals mengikuti baris yang sedang tampil
    const totalStokPagi = filteredData.reduce((sum, row) => sum + Number(row.stok_pagi || 0), 0);
    const totalTambahanStok = filteredData.reduce((sum, row) => sum + Number(row.tambahan_stok || 0), 0);
    const totalStok = filteredData.reduce((sum, row) => sum + Number(row.total_stok || 0), 0);
    const totalSisaStok = filteredData.reduce((sum, row) => sum + Number(row.sisa_stok || 0), 0);
    const totalQtySold = filteredData.reduce((sum, row) => sum + Number(row.qty_sold || 0), 0);
    const totalHargaSum = filteredData.reduce((sum, row) => sum + Number(row.total_harga || 0), 0);

    return (
        <AuthenticatedLayout title="Laporan Stok Harian">
            <Head title="Laporan Stok Harian" />

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body {
                        background-color: white !important;
                    }
                    aside, header, form, .print\\:hidden {
                        display: none !important;
                    }
                    main {
                        padding: 0 !important;
                    }
                    #report-stock-table {
                        border: none !important;
                        box-shadow: none !important;
                    }
                }
            ` }} />

            <div className="space-y-6">
                
                {/* Export Actions */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
                    <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <label htmlFor="report-date" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tanggal Laporan</label>
                            <input
                                id="report-date"
                                type="date"
                                value={date}
                                onChange={handleDateChange}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <button
                                type="button"
                                onClick={handleExportExcel}
                                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center gap-1.5"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"></path>
                                </svg>
                                Ekspor Excel
                            </button>
                            <button
                                type="button"
                                onClick={handleExportPdf}
                                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center gap-1.5"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"></path>
                                </svg>
                                Ekspor PDF
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg transition"
                            >
                                Cetak Laporan
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Produk</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{filteredData.length} item</h3>
                        <p className="text-xs text-slate-400 mt-1">{search.trim() ? 'Sesuai pencarian' : 'Jumlah produk terdaftar'}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Terjual hari ini</p>
                        <h3 className="text-2xl font-extrabold text-primary-600 mt-1">{totalQtySold} pcs</h3>
                        <p className="text-xs text-primary-500 font-semibold mt-1">Akumulasi penjualan</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Nilai Penjualan</p>
                        <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{formatRupiah(totalHargaSum)}</h3>
                        <p className="text-xs text-slate-400 mt-1">Kotor omset penjualan hari ini</p>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="report-stock-table">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
                        <h3 className="text-base font-bold text-slate-900">
                            Rincian Stok & Penjualan Tanggal: {formatDateIndonesian(date)}
                        </h3>
                        <div className="relative w-full sm:max-w-xs">
                            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input
                                type="text"
                                placeholder="Cari produk / pemilik..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    {/* Judul khusus cetak (search disembunyikan) */}
                    <h3 className="hidden print:block px-6 py-4 text-base font-bold text-slate-900 border-b border-slate-100">
                        Rincian Stok & Penjualan Tanggal: {formatDateIndonesian(date)}
                    </h3>

                    {filteredData.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm">
                            {search.trim() ? `Tidak ada produk cocok dengan "${search}".` : 'Tidak ada data produk.'}
                        </div>
                    ) : (
                        <>
                        {/* Mobile: kartu */}
                        <div className="md:hidden divide-y divide-slate-100 print:hidden">
                            {filteredData.map((row, index) => (
                                <div key={index} className="p-4 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-slate-900">{row.product?.name}</div>
                                            <span className={`inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                row.product?.type === 'kantin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                                            }`}>{row.pemilik}</span>
                                        </div>
                                        <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold border ${row.sisa_stok <= 5 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-primary-50 text-primary-700 border-primary-200'}`}>
                                            Sisa {row.sisa_stok}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 rounded-lg py-2">
                                        <div><div className="text-sm font-bold text-slate-800">{row.total_stok}</div><div className="text-[10px] text-slate-400">Total Stok</div></div>
                                        <div><div className="text-sm font-bold text-primary-600">{row.qty_sold}</div><div className="text-[10px] text-slate-400">Terjual</div></div>
                                        <div><div className="text-sm font-bold text-slate-900 font-mono">{formatRupiah(row.total_harga)}</div><div className="text-[10px] text-slate-400">Total Harga</div></div>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                                        <span>Pagi {row.stok_pagi} · Masuk {row.tambahan_stok}</span>
                                        <span className="font-mono">Jual {formatRupiah(row.selling_price)}</span>
                                    </div>
                                </div>
                            ))}
                            <div className="p-4 bg-slate-50 flex items-center justify-between text-sm font-bold">
                                <span className="text-slate-900">TOTAL</span>
                                <span className="text-blue-600 font-mono">{formatRupiah(totalHargaSum)}</span>
                            </div>
                        </div>

                        {/* Desktop: tabel */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider w-12">No</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Produk</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Stok Pagi</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Tambahan Masuk</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stok</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Sisa Stok</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Pemilik</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Terjual</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">HPP</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Harga Jual</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Total Harga</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredData.map((row, index) => (
                                        <tr key={index} className="hover:bg-slate-50 transition">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-mono text-slate-600">{index + 1}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{row.product?.name}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-semibold text-slate-600 font-mono">{row.stok_pagi}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-semibold text-slate-600 font-mono">{row.tambahan_stok}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-bold text-slate-700 font-mono">{row.total_stok}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-semibold text-slate-600 font-mono">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${row.sisa_stok <= 5 ? 'bg-rose-50 text-rose-700 border border-rose-100' : ''}`}>
                                                    {row.sisa_stok} pcs
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-medium font-semibold">
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    row.product?.type === 'kantin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                                                }`}>
                                                    {row.pemilik}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-bold text-slate-700 font-mono">{row.qty_sold} pcs</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-mono text-slate-600">{formatRupiah(row.cost_price)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-mono text-slate-600">{formatRupiah(row.selling_price)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-extrabold text-slate-900 font-mono">{formatRupiah(row.total_harga)}</td>
                                        </tr>
                                    ))}
                                    
                                    {/* Total Row */}
                                    <tr className="bg-slate-50 font-bold border-t border-slate-200">
                                        <td colSpan="2" className="px-4 py-4 text-center text-sm font-bold text-slate-900">TOTAL</td>
                                        <td className="px-4 py-4 text-center font-mono text-slate-800 text-sm">{totalStokPagi}</td>
                                        <td className="px-4 py-4 text-center font-mono text-slate-800 text-sm">{totalTambahanStok}</td>
                                        <td className="px-4 py-4 text-center font-mono text-slate-800 text-sm">{totalStok}</td>
                                        <td className="px-4 py-4 text-center font-mono text-slate-800 text-sm">{totalSisaStok}</td>
                                        <td className="px-4 py-4 text-left text-slate-500">-</td>
                                        <td className="px-4 py-4 text-center font-mono text-primary-600 text-sm">{totalQtySold} pcs</td>
                                        <td colSpan="2" className="px-4 py-4 text-center text-slate-500">-</td>
                                        <td className="px-4 py-4 text-right font-mono text-blue-600 text-sm">{formatRupiah(totalHargaSum)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        </>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
