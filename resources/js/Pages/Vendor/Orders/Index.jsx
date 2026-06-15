import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
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
    delivered: 'bg-primary-100 text-primary-700',
    cancelled: 'bg-rose-100 text-rose-700',
};

const NEXT_STATUS = {
    pending: { next: 'confirmed', label: 'Konfirmasi' },
    confirmed: { next: 'preparing', label: 'Mulai Siapkan' },
    preparing: { next: 'ready', label: 'Tandai Siap' },
    ready: { next: 'delivered', label: 'Tandai Selesai' },
};

export default function Index({ orders, filters }) {
    const updateFilter = (key, value) => {
        router.get(route('vendor.orders.index'), { ...filters, [key]: value }, { preserveState: true });
    };

    const advance = (order) => {
        const next = NEXT_STATUS[order.status];
        if (!next) return;
        router.put(route('vendor.orders.updateStatus', order.id), { status: next.next });
    };

    const cancelOrder = (order) => {
        const reason = window.prompt('Alasan pembatalan:');
        if (!reason) return;
        router.put(route('vendor.orders.updateStatus', order.id), { status: 'cancelled', cancelled_reason: reason });
    };

    return (
        <AuthenticatedLayout title="Pesanan Masuk">
            <Head title="Pesanan Masuk" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Pesanan Masuk</h1>
                <p className="text-sm text-slate-500 mt-1">Kelola pesanan dari siswa.</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => updateFilter('date', e.target.value)}
                    className="rounded-lg border-slate-200 text-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <select value={filters.slot} onChange={(e) => updateFilter('slot', e.target.value)} className="rounded-lg border-slate-200 text-sm focus:border-primary-500 focus:ring-primary-500">
                    <option value="">Semua Slot</option>
                    <option value="09:00">Jam 09:00</option>
                    <option value="12:00">Jam 12:00</option>
                </select>
                <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} className="rounded-lg border-slate-200 text-sm focus:border-primary-500 focus:ring-primary-500">
                    <option value="">Semua Status</option>
                    {Object.entries(STATUS_LABEL).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center text-sm text-slate-500">
                    Tidak ada pesanan untuk filter ini.
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                            <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-slate-900 text-sm">{order.order_code} · Jam {order.delivery_slot}</p>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status]}`}>
                                    {STATUS_LABEL[order.status]}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mb-2">{order.student?.name}</p>

                            <div className="divide-y divide-slate-100 mb-2">
                                {order.items.map((item) => (
                                    <div key={item.id} className="py-1.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="text-sm text-slate-900">{item.qty}x {item.name_snapshot}</p>
                                            <p className="text-sm text-slate-900 shrink-0">{formatRupiah(item.subtotal)}</p>
                                        </div>
                                        {item.notes && <p className="text-xs text-slate-400 italic">"{item.notes}"</p>}
                                    </div>
                                ))}
                            </div>

                            {order.notes && <p className="text-xs text-slate-400 italic mb-2">Catatan: "{order.notes}"</p>}

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <span className="font-bold text-primary-600 text-sm">{formatRupiah(order.total)}</span>
                                <div className="flex items-center gap-2">
                                    {NEXT_STATUS[order.status] && (
                                        <button onClick={() => advance(order)} className="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold">
                                            {NEXT_STATUS[order.status].label}
                                        </button>
                                    )}
                                    {!['delivered', 'cancelled'].includes(order.status) && (
                                        <button onClick={() => cancelOrder(order)} className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50">
                                            Batalkan
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
