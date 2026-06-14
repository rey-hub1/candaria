import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';

export default function Index({ notifications }) {
    const data = notifications.data || [];
    const hasUnread = data.some((n) => !n.read_at);

    const markAllRead = () => {
        router.post(route('notifications.markAllRead'));
    };

    return (
        <AuthenticatedLayout title="Notifikasi">
            <Head title="Notifikasi" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Notifikasi</h1>
                    <p className="text-sm text-slate-500 mt-1">Pemberitahuan terbaru untuk akun kamu.</p>
                </div>
                {hasUnread && (
                    <button onClick={markAllRead} className="text-xs font-semibold text-emerald-600 hover:underline">
                        Tandai semua dibaca
                    </button>
                )}
            </div>

            {data.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center text-sm text-slate-500">
                    Belum ada notifikasi.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                    {data.map((n) => (
                        <Link
                            key={n.id}
                            href={route('notifications.markRead', n.id)}
                            method="post"
                            as="div"
                            className={`p-4 flex items-start gap-3 cursor-pointer hover:bg-slate-50 ${!n.read_at ? 'bg-emerald-50/50' : ''}`}
                        >
                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.read_at ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{n.data.title}</p>
                                <p className="text-sm text-slate-600">{n.data.message}</p>
                                <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString('id-ID')}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <Pagination links={notifications.links || []} />
        </AuthenticatedLayout>
    );
}
