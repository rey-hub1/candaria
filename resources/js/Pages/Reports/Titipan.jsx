import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useDateFilter } from '@/hooks/useDateFilter';
import DateRangeFilter from '@/Components/DateRangeFilter';

const Pagination = ({ links = [] }) => {
    if (links.length <= 3) return null;
    return (
        <div className="flex flex-wrap gap-1 justify-center mt-4">
            {links.map((link, key) =>
                link.url === null ? (
                    <div key={key} className="px-3 py-1.5 text-xs text-slate-400 border border-slate-200 rounded-lg bg-slate-50"
                        dangerouslySetInnerHTML={{ __html: link.label }} />
                ) : (
                    <Link key={key} href={link.url}
                        className={`px-3 py-1.5 text-xs border rounded-lg transition ${
                            link.active
                                ? 'bg-primary-600 border-primary-600 text-white font-bold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }} />
                )
            )}
        </div>
    );
};

export default function Titipan({
    items = { data: [], links: [], total: 0 },
    startDate = '',
    endDate = '',
    summary = { total_qty: 0, total_seller: 0, total_kantin: 0 },
    sellerId = '',
    sellers = [],
}) {
    const filter = useDateFilter({
        initialStart: startDate,
        initialEnd: endDate,
        onNavigate: (start, end) =>
            router.get(route('reports.titipan'), { start_date: start, end_date: end, seller_id: sellerId }),
    });

    const handleSellerChange = (e) => {
        router.get(route('reports.titipan'), { start_date: startDate, end_date: endDate, seller_id: e.target.value });
    };

    const formatRupiah = (value) =>
        'Rp' + new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const padZero = (num, size) => String(num).padStart(size, '0');

    const handleExportExcel = () => {
        window.location.href = route('reports.titipan', { start_date: startDate, end_date: endDate, seller_id: sellerId, export: 'xlsx' });
    };

    const handleExportPdf = () => {
        window.open(route('reports.titipan', { start_date: startDate, end_date: endDate, seller_id: sellerId, export: 'pdf' }), '_blank');
    };

    return (
        <AuthenticatedLayout title="Laporan Titipan Siswa">
            <Head title="Laporan Titipan Siswa" />



            <div className="space-y-6">

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm col-span-2 md:col-span-1">
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Barang Terjual</p>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5 sm:mt-1">{summary.total_qty || 0} pcs</h3>
                        <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">Akumulasi kuantitas terjual</p>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Hasil untuk Siswa</p>
                        <h3 className="text-lg sm:text-2xl font-extrabold text-blue-600 mt-0.5 sm:mt-1">{formatRupiah(summary.total_seller || 0)}</h3>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Keuntungan Kantin</p>
                        <h3 className="text-lg sm:text-2xl font-extrabold text-primary-600 mt-0.5 sm:mt-1">{formatRupiah(summary.total_kantin || 0)}</h3>
                    </div>
                </div>

                <DateRangeFilter
                    {...filter}
                    onExportExcel={handleExportExcel}
                    onExportPdf={handleExportPdf}
                    extra={
                        <div className="relative w-full sm:w-auto">
                            <select
                                value={sellerId || ''}
                                onChange={handleSellerChange}
                                className="w-full sm:w-auto appearance-none pl-2.5 pr-7 py-1.5 text-[11px] font-bold rounded-lg border bg-white text-slate-600 border-slate-200 hover:border-primary-400 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 cursor-pointer transition-all duration-150"
                            >
                                <option value="">Semua Penitip</option>
                                {sellers.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
                                ))}
                            </select>
                            <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                    }
                />

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="report-titipan-table">
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50">
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
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal & Waktu</th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Siswa Penitip</th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Produk</th>
                                        <th className="px-4 sm:px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Terjual</th>
                                        <th className="px-4 sm:px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Sisa Stok</th>
                                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Harga Siswa</th>
                                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Hasil Siswa</th>
                                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Laba Kantin</th>
                                        <th className="px-4 sm:px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Status Bayar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {items.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition">
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                                                {formatDateTime(item.created_at)}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-bold text-slate-950">
                                                {item.product?.seller?.name || '-'} ({item.product?.seller?.class || '-'})
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">
                                                {item.product?.name}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-center font-bold text-slate-700">
                                                {item.quantity} pcs
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-center font-bold text-slate-500">
                                                {item.product?.stock} pcs
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-right text-slate-600">
                                                {formatRupiah(item.cost_price)}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">
                                                {formatRupiah(item.profit_seller)}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-right font-bold text-primary-600">
                                                {formatRupiah(item.profit_kantin)}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-center">
                                                {item.seller_settlement_id ? (
                                                    <Link
                                                        href={route('settlements.show', item.seller_settlement_id)}
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-50 text-primary-700 border border-primary-200 hover:underline"
                                                    >
                                                        Lunas (#SET-{padZero(item.seller_settlement_id, 4)})
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href={route('settlements.index', { pay_seller_id: item.product?.seller_id })}
                                                        className="inline-flex items-center px-3 py-1 rounded text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition shadow-sm"
                                                    >
                                                        Bayar
                                                    </Link>
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
