import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import FilterBar from '@/Components/FilterBar';

const EVENT_STYLES = {
    created:  'bg-emerald-100 text-emerald-700',
    updated:  'bg-amber-100 text-amber-700',
    deleted:  'bg-red-100 text-red-700',
    checkout: 'bg-blue-100 text-blue-700',
    voided:   'bg-rose-100 text-rose-700',
};

const EVENT_LABEL = {
    created:  'Buat',
    updated:  'Ubah',
    deleted:  'Hapus',
    checkout: 'Transaksi',
    voided:   'Pembatalan',
};

export default function Index({ logs = { data: [], links: [] }, filters = {}, events = [] }) {
    const formatDate = (s) => {
        if (!s) return '-';
        const d = new Date(s);
        return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const setEvent = (event) => {
        router.get(route('activity-logs.index'), { ...filters, event: event || undefined }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Log Aktivitas" />

            <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Log Aktivitas</h1>
                    <p className="text-sm text-slate-500">Jejak audit semua perubahan data oleh pengguna.</p>
                </div>

                <FilterBar filters={filters} searchPlaceholder="Cari aktivitas..." showDateFilter={true} />

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setEvent(null)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${!filters.event ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        Semua
                    </button>
                    {events.map((ev) => (
                        <button
                            key={ev}
                            onClick={() => setEvent(ev)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${filters.event === ev ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {EVENT_LABEL[ev] || ev}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Waktu</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Pengguna</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.data.length === 0 && (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">Belum ada aktivitas tercatat.</td></tr>
                                )}
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{formatDate(log.created_at)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-700">
                                            {log.user?.name || 'Sistem'}
                                            {log.user?.role && <span className="ml-1 text-xs text-slate-400">({log.user.role})</span>}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${EVENT_STYLES[log.event] || 'bg-slate-100 text-slate-600'}`}>
                                                {EVENT_LABEL[log.event] || log.event}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{log.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination links={logs.links} />
            </div>
        </AuthenticatedLayout>
    );
}
