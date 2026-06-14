import React from 'react';
import { Head, Link } from '@inertiajs/react';
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

export default function Index({ orders }) {
    const data = orders.data || [];

    return (
        <AuthenticatedLayout title="Pesanan Saya">
            <Head title="Pesanan Saya" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Pesanan Saya</h1>
                <p className="text-sm text-slate-500 mt-1">Riwayat pesanan jajan kamu.</p>
            </div>

            {data.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center text-sm text-slate-500">
                    Belum ada pesanan.
                </div>
            ) : (
                <div className="space-y-3">
                    {data.map((order) => (
                        <Link
                            key={order.id}
                            href={route('student.orders.show', order.id)}
                            className="block bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-primary-300 transition"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-slate-900 text-sm">{order.order_code}</p>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status]}`}>
                                    {STATUS_LABEL[order.status]}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500">{order.vendor?.name}</p>
                            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                                <span>{order.delivery_date} · Jam {order.delivery_slot}</span>
                                <span className="font-bold text-primary-600 text-sm">{formatRupiah(order.total)}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
