import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import { formatRupiah } from '@/utils/format';

export default function Index({ debts = { data: [], links: [] }, filters = {}, totals = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [payingId, setPayingId] = useState(null);

    const applyFilter = (next) => {
        router.get(route('change-debts.index'), { ...filters, ...next }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const onSearch = (e) => {
        e.preventDefault();
        applyFilter({ search });
    };

    const pay = (id) => {
        if (!confirm('Tandai hutang kembalian ini lunas? Catat sebagai kas keluar.')) return;
        setPayingId(id);
        router.post(route('change-debts.pay', id), {}, {
            preserveScroll: true,
            onFinish: () => setPayingId(null),
        });
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-');

    const Tab = ({ value, label }) => (
        <button
            onClick={() => applyFilter({ status: value })}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filters.status === value ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
            {label}
        </button>
    );

    return (
        <AuthenticatedLayout title="Hutang Kembalian">
            <Head title="Hutang Kembalian" />

            <div className="space-y-5">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Belum Lunas</p>
                        <p className="text-2xl font-extrabold text-amber-900">{formatRupiah(totals.unpaid_amount || 0)}</p>
                    </div>
                    <p className="text-sm text-amber-700">{totals.unpaid_count || 0} hutang</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-2">
                        <Tab value="unpaid" label="Belum Lunas" />
                        <Tab value="paid" label="Lunas" />
                        <Tab value="all" label="Semua" />
                    </div>
                    <form onSubmit={onSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari catatan/nama..."
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500"
                        />
                        <button type="submit" className="rounded-lg bg-slate-800 text-white px-3 py-1.5 text-sm font-medium hover:bg-slate-900">Cari</button>
                    </form>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Tanggal</th>
                                <th className="px-4 py-3 text-left">Catatan Customer</th>
                                <th className="px-4 py-3 text-left">Transaksi</th>
                                <th className="px-4 py-3 text-right">Nominal</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {debts.data.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Tidak ada data.</td></tr>
                            ) : (
                                debts.data.map((d) => (
                                    <tr key={d.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 whitespace-nowrap">{fmtDate(d.date)}</td>
                                        <td className="px-4 py-3">{d.customer_note || <span className="text-slate-400 italic">—</span>}</td>
                                        <td className="px-4 py-3 text-slate-500">{d.transaction?.transaction_code || '-'}</td>
                                        <td className="px-4 py-3 text-right font-semibold">{formatRupiah(d.amount)}</td>
                                        <td className="px-4 py-3 text-center">
                                            {d.status === 'paid' ? (
                                                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                                                    Lunas {d.paid_at ? `· ${fmtDate(d.paid_at)}` : ''}
                                                </span>
                                            ) : (
                                                <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">Belum</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {d.status !== 'paid' && (
                                                <button
                                                    onClick={() => pay(d.id)}
                                                    disabled={payingId === d.id}
                                                    className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                                                >
                                                    {payingId === d.id ? 'Memproses...' : 'Lunaskan'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={debts.links} />
            </div>
        </AuthenticatedLayout>
    );
}
