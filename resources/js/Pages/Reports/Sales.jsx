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
    const [activePreset, setActivePreset] = useState(null);

    const formatRupiah = (value) => {
        return 'Rp' + new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatDateIndonesian = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString + 'T00:00:00');
        const day = date.getDate();
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
            'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
        ];
        return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const formatDt = (dt) => {
        const d = new Date(dt);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
    };

    const presets = [
        { key: 'today', label: 'Hari Ini' },
        { key: 'yesterday', label: 'Kemarin' },
        { key: 'last7', label: '7 Hari' },
        { key: 'thisMonth', label: 'Bulan Ini' },
        { key: 'lastMonth', label: 'Bulan Lalu' },
        { key: 'all', label: 'Semua' },
    ];

    const applyPreset = (preset) => {
        setActivePreset(preset);
        const today = new Date();
        let start = new Date();
        let end = new Date();

        if (preset === 'all') {
            setLocalStartDate('');
            setLocalEndDate('');
            router.get(route('reports.sales'), { start_date: '', end_date: '' });
            return;
        }

        switch (preset) {
            case 'today': break;
            case 'yesterday':
                start.setDate(today.getDate() - 1);
                end.setDate(today.getDate() - 1);
                break;
            case 'last7':
                start.setDate(today.getDate() - 6);
                break;
            case 'thisMonth':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case 'lastMonth':
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            default: break;
        }

        const s = formatDt(start);
        const e = formatDt(end);
        setLocalStartDate(s);
        setLocalEndDate(e);
        router.get(route('reports.sales'), { start_date: s, end_date: e });
    };

    const handleStartChange = (val) => {
        setLocalStartDate(val);
        setActivePreset(null);
        router.get(route('reports.sales'), { start_date: val, end_date: localEndDate });
    };

    const handleEndChange = (val) => {
        setLocalEndDate(val);
        setActivePreset(null);
        router.get(route('reports.sales'), { start_date: localStartDate, end_date: val });
    };

    const handleExportExcel = () => {
        window.location.href = route('reports.sales', { start_date: startDate, end_date: endDate, export: 'xlsx' });
    };

    const handleExportPdf = () => {
        window.open(route('reports.sales', { start_date: startDate, end_date: endDate, export: 'pdf' }), '_blank');
    };

    const activeDateLabel = localStartDate && localEndDate
        ? `${formatDateIndonesian(localStartDate)} — ${formatDateIndonesian(localEndDate)}`
        : localStartDate
            ? `Sejak ${formatDateIndonesian(localStartDate)}`
            : 'Semua Waktu';

    return (
        <AuthenticatedLayout title="Laporan Penjualan Harian">
            <Head title="Laporan Penjualan Harian" />

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body { background-color: white !important; }
                    aside, header, form, .print\\:hidden { display: none !important; }
                    main { padding: 0 !important; }
                    #report-sales-table { border: none !important; box-shadow: none !important; }
                }
            ` }} />

            <div className="space-y-6">
                
                {/* Filter Card — redesigned */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm print:hidden overflow-hidden">
                    {/* Header bar */}
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium">Periode Laporan</p>
                                <p className="text-sm font-bold text-slate-800">{activeDateLabel}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={handleExportExcel} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                Excel
                            </button>
                            <button type="button" onClick={handleExportPdf} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                PDF
                            </button>
                            <button type="button" onClick={() => window.print()} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition">
                                🖨 Cetak
                            </button>
                        </div>
                    </div>

                    {/* Preset buttons */}
                    <div className="px-6 py-4 flex flex-wrap gap-2 items-center border-b border-slate-100 bg-slate-50">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Pilih Cepat:</span>
                        {presets.map(p => (
                            <button
                                key={p.key}
                                type="button"
                                onClick={() => applyPreset(p.key)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all duration-150 ${
                                    activePreset === p.key
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-700'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom date range */}
                    <div className="px-6 py-4 flex flex-wrap items-center gap-3">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Atau atur manual:</span>
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                                <label htmlFor="start_date" className="text-xs text-slate-500 font-semibold whitespace-nowrap">Dari</label>
                                <input
                                    type="date"
                                    id="start_date"
                                    value={localStartDate}
                                    onChange={(e) => handleStartChange(e.target.value)}
                                    className="text-sm text-slate-800 font-semibold bg-transparent border-none outline-none cursor-pointer"
                                />
                            </div>
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                                <label htmlFor="end_date" className="text-xs text-slate-500 font-semibold whitespace-nowrap">Sampai</label>
                                <input
                                    type="date"
                                    id="end_date"
                                    value={localEndDate}
                                    onChange={(e) => handleEndChange(e.target.value)}
                                    className="text-sm text-slate-800 font-semibold bg-transparent border-none outline-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
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
