import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Error({ status }) {
    const title = {
        503: 'Layanan Tidak Tersedia',
        500: 'Terjadi Kesalahan Server',
        404: 'Halaman Tidak Ditemukan',
        403: 'Akses Ditolak',
    }[status] || 'Terjadi Kesalahan';

    const description = {
        503: 'Maaf, layanan sedang dalam perbaikan. Silakan coba beberapa saat lagi.',
        500: 'Whoops, ada sesuatu yang salah di server kami. Teknisi sedang memperbaikinya.',
        404: 'Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin tautannya salah atau halaman telah dihapus.',
        403: 'Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.',
    }[status] || 'Whoops, sesuatu yang tidak terduga terjadi pada sistem.';

    const illustration = {
        404: (
            <svg className="w-48 h-48 mx-auto text-primary-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M10 10l2 2m0 0l2-2m-2 2l-2 2" />
            </svg>
        ),
        403: (
            <svg className="w-48 h-48 mx-auto text-rose-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
        500: (
            <svg className="w-48 h-48 mx-auto text-amber-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    }[status] || (
        <svg className="w-48 h-48 mx-auto text-slate-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
            <Head title={title} />
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 text-center border border-slate-100">
                <div className="mb-8">
                    {illustration}
                </div>
                
                <h1 className="text-8xl font-black text-slate-900 mb-4 tracking-tighter">
                    {status}
                </h1>
                
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
                    {title}
                </h2>
                
                <p className="text-slate-500 mb-10 max-w-lg mx-auto">
                    {description}
                </p>

                <div className="flex justify-center gap-4">
                    <button 
                        onClick={() => window.history.back()}
                        className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                    >
                        Kembali
                    </button>
                    <Link 
                        href="/"
                        className="px-6 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-500/30"
                    >
                        Ke Halaman Utama
                    </Link>
                    {status === 404 && (
                        <Link 
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="px-6 py-3 rounded-xl bg-rose-100 text-rose-700 font-bold hover:bg-rose-200 transition"
                        >
                            Keluar
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
