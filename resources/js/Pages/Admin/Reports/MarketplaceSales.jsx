import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useDateFilter } from '@/hooks/useDateFilter';
import DateRangeFilter from '@/Components/DateRangeFilter';
import { formatRupiah } from '@/utils/format';

export default function MarketplaceSales({ sales = [], startDate = '', endDate = '', grandTotal = 0 }) {
    const filter = useDateFilter({
        initialStart: startDate,
        initialEnd: endDate,
        onNavigate: (start, end) =>
            router.get(route('admin.reports.marketplace-sales'), { start_date: start, end_date: end }),
    });

    return (
        <AuthenticatedLayout title="Laporan Penjualan Marketplace">
            <Head title="Laporan Penjualan Marketplace" />

            <div className="space-y-6">
                <DateRangeFilter {...filter} />

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Penjualan Marketplace</p>
                    <h3 className="text-2xl font-extrabold text-primary-600 mt-1">{formatRupiah(grandTotal)}</h3>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="text-left px-4 py-3">Mitra</th>
                                <th className="text-right px-4 py-3">Jumlah Pesanan</th>
                                <th className="text-right px-4 py-3">Total Penjualan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sales.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-6 text-slate-400">Tidak ada data untuk periode ini.</td>
                                </tr>
                            ) : (
                                sales.map((row) => (
                                    <tr key={row.vendor_id}>
                                        <td className="px-4 py-3 font-medium text-slate-900">{row.vendor_name}</td>
                                        <td className="px-4 py-3 text-right text-slate-700">{row.order_count}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-primary-600">{formatRupiah(row.total_sales)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
