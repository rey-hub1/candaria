import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Dashboard({ student }) {
    const { features = {} } = usePage().props;

    return (
        <AuthenticatedLayout title="Beranda">
            <Head title="Beranda" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Halo, {student?.name || 'Siswa'} 👋</h1>
                <p className="text-sm text-slate-500 mt-1">
                    {student?.class && <>Kelas {student.class} · </>}
                    NISN {student?.nisn}
                </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-bold text-slate-900 mb-2">Jajan di Mitra Sekolah</h2>
                {features.marketplace ? (
                    <>
                        <p className="text-sm text-slate-500 mb-4">
                            Pesan jajanan dari mitra sekolah, ambil sesuai jadwal antar yang kamu pilih.
                        </p>
                        <Link href={route('student.marketplace.index')} className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition">
                            Lihat Mitra
                        </Link>
                    </>
                ) : (
                    <p className="text-sm text-slate-500">
                        Fitur pemesanan jajanan dari mitra sekolah segera hadir di sini.
                    </p>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
