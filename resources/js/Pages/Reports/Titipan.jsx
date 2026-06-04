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
                                ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
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
}) {
    const filter = useDateFilter({
        initialStart: startDate,
        initialEnd: endDate,
        onNavigate: (start, end) =>
            router.get(route('reports.titipan'), { start_date: start, end_date: end }),
    });

    const formatRupiah = (value) =>
        'Rp' + new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const padZero = (num, size) => String(num).padStart(size, '0');

    const handleExportExcel = () => {
        window.location.href = route('reports.titipan', { start_date: startDate, end_date: endDate, export: 'xlsx' });
    };

    const handleExportPdf = () => {
        window.open(route('reports.titipan', { start_date: startDate, end_date: endDate, export: 'pdf' }), '_blank');
    };

    return (
        <AuthenticatedLayout title="Laporan Titipan Siswa">
            <Head title="Laporan Titipan Siswa" />

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body { background-color: white !important; }
                    aside, header, form, .print\\:hidden { display: none !important; }
                    main { padding: 0 !important; }
                    #report-titipan-table { border: none !important; box-shadow: none !important; }
                }
            ` }} />

            <div className="space-y-6">

                <DateRangeFilter
                    {...filter}
                    onExportExcel={handleExportExcel}
                    onExportPdf={handleExportPdf}
                    showPrint
                />

                {/* Summary */}
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

                {/* Table */}
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
                                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Terjual</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Sisa Stok</th>
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
                                                {formatDateTime(item.created_at)}
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-slate-500">
                                                {item.product?.stock} pcs
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
