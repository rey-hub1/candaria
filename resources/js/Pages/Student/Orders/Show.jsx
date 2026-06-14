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

const PAYMENT_LABEL = {
    cash: 'Tunai di Tempat',
    qris: 'QRIS',
};

export default function Show({ order }) {
    const cancel = () => {
        if (!window.confirm('Batalkan pesanan ini?')) return;
        router.post(route('student.orders.cancel', order.id));
    };

    return (
        <AuthenticatedLayout title={order.order_code}>
            <Head title={order.order_code} />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">{order.order_code}</h1>
                    <p className="text-sm text-slate-500 mt-1">{order.vendor?.name}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status]}`}>
                    {STATUS_LABEL[order.status]}
                </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
                <h2 className="text-sm font-bold text-slate-900 mb-3">Detail Pesanan</h2>
                <div className="divide-y divide-slate-100">
                    {order.items.map((item) => (
                        <div key={item.id} className="py-2">
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-semibold text-slate-900">{item.qty}x {item.name_snapshot}</p>
                                <p className="text-sm font-semibold text-slate-900 shrink-0">{formatRupiah(item.subtotal)}</p>
                            </div>
                            {item.options.length > 0 && (
                                <p className="text-xs text-slate-500">{item.options.map((o) => o.option_name_snapshot).join(', ')}</p>
                            )}
                            {item.notes && <p className="text-xs text-slate-400 italic">"{item.notes}"</p>}
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-bold text-primary-600">{formatRupiah(order.total)}</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-slate-500">Jadwal Antar</span>
                    <span className="font-semibold text-slate-900">{order.delivery_date} · Jam {order.delivery_slot}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-slate-500">Pembayaran</span>
                    <span className="font-semibold text-slate-900">{PAYMENT_LABEL[order.payment_method]}</span>
                </div>
                {order.notes && (
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500">Catatan</span>
                        <span className="font-semibold text-slate-900 text-right">{order.notes}</span>
                    </div>
                )}
                {order.status === 'cancelled' && order.cancelled_reason && (
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500">Alasan Dibatalkan</span>
                        <span className="font-semibold text-rose-600 text-right">{order.cancelled_reason}</span>
                    </div>
                )}
            </div>

            {order.status_histories?.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
                    <h2 className="text-sm font-bold text-slate-900 mb-3">Riwayat Status</h2>
                    <ul className="space-y-2">
                        {order.status_histories.map((h) => (
                            <li key={h.id} className="flex items-center justify-between text-sm">
                                <span className="text-slate-700">{STATUS_LABEL[h.to_status] ?? h.to_status}</span>
                                <span className="text-xs text-slate-400">{new Date(h.created_at).toLocaleString('id-ID')}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {order.status === 'pending' && (
                <button onClick={cancel} className="w-full px-4 py-3 rounded-lg border border-rose-200 text-rose-600 font-semibold text-sm hover:bg-rose-50">
                    Batalkan Pesanan
                </button>
            )}
        </AuthenticatedLayout>
    );
}
