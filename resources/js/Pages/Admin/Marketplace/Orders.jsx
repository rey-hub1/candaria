import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import { formatRupiah } from '@/utils/format';

const STATUS_LABEL = {
    pending: 'Menunggu Konfirmasi',
    confirmed: 'Dikonfirmasi',
    preparing: 'Disiapkan',
    ready: 'Siap Diambil',
    delivered: 'Selesai',
    cancelled: 'Dibatalkan',
};

const STATUS_COLOR = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-sky-100 text-sky-700',
    preparing: 'bg-indigo-100 text-indigo-700',
    ready: 'bg-violet-100 text-violet-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
};

export default function Orders({ orders, vendors, filters }) {
    const data = orders.data || [];

    const updateFilter = (key, value) => {
        router.get(route('admin.marketplace.orders'), { ...filters, [key]: value }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout title="Monitoring Pesanan Marketplace">
            <Head title="Monitoring Pesanan Marketplace" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Monitoring Pesanan Marketplace</h1>
                <p className="text-sm text-slate-500 mt-1">Pantau seluruh pesanan dari semua mitra.</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => updateFilter('date', e.target.value)}
                    className="rounded-lg border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
                <select value={filters.vendor_id} onChange={(e) => updateFilter('vendor_id', e.target.value)} className="rounded-lg border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500">
                    <option value="">Semua Mitra</option>
                    {vendors.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                </select>
                <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} className="rounded-lg border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500">
                    <option value="">Semua Status</option>
                    {Object.entries(STATUS_LABEL).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            {data.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center text-sm text-slate-500">
                    Tidak ada pesanan untuk filter ini.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="text-left px-4 py-3">Kode</th>
                                <th className="text-left px-4 py-3">Mitra</th>
                                <th className="text-left px-4 py-3">Siswa</th>
                                <th className="text-left px-4 py-3">Slot</th>
                                <th className="text-right px-4 py-3">Total</th>
                                <th className="text-left px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-4 py-3 font-medium text-slate-900">{order.order_code}</td>
                                    <td className="px-4 py-3 text-slate-700">{order.vendor?.name}</td>
                                    <td className="px-4 py-3 text-slate-700">{order.student?.name}</td>
                                    <td className="px-4 py-3 text-slate-700">{order.delivery_slot}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">{formatRupiah(order.total)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status]}`}>
                                            {STATUS_LABEL[order.status]}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination links={orders.links || []} />
        </AuthenticatedLayout>
    );
}
