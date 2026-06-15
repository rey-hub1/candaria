import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useDateFilter, formatDateIndonesian } from '@/hooks/useDateFilter';
import DateRangeFilter from '@/Components/DateRangeFilter';

export default function Sales({
    salesData = [],
    startDate = '',
    endDate = '',
    grandTotalSales = 0,
    grandTotalProfitKantin = 0,
    grandTotalProfitSeller = 0,
}) {
    const filter = useDateFilter({
        initialStart: startDate,
        initialEnd: endDate,
        onNavigate: (start, end) =>
            router.get(route('reports.sales'), { start_date: start, end_date: end }),
    });

    const formatRupiah = (value) =>
        'Rp' + new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

    const handleExportExcel = () => {
        window.location.href = route('reports.sales', { start_date: startDate, end_date: endDate, export: 'xlsx' });
    };

    const handleExportPdf = () => {
        window.open(route('reports.sales', { start_date: startDate, end_date: endDate, export: 'pdf' }), '_blank');
    };

    return (
        <AuthenticatedLayout title="Laporan Penjualan Harian">
            <Head title="Laporan Penjualan Harian" />



            <div className="space-y-6">

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm col-span-2 md:col-span-1">
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Penjualan (Omset)</p>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5 sm:mt-1">{formatRupiah(grandTotalSales)}</h3>
                        <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">Kotor keseluruhan transaksi</p>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Untung Kantin</p>
                        <h3 className="text-lg sm:text-2xl font-extrabold text-primary-600 mt-0.5 sm:mt-1">{formatRupiah(grandTotalProfitKantin)}</h3>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Uang Siswa</p>
                        <h3 className="text-lg sm:text-2xl font-extrabold text-blue-600 mt-0.5 sm:mt-1">{formatRupiah(grandTotalProfitSeller)}</h3>
                    </div>
                </div>

                <DateRangeFilter
                    {...filter}
                    onExportExcel={handleExportExcel}
                    onExportPdf={handleExportPdf}
                />

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="report-sales-table">
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50">
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
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-4 sm:px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah Transaksi</th>
                                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Total Omset</th>
                                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Keuntungan Kantin</th>
                                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Uang Siswa (Titipan)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {salesData.map((data, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition">
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-bold text-slate-900 font-mono">
                                                {formatDateIndonesian(data.date)}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-center font-semibold text-slate-600">
                                                {data.transaction_count}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-right font-extrabold text-slate-900">
                                                {formatRupiah(data.total_sales)}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-right font-bold text-primary-600">
                                                {formatRupiah(data.profit_kantin)}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-right text-blue-600">
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
