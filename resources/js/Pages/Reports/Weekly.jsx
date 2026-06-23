import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Weekly({ weekStart, weekEnd, anchor, activeDays = [] }) {
    const formatRange = () => {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const s = new Date(weekStart);
        const e = new Date(weekEnd);
        const f = (d) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
        return `${f(s)} – ${f(e)}`;
    };

    const onPickWeek = (e) => {
        router.get(route('reports.weekly'), { week: e.target.value }, { preserveState: true, preserveScroll: true });
    };

    const download = (name) => {
        window.location.href = route(name, { week: anchor });
    };

    return (
        <AuthenticatedLayout title="Laporan Mingguan">
            <Head title="Laporan Mingguan" />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h1 className="text-lg font-bold text-gray-800">Laporan Mingguan</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Unduh rekap KONSYIANSI &amp; HARIAN untuk satu minggu (Senin–Minggu) dalam format Excel.
                    </p>

                    <div className="mt-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pilih tanggal mana saja dalam minggu yang diinginkan
                        </label>
                        <input
                            type="date"
                            defaultValue={anchor}
                            onChange={onPickWeek}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                        />
                        <p className="text-sm text-gray-600 mt-2">
                            Periode minggu: <span className="font-semibold">{formatRange()}</span>
                        </p>
                    </div>

                    <div className="mt-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Hari dengan aktivitas</p>
                        {activeDays.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">Tidak ada transaksi/titipan pada minggu ini.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {activeDays.map((d) => (
                                    <span key={d.date} className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                                        {d.label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <ReportCard
                        title="Laporan Konsyiansi"
                        desc="Per hari, per seller penitip: stok awal, terjual, jumlah stor, dan laba kantin."
                        onClick={() => download('reports.weekly.consignment')}
                        disabled={activeDays.length === 0}
                    />
                    <ReportCard
                        title="Laporan Harian"
                        desc="3 sheet: Penjualan Harian, Pengeluaran Harian, dan Keuangan Harian."
                        onClick={() => download('reports.weekly.daily')}
                        disabled={activeDays.length === 0}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function ReportCard({ title, desc, onClick, disabled }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col">
            <h2 className="font-semibold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-1 flex-1">{desc}</p>
            <button
                onClick={onClick}
                disabled={disabled}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Unduh Excel (.xlsx)
            </button>
        </div>
    );
}
