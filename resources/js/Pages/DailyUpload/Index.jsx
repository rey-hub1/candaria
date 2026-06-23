import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function formatWeekLabel(startStr, endStr) {
    const s = new Date(startStr);
    const e = new Date(endStr);
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
    if (s.getMonth() === e.getMonth()) {
        return `${s.getDate()}–${e.getDate()} ${months[e.getMonth()]} ${e.getFullYear()}`;
    }
    return `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]} ${e.getFullYear()}`;
}

export default function DailyUploadIndex({ weekStart, weekEnd, activeDays, todayHasData }) {
    const [isAfterNoon, setIsAfterNoon] = useState(false);

    useEffect(() => {
        setIsAfterNoon(new Date().getHours() >= 12);
    }, []);

    const showReminder = isAfterNoon && !todayHasData;
    const weekLabel = formatWeekLabel(weekStart, weekEnd);
    const weekParam = weekStart;

    return (
        <AuthenticatedLayout title="Laporan Harian">
            <Head title="Laporan Harian" />

            {/* Reminder jam 12 */}
            {showReminder && (
                <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <div>
                        <p className="text-sm font-bold text-red-700">Belum ada transaksi hari ini!</p>
                        <p className="text-xs text-red-600 mt-0.5">Sudah lewat jam 12 siang — data hari ini belum masuk ke laporan.</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Laporan Harian</h1>
                <p className="text-sm text-slate-500 mt-0.5">Minggu {weekLabel}</p>
            </div>

            {/* Hari aktif */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Hari Aktif Minggu Ini</p>
                {activeDays.length === 0 ? (
                    <p className="text-sm text-slate-400">Belum ada transaksi minggu ini.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {activeDays.map((d) => (
                            <span
                                key={d.date}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                    d.isToday
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-emerald-100 text-emerald-700'
                                }`}
                            >
                                {d.label}
                                {d.isToday && <span className="ml-1 opacity-75">(hari ini)</span>}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Download buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                    href={route('reports.weekly.daily') + '?week=' + weekParam}
                    className="flex items-center gap-4 p-5 bg-white border-2 border-slate-200 hover:border-primary-400 rounded-xl shadow-sm hover:shadow-md transition group"
                >
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition shrink-0">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0112 3c.08 0 .16.002.24.005" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-primary-700 transition">Download Laporan Harian</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">PENJUALAN · PENGELUARAN · KEUANGAN</p>
                        <p className="text-[11px] text-slate-400 mt-1">LAPORAN HARIAN {weekLabel.toUpperCase()}.xlsx</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-primary-400 transition shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                </a>

                <a
                    href={route('reports.weekly.consignment') + '?week=' + weekParam}
                    className="flex items-center gap-4 p-5 bg-white border-2 border-slate-200 hover:border-amber-400 rounded-xl shadow-sm hover:shadow-md transition group"
                >
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-100 transition shrink-0">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 12.75h6m-6 3h6m3-9H15M9 3H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition">Download Laporan Konsyiansi</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">Per penitip · per produk · per hari</p>
                        <p className="text-[11px] text-slate-400 mt-1">LAPORAN KONSYIANSI {weekLabel.toUpperCase()}.xlsx</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-amber-400 transition shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                </a>
            </div>

            {/* Info */}
            <p className="mt-5 text-xs text-slate-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                File accumulate otomatis — tiap hari data baru ditambahkan ke file minggu yang sama. Reset tiap Senin.
            </p>
        </AuthenticatedLayout>
    );
}
