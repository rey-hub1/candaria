import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/utils/format';
import { UtensilsCrossed, Receipt, Waves } from 'lucide-react';

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

export default function Dashboard({ student, recentOrders = [], activeOrderCount = 0 }) {
    const { features = {} } = usePage().props;

    return (
        <AuthenticatedLayout title="Beranda">
            <Head title="Beranda" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">Halo, {student?.name || 'Siswa'} <Waves className="w-5 h-5 text-amber-400" /></h1>
                <p className="text-sm text-slate-500 mt-1">
                    {student?.class && <>Kelas {student.class} · </>}
                    NISN {student?.nisn}
                </p>
            </div>

            {features.marketplace ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <Link
                            href={route('student.marketplace.index')}
                            className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-sm p-5 transition flex items-center justify-between"
                        >
                            <div>
                                <p className="text-base font-bold">Jajan Sekarang</p>
                                <p className="text-sm text-white/80 mt-0.5">Pesan dari mitra sekolah</p>
                            </div>
                            <UtensilsCrossed className="w-8 h-8 text-white/80" />
                        </Link>

                        <Link
                            href={route('student.orders.index')}
                            className="bg-white border border-slate-200 hover:border-primary-300 hover:shadow-md text-slate-900 rounded-xl shadow-sm p-5 transition flex items-center justify-between"
                        >
                            <div>
                                <p className="text-base font-bold">Pesanan Saya</p>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    {activeOrderCount > 0 ? `${activeOrderCount} pesanan aktif` : 'Lihat riwayat pesanan'}
                                </p>
                            </div>
                            <Receipt className="w-8 h-8 text-slate-400" />
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold text-slate-900">Pesanan Terakhir</h2>
                            {recentOrders.length > 0 && (
                                <Link href={route('student.orders.index')} className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                                    Lihat semua
                                </Link>
                            )}
                        </div>

                        {recentOrders.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                Belum ada pesanan. Yuk pesan jajanan pertamamu!
                            </p>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {recentOrders.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={route('student.orders.show', order.id)}
                                        className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{order.vendor?.name}</p>
                                            <p className="text-xs text-slate-400">{order.order_code} · Jam {order.delivery_slot}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status]}`}>
                                                {STATUS_LABEL[order.status]}
                                            </span>
                                            <p className="text-sm font-bold text-primary-600 mt-1">{formatRupiah(order.total)}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-sm font-bold text-slate-900 mb-2">Jajan di Mitra Sekolah</h2>
                    <p className="text-sm text-slate-500">
                        Fitur pemesanan jajanan dari mitra sekolah segera hadir di sini.
                    </p>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
