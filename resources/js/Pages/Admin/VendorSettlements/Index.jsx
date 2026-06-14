import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import { formatRupiah } from '@/utils/format';

export default function Index({ vendors, settlements }) {
    const [selectedVendor, setSelectedVendor] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        vendor_id: '',
        amount: '',
        notes: '',
    });

    const openForm = (vendor) => {
        setSelectedVendor(vendor);
        setData({ vendor_id: vendor.id, amount: '', notes: '' });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.vendor-settlements.store'), {
            onSuccess: () => {
                reset();
                setSelectedVendor(null);
            },
        });
    };

    const settlementData = settlements.data || [];

    return (
        <AuthenticatedLayout title="Pencairan Saldo Mitra">
            <Head title="Pencairan Saldo Mitra" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Pencairan Saldo Mitra</h1>
                <p className="text-sm text-slate-500 mt-1">Kelola pencairan saldo untuk mitra/vendor.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100 mb-6">
                {vendors.map((vendor) => (
                    <div key={vendor.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{vendor.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">Saldo: {formatRupiah(vendor.balance)}</p>
                        </div>
                        <button
                            onClick={() => openForm(vendor)}
                            disabled={Number(vendor.balance) <= 0}
                            className="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold"
                        >
                            Cairkan
                        </button>
                    </div>
                ))}
            </div>

            {selectedVendor && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
                    <h2 className="font-semibold text-slate-900 mb-3">Cairkan Saldo: {selectedVendor.name}</h2>
                    <form onSubmit={submit} className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Jumlah</label>
                            <input
                                type="number"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                max={selectedVendor.balance}
                                className="w-full rounded-lg border-slate-200 text-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                            {errors.amount && <p className="text-xs text-rose-600 mt-1">{errors.amount}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Catatan</label>
                            <input
                                type="text"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="w-full rounded-lg border-slate-200 text-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" disabled={processing} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold">
                                Proses Pencairan
                            </button>
                            <button type="button" onClick={() => setSelectedVendor(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50">
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <h2 className="font-semibold text-slate-900 mb-3">Riwayat Pencairan</h2>
            {settlementData.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center text-sm text-slate-500">
                    Belum ada riwayat pencairan.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                    {settlementData.map((settlement) => (
                        <div key={settlement.id} className="p-4 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-slate-900">{settlement.vendor?.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {new Date(settlement.created_at).toLocaleString('id-ID')} · oleh {settlement.creator?.name ?? '-'}
                                </p>
                                {settlement.notes && <p className="text-xs text-slate-400 italic mt-0.5">"{settlement.notes}"</p>}
                            </div>
                            <p className="text-sm font-bold text-rose-600 shrink-0">{formatRupiah(settlement.amount)}</p>
                        </div>
                    ))}
                </div>
            )}

            <Pagination links={settlements.links || []} />
        </AuthenticatedLayout>
    );
}
