import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/utils/format';

export default function Dashboard({ vendor, stats = {} }) {
    return (
        <AuthenticatedLayout title="Dashboard Mitra">
            <Head title="Dashboard Mitra" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Halo, {vendor?.name || 'Mitra'} 👋</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Status toko: <span className={`font-semibold ${vendor?.is_open ? 'text-primary-600' : 'text-rose-600'}`}>{vendor?.is_open ? 'Buka' : 'Tutup'}</span>
                    {' · '}
                    Status afiliasi: <span className="font-semibold capitalize">{vendor?.status}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Menu</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats.menu_count ?? 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu Aktif</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats.active_menu_count ?? 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{formatRupiah(vendor?.balance || 0)}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-bold text-slate-900 mb-2">Mulai dari sini</h2>
                <p className="text-sm text-slate-500 mb-4">
                    Tambahkan menu jualan kamu lengkap dengan pilihan tambahan (topping, level pedas, dll) supaya siswa bisa langsung pesan.
                </p>
                <Link href={route('vendor.menu.index')} className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-lg shadow-sm transition">
                    Kelola Menu
                </Link>
            </div>
        </AuthenticatedLayout>
    );
}
