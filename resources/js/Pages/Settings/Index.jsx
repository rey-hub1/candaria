import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ settings = {} }) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        admin_whatsapp: settings.admin_whatsapp || '',
        keyboard_default_mode: settings.keyboard_default_mode || 'prefix',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('settings.update'), { preserveScroll: true });
    };

    const waPreview = (data.admin_whatsapp || '').replace(/\D/g, '');

    return (
        <AuthenticatedLayout>
            <Head title="Pengaturan" />

            <div className="max-w-2xl mx-auto py-6 px-4">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-900">Pengaturan</h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola konfigurasi umum aplikasi.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-slate-900 mb-1">Nomor WhatsApp Admin</h2>
                    <p className="text-xs text-slate-500 mb-4">
                        Nomor ini dipakai di landing page dan tombol "Hubungi Penjaga" di dashboard siswa penitip.
                    </p>

                    <label htmlFor="admin_whatsapp" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Nomor WhatsApp
                    </label>
                    <input
                        type="text"
                        id="admin_whatsapp"
                        name="admin_whatsapp"
                        value={data.admin_whatsapp}
                        onChange={(e) => setData('admin_whatsapp', e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="w-full rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                        Awalan 0 otomatis diubah jadi 62. Hasil tersimpan:{' '}
                        <span className="font-mono text-slate-600">
                            {waPreview.startsWith('0') ? '62' + waPreview.slice(1) : waPreview || '-'}
                        </span>
                    </p>
                    {errors.admin_whatsapp && (
                        <p className="text-rose-600 text-xs mt-1">{errors.admin_whatsapp}</p>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-900 mb-1">Mode Default Keyboard Kasir</h2>
                        <p className="text-xs text-slate-500 mb-4">
                            Pilih tampilan awal keyboard saat kasir membuka input pencarian produk.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <label className={`relative flex flex-col gap-2 p-4 rounded-xl border-2 cursor-pointer transition ${data.keyboard_default_mode === 'prefix' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                <input
                                    type="radio"
                                    name="keyboard_default_mode"
                                    value="prefix"
                                    checked={data.keyboard_default_mode === 'prefix'}
                                    onChange={() => setData('keyboard_default_mode', 'prefix')}
                                    className="sr-only"
                                />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-800">Prefix</span>
                                    {data.keyboard_default_mode === 'prefix' && (
                                        <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                                                <path d="M3.5 6.5L5.5 8.5L8.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                            </svg>
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 leading-snug">
                                    Tampilkan tombol prefix kode produk dulu. Cocok untuk kasir yang pakai kode singkat (misal: KT, SB).
                                </p>
                                <div className="mt-1 flex gap-1 flex-wrap">
                                    {['KT','SB','MN'].map(p => (
                                        <span key={p} className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded text-[10px] font-bold font-mono">{p}</span>
                                    ))}
                                    <span className="text-slate-400 text-[10px] self-center">...</span>
                                </div>
                            </label>

                            <label className={`relative flex flex-col gap-2 p-4 rounded-xl border-2 cursor-pointer transition ${data.keyboard_default_mode === 'full' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                <input
                                    type="radio"
                                    name="keyboard_default_mode"
                                    value="full"
                                    checked={data.keyboard_default_mode === 'full'}
                                    onChange={() => setData('keyboard_default_mode', 'full')}
                                    className="sr-only"
                                />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-800">Lengkap</span>
                                    {data.keyboard_default_mode === 'full' && (
                                        <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                                                <path d="M3.5 6.5L5.5 8.5L8.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                            </svg>
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 leading-snug">
                                    Tampilkan keyboard QWERTY penuh langsung. Cocok untuk kasir yang ketik nama produk bebas.
                                </p>
                                <div className="mt-1 flex gap-0.5 flex-wrap">
                                    {['Q','W','E','R','T','Y'].map(k => (
                                        <span key={k} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold font-mono border border-slate-200">{k}</span>
                                    ))}
                                    <span className="text-slate-400 text-[10px] self-center">...</span>
                                </div>
                            </label>
                        </div>
                        {errors.keyboard_default_mode && (
                            <p className="text-rose-600 text-xs mt-1">{errors.keyboard_default_mode}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 mt-6">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
                        >
                            Simpan
                        </button>
                        {recentlySuccessful && (
                            <span className="text-emerald-600 text-sm font-medium">Tersimpan.</span>
                        )}
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
