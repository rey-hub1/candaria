import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Profile({ vendor }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        _method: 'put',
        name: vendor?.name || '',
        description: vendor?.description || '',
        category: vendor?.category || '',
        phone: vendor?.phone || '',
        address: vendor?.address || '',
        is_open: vendor?.is_open ? '1' : '0',
        max_orders_per_slot: vendor?.max_orders_per_slot ?? '',
        logo: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('vendor.profile.update'), { forceFormData: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout title="Profil Toko">
            <Head title="Profil Toko" />

            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-900">Profil Toko</h1>
                    <p className="text-sm text-slate-500 mt-1">Informasi ini ditampilkan ke siswa di halaman jajan.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                    {vendor?.logo_url && (
                        <img src={vendor.logo_url} alt={vendor.name} className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Logo Toko</label>
                        <input type="file" accept="image/*" onChange={(e) => setData('logo', e.target.files[0])}
                            className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                        {errors.logo && <p className="text-rose-600 text-xs mt-1">{errors.logo}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Toko</label>
                        <input type="text" required value={data.name} onChange={(e) => setData('name', e.target.value)}
                            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                        {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                        <input type="text" value={data.category} onChange={(e) => setData('category', e.target.value)}
                            placeholder="Contoh: Makanan Berat, Minuman, Snack"
                            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Deskripsi</label>
                        <textarea rows={3} value={data.description} onChange={(e) => setData('description', e.target.value)}
                            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">No. HP / WA</label>
                        <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)}
                            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Alamat</label>
                        <input type="text" value={data.address} onChange={(e) => setData('address', e.target.value)}
                            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status Toko Hari Ini</label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <input type="radio" name="is_open" value="1" checked={data.is_open === '1'} onChange={(e) => setData('is_open', e.target.value)} className="text-emerald-600 focus:ring-emerald-500" />
                                Buka
                            </label>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <input type="radio" name="is_open" value="0" checked={data.is_open === '0'} onChange={(e) => setData('is_open', e.target.value)} className="text-emerald-600 focus:ring-emerald-500" />
                                Tutup
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Maks. Pesanan per Slot</label>
                        <input type="number" min="1" value={data.max_orders_per_slot} onChange={(e) => setData('max_orders_per_slot', e.target.value)}
                            placeholder="Kosongkan jika tidak ada batas"
                            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                        <p className="text-xs text-slate-400 mt-1">Slot otomatis ditutup di checkout jika jumlah pesanan sudah mencapai batas ini.</p>
                        {errors.max_orders_per_slot && <p className="text-rose-600 text-xs mt-1">{errors.max_orders_per_slot}</p>}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button type="submit" disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition">
                            Simpan
                        </button>
                        {recentlySuccessful && <span className="text-emerald-600 text-sm font-medium">Tersimpan.</span>}
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
