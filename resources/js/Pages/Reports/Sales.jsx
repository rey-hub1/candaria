import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Sales({
    salesData = [],
    startDate = '',
    endDate = '',
    grandTotalSales = 0,
    grandTotalProfitKantin = 0,
    grandTotalProfitSeller = 0
}) {
    const [localStartDate, setLocalStartDate] = useState(startDate);
    const [localEndDate, setLocalEndDate] = useState(endDate);

    const formatRupiah = (value) => {
        return 'Rp' + new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

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
        router.get(route('reports.sales'), {
            start_date: localStartDate,
            end_date: localEndDate
        });
    };

    const handleExportExcel = () => {
        window.location.href = route('reports.sales', {
            start_date: startDate,
            end_date: endDate,
            export: 'xlsx'
        });
    };

    const handleExportPdf = () => {
        window.open(route('reports.sales', {
            start_date: startDate,
            end_date: endDate,
            export: 'pdf'
        }), '_blank');
    };

    return (
        <AuthenticatedLayout title="Laporan Penjualan Harian">
            <Head title="Laporan Penjualan Harian" />

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body {
                        background-color: white !important;
                    }
                    /* Hide sidebar, header, form */
                    aside, header, form, .print\\:hidden {
                        display: none !important;
                    }
                    main {
                        padding: 0 !important;
                    }
                    #report-sales-table {
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
                            <label htmlFor="start_date" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tanggal Mulai</label>
                            <input
                                type="date"
                                name="start_date"
                                id="start_date"
                                required
                                value={localStartDate}
                                onChange={(e) => setLocalStartDate(e.target.value)}
                                className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="end_date" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tanggal Selesai</label>
                            <input
                                type="date"
                                name="end_date"
                                id="end_date"
                                required
                                value={localEndDate}
                                onChange={(e) => setLocalEndDate(e.target.value)}
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
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Penjualan (Omset)</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{formatRupiah(grandTotalSales)}</h3>
                        <p className="text-xs text-slate-400 mt-1">Kotor keseluruhan transaksi</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Keuntungan Kantin</p>
                        <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{formatRupiah(grandTotalProfitKantin)}</h3>
                        <p className="text-xs text-emerald-500 font-semibold mt-1">Bersih untuk kas kantin</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Uang Penitip (Siswa)</p>
                        <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{formatRupiah(grandTotalProfitSeller)}</h3>
                        <p className="text-xs text-slate-400 mt-1">Uang yang dikembalikan ke penitip</p>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="report-sales-table">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-base font-bold text-slate-900">Rincian Penjualan per Tanggal</h3>
                    </div>
                    
                    {salesData.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm">
                            Tidak ada data penjualan pada rentang tanggal tersebut.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah Transaksi</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Total Omset</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Keuntungan Kantin</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Uang Siswa (Titipan)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {salesData.map((data, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 font-mono">
                                                {formatDateIndonesian(data.date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-slate-600">
                                                {data.transaction_count}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-slate-900">
                                                {formatRupiah(data.total_sales)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-emerald-600">
                                                {formatRupiah(data.profit_kantin)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600">
                                                {formatRupiah(data.profit_seller)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
