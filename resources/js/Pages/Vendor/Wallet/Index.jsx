import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import { formatRupiah } from '@/utils/format';

const TYPE_LABEL = {
    credit: 'Masuk',
    debit: 'Pencairan',
    adjustment: 'Penyesuaian',
};

const TYPE_COLOR = {
    credit: 'text-primary-600',
    debit: 'text-rose-600',
    adjustment: 'text-amber-600',
};

export default function Index({ balance, ledgers }) {
    const data = ledgers.data || [];

    return (
        <AuthenticatedLayout title="Saldo">
            <Head title="Saldo" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Saldo Saya</h1>
                <p className="text-sm text-slate-500 mt-1">Riwayat pemasukan dari pesanan & pencairan dana.</p>
            </div>

            <div className="bg-primary-600 rounded-xl shadow-sm p-6 mb-6">
                <p className="text-primary-100 text-sm">Saldo Saat Ini</p>
                <p className="text-white text-3xl font-bold mt-1">{formatRupiah(balance)}</p>
            </div>

            {data.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center text-sm text-slate-500">
                    Belum ada mutasi saldo.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                    {data.map((ledger) => (
                        <div key={ledger.id} className="p-4 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-slate-900">{ledger.description}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{new Date(ledger.created_at).toLocaleString('id-ID')}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className={`text-sm font-bold ${TYPE_COLOR[ledger.type]}`}>
                                    {ledger.type === 'credit' ? '+' : '-'}{formatRupiah(ledger.amount)}
                                </p>
                                <p className="text-xs text-slate-400">{TYPE_LABEL[ledger.type]} · Saldo {formatRupiah(ledger.balance_after)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Pagination links={ledgers.links || []} />
        </AuthenticatedLayout>
    );
}
