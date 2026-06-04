import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/utils/format';

export default function Stock({ reportData = [], date = '' }) {
    const [localDate, setLocalDate] = useState(date);

    React.useEffect(() => {
        setLocalDate(date);
    }, [date]);


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

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('reports.stock'), { date: localDate });
    };

    const handleExportExcel = () => {
        window.location.href = route('reports.stock', { date, export: 'xlsx' });
    };

    const handleExportPdf = () => {
        window.open(route('reports.stock', { date, export: 'pdf' }), '_blank');
    };

    // Calculate totals
    const totalStokPagi = reportData.reduce((sum, row) => sum + Number(row.stok_pagi || 0), 0);
    const totalTambahanStok = reportData.reduce((sum, row) => sum + Number(row.tambahan_stok || 0), 0);
    const totalStok = reportData.reduce((sum, row) => sum + Number(row.total_stok || 0), 0);
    const totalSisaStok = reportData.reduce((sum, row) => sum + Number(row.sisa_stok || 0), 0);
    const totalQtySold = reportData.reduce((sum, row) => sum + Number(row.qty_sold || 0), 0);
    const totalHargaSum = reportData.reduce((sum, row) => sum + Number(row.total_harga || 0), 0);

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
                
                {/* Filter Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
                    <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-4">
                        <div>
                            <label htmlFor="date" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tanggal Laporan</label>
                            <input
                                type="date"
                                name="date"
                                id="date"
                                required
                                value={localDate}
                                onChange={(e) => setLocalDate(e.target.value)}
                                className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition"
                        >
                            Filter Laporan
                        </button>
                        <div className="flex items-center gap-2 ml-auto">
                            <button
                                type="button"
                                onClick={handleExportExcel}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center gap-1.5"
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
                    </form>
                </div>

                {/* Summary Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Produk</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{reportData.length} item</h3>
                        <p className="text-xs text-slate-400 mt-1">Jumlah produk terdaftar</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Terjual hari ini</p>
                        <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{totalQtySold} pcs</h3>
                        <p className="text-xs text-emerald-500 font-semibold mt-1">Akumulasi penjualan</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Nilai Penjualan</p>
                        <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{formatRupiah(totalHargaSum)}</h3>
                        <p className="text-xs text-slate-400 mt-1">Kotor omset penjualan hari ini</p>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="report-stock-table">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900">
                            Rincian Stok & Penjualan Tanggal: {formatDateIndonesian(date)}
                        </h3>
                    </div>
                    
                    {reportData.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm">
                            Tidak ada data produk.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
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
                                    {reportData.map((row, index) => (
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
                                        <td colspan="2" className="px-4 py-4 text-center text-sm font-bold text-slate-900">TOTAL</td>
                                        <td className="px-4 py-4 text-center font-mono text-slate-800 text-sm">{totalStokPagi}</td>
                                        <td className="px-4 py-4 text-center font-mono text-slate-800 text-sm">{totalTambahanStok}</td>
                                        <td className="px-4 py-4 text-center font-mono text-slate-800 text-sm">{totalStok}</td>
                                        <td className="px-4 py-4 text-center font-mono text-slate-800 text-sm">{totalSisaStok}</td>
                                        <td className="px-4 py-4 text-left text-slate-500">-</td>
                                        <td className="px-4 py-4 text-center font-mono text-emerald-600 text-sm">{totalQtySold} pcs</td>
                                        <td colspan="2" className="px-4 py-4 text-center text-slate-500">-</td>
                                        <td className="px-4 py-4 text-right font-mono text-blue-600 text-sm">{formatRupiah(totalHargaSum)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
