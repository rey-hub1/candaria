import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { useDialog } from '@/hooks/useDialog';
import { ClipboardList, Package, Leaf, Trash2, AlertTriangle } from 'lucide-react';

const MODES = [
    {
        level: 'v1',
        label: 'Data Asli V1',
        icon: <ClipboardList className="w-6 h-6 text-emerald-600" />,
        desc: 'Data konsinyasi nyata 3 hari (Senin–Rabu) dari rekap penjualan. Tanggal otomatis menyesuaikan minggu lalu. Tanpa data marketplace.',
        accent: 'border-emerald-300 bg-emerald-50',
    },
    {
        level: 'full',
        label: 'Banyak',
        icon: <Package className="w-6 h-6 text-primary-600" />,
        desc: 'Data demo lengkap: banyak penitip, produk, transaksi ~2 minggu, beberapa mitra + menu, beberapa siswa & pesanan.',
        accent: 'border-primary-300 bg-primary-50',
    },
    {
        level: 'minimal',
        label: 'Sedikit',
        icon: <Leaf className="w-6 h-6 text-amber-600" />,
        desc: 'Data secukupnya untuk coba-coba: sedikit penitip, produk, transaksi, 1 mitra, 2 siswa, 1 pesanan per siswa.',
        accent: 'border-amber-300 bg-amber-50',
    },
    {
        level: 'none',
        label: 'Kosong',
        icon: <Trash2 className="w-6 h-6 text-rose-500" />,
        desc: 'Hapus semua data demo. Hanya akun login inti, feature flag, margin, dan kategori yang dipertahankan.',
        accent: 'border-rose-300 bg-rose-50',
    },
];

const LABELS = { v1: 'Data Asli V1', full: 'Banyak', minimal: 'Sedikit', none: 'Kosong' };

export default function DemoData({ currentLevel, counts }) {
    const { dialog, confirm: openConfirm, dialogConfirm, dialogClose } = useDialog();
    const [processing, setProcessing] = useState(false);

    const apply = (mode) => {
        openConfirm(
            {
                message: `Atur data demo ke mode "${mode.label}"? Ini akan MENGHAPUS semua data demo lama (transaksi, produk, mitra, pesanan, dll) lalu mengisi ulang. Akun login inti tetap aman.`,
            },
            () => {
                setProcessing(true);
                router.post(route('super-admin.demo-data.apply'), { level: mode.level }, {
                    onFinish: () => setProcessing(false),
                });
            }
        );
    };

    return (
        <AuthenticatedLayout title="Data Demo">
            <Head title="Data Demo" />

            <div className="max-w-3xl mx-auto py-6 px-4">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-900">Data Demo</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Isi ulang database dengan data contoh dalam jumlah tertentu, atau kosongkan sama sekali.
                        Berguna untuk demo & pengujian.
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Mode aktif saat ini</span>
                        <span className="text-sm font-bold text-primary-700 bg-primary-50 border border-primary-200 px-3 py-1 rounded-full">
                            {LABELS[currentLevel] || currentLevel}
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                        {[
                            ['Produk', counts.products],
                            ['Penitip', counts.sellers],
                            ['Transaksi', counts.transactions],
                            ['Mitra', counts.vendors],
                            ['Siswa', counts.students],
                            ['Pesanan', counts.orders],
                        ].map(([label, value]) => (
                            <div key={label} className="bg-slate-50 rounded-lg py-2">
                                <p className="text-lg font-bold text-slate-900">{value}</p>
                                <p className="text-[11px] text-slate-500">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    {MODES.map((mode) => {
                        const active = mode.level === currentLevel;
                        return (
                            <div
                                key={mode.level}
                                className={`rounded-xl border shadow-sm p-4 flex items-start gap-4 ${active ? mode.accent : 'border-slate-200 bg-white'}`}
                            >
                                <span className="shrink-0">{mode.icon}</span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-slate-900">{mode.label}</p>
                                        {active && (
                                            <span className="text-[10px] font-semibold text-primary-700 bg-white border border-primary-200 px-2 py-0.5 rounded-full">
                                                Aktif
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{mode.desc}</p>
                                </div>
                                <button
                                    onClick={() => apply(mode)}
                                    disabled={processing}
                                    className="shrink-0 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition"
                                >
                                    {processing ? 'Memproses...' : 'Terapkan'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <p className="text-xs text-slate-400 mt-6 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500 mt-0.5" />
                    Setiap penerapan menghapus data demo lama lebih dulu. Akun login (admin, kasir, pembina),
                    feature flag, aturan margin, dan kategori selalu dipertahankan.
                </p>
            </div>

            <ConfirmModal {...dialog} onConfirm={dialogConfirm} onClose={dialogClose} />
        </AuthenticatedLayout>
    );
}
