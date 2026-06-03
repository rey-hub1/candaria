import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Titipan({
    items = { data: [], links: [], total: 0 },
    startDate = '',
    endDate = '',
    summary = { total_qty: 0, total_seller: 0, total_kantin: 0 }
}) {
    const [localStartDate, setLocalStartDate] = useState(startDate);
    const [localEndDate, setLocalEndDate] = useState(endDate);

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

    const padZero = (num, size) => {
        let s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('reports.titipan'), {
            start_date: localStartDate,
            end_date: localEndDate
        });
    };

    const handleExportExcel = () => {
        window.location.href = route('reports.titipan', {
            start_date: startDate,
            end_date: endDate,
            export: 'xlsx'
        });
    };

    const handleExportPdf = () => {
        window.open(route('reports.titipan', {
            start_date: startDate,
            end_date: endDate,
            export: 'pdf'
        }), '_blank');
    };

    const Pagination = ({ links = [] }) => {
        if (links.length <= 3) return null;
        return (
            <div className="flex flex-wrap gap-1 justify-center mt-4">
                {links.map((link, key) => (
                    link.url === null ? (
                        <div
                            key={key}
                            className="px-3 py-1.5 text-xs text-slate-400 border border-slate-200 rounded-lg bg-slate-50"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <Link
                            key={key}
                            href={link.url}
                            className={`px-3 py-1.5 text-xs border rounded-lg transition ${
                                link.active
                                    ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )
                ))}
            </div>
        );
    };

    return (
        <AuthenticatedLayout title="Laporan Titipan Siswa">
            <Head title="Laporan Titipan Siswa" />

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
                    #report-titipan-table {
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
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Barang Terjual</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{summary.total_qty || 0} pcs</h3>
                        <p className="text-xs text-slate-400 mt-1">Akumulasi kuantitas terjual</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Hasil untuk Siswa</p>
                        <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{formatRupiah(summary.total_seller || 0)}</h3>
                        <p className="text-xs text-slate-400 mt-1">Total yang harus diserahkan ke penitip</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Keuntungan Kantin (Bagi Hasil Rp500)</p>
                        <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{formatRupiah(summary.total_kantin || 0)}</h3>
                        <p className="text-xs text-emerald-500 font-semibold mt-1">Bersih untuk kantin (Rp500 / barang)</p>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="report-titipan-table">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-base font-bold text-slate-900">Rincian Penjualan Barang Titipan</h3>
                    </div>
                    
                    {items.data.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm">
                            Tidak ada data penjualan barang titipan pada rentang tanggal tersebut.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal & Waktu</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Siswa Penitip</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Produk</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Harga Siswa</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Hasil Siswa</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Laba Kantin</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Status Bayar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {items.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                                                {formatDate(item.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-950">
                                                {item.product?.seller?.name || '-'} ({item.product?.seller?.class || '-'})
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">
                                                {item.product?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-slate-700">
                                                {item.quantity} pcs
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600">
                                                {formatRupiah(item.cost_price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">
                                                {formatRupiah(item.profit_seller)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-emerald-600">
                                                {formatRupiah(item.profit_kantin)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                {item.seller_settlement_id ? (
                                                    <Link
                                                        href={route('settlements.show', item.seller_settlement_id)}
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:underline"
                                                    >
                                                        Lunas (#SET-{padZero(item.seller_settlement_id, 4)})
                                                    </Link>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                        Belum Dibayar
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
                        <Pagination links={items.links} />
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
