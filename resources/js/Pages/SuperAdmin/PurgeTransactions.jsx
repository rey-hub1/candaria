import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { useDialog } from '@/hooks/useDialog';
import { Trash2, AlertTriangle } from 'lucide-react';

const RANGES = [
    { range: '1w', label: '1 minggu', desc: 'Hapus transaksi yang lebih tua dari 1 minggu lalu.' },
    { range: '1m', label: '1 bulan', desc: 'Hapus transaksi yang lebih tua dari 1 bulan lalu.' },
    { range: '3m', label: '3 bulan', desc: 'Hapus transaksi yang lebih tua dari 3 bulan lalu.' },
    { range: '6m', label: '6 bulan', desc: 'Hapus transaksi yang lebih tua dari 6 bulan lalu.' },
    { range: '1y', label: '1 tahun', desc: 'Hapus transaksi yang lebih tua dari 1 tahun lalu.' },
];

export default function PurgeTransactions({ previews, totals }) {
    const { dialog, confirm: openConfirm, dialogConfirm, dialogClose } = useDialog();
    const [processing, setProcessing] = useState(false);

    const purge = (item) => {
        const preview = previews[item.range] || { count: 0, cutoff: '-' };
        openConfirm(
            {
                message: `Hapus PERMANEN ${preview.count} transaksi yang lebih tua dari ${item.label} (sebelum ${preview.cutoff})? Item transaksi ikut terhapus. Buku kas tidak diubah. Tindakan ini TIDAK bisa dibatalkan.`,
            },
            () => {
                setProcessing(true);
                router.delete(route('super-admin.purge-transactions.destroy'), {
                    data: { range: item.range },
                    onFinish: () => setProcessing(false),
                });
            }
        );
    };

    return (
        <AuthenticatedLayout title="Hapus Transaksi Lama">
            <Head title="Hapus Transaksi Lama" />

            <div className="max-w-3xl mx-auto py-6 px-4">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-900">Hapus Transaksi Lama</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Bersihkan arsip dengan menghapus transaksi yang lebih tua dari rentang tertentu.
                        Data transaksi terbaru tetap aman.
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-slate-50 rounded-lg py-2">
                            <p className="text-lg font-bold text-slate-900">{totals.transactions}</p>
                            <p className="text-[11px] text-slate-500">Total Transaksi</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg py-2">
                            <p className="text-lg font-bold text-slate-900">{totals.oldest || '-'}</p>
                            <p className="text-[11px] text-slate-500">Transaksi Terlama</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {RANGES.map((item) => {
                        const preview = previews[item.range] || { count: 0, cutoff: '-' };
                        const empty = preview.count === 0;
                        return (
                            <div
                                key={item.range}
                                className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 flex items-start gap-4"
                            >
                                <Trash2 className="w-6 h-6 shrink-0 text-rose-400" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-slate-900">Lebih tua dari {item.label}</p>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${empty ? 'text-slate-400 bg-slate-50 border-slate-200' : 'text-rose-700 bg-rose-50 border-rose-200'}`}>
                                            {preview.count} transaksi
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                                    <p className="text-[11px] text-slate-400 mt-1">Batas tanggal: sebelum {preview.cutoff}</p>
                                </div>
                                <button
                                    onClick={() => purge(item)}
                                    disabled={processing || empty}
                                    className="shrink-0 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-semibold text-xs rounded-lg transition"
                                >
                                    {processing ? 'Memproses...' : 'Hapus'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <p className="text-xs text-slate-400 mt-6 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500 mt-0.5" />
                    Penghapusan bersifat PERMANEN dan tidak bisa dibatalkan. Transaksi (termasuk yang sudah
                    void) beserta item-nya dihapus dari database. Entri buku kas (Cashbook) tidak diubah.
                </p>
            </div>

            <ConfirmModal {...dialog} onConfirm={dialogConfirm} onClose={dialogClose} />
        </AuthenticatedLayout>
    );
}
