import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { useDialog } from '@/hooks/useDialog';

function CategoryColumn({ title, subtitle, type, categories }) {
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState('');
    const { dialog, confirm: openConfirm, dialogConfirm, dialogClose } = useDialog();

    const { data, setData, post, processing, errors, reset } = useForm({ type, name: '' });
    const edit = useForm({ type, name: '', is_active: true });

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(search.trim().toLowerCase())
    );

    const handleAdd = (e) => {
        e.preventDefault();
        post(route('admin.marketplace-categories.store'), {
            preserveScroll: true,
            onSuccess: () => reset('name'),
        });
    };

    const startEdit = (cat) => {
        setEditId(cat.id);
        edit.setData({ type, name: cat.name, is_active: cat.is_active });
    };

    const saveEdit = (e) => {
        e.preventDefault();
        edit.put(route('admin.marketplace-categories.update', editId), {
            preserveScroll: true,
            onSuccess: () => setEditId(null),
        });
    };

    const toggle = (cat) => {
        router.put(route('admin.marketplace-categories.update', cat.id),
            { type, name: cat.name, is_active: !cat.is_active },
            { preserveScroll: true });
    };

    const remove = (cat) => {
        openConfirm({ message: `Hapus kategori "${cat.name}"?` },
            () => router.delete(route('admin.marketplace-categories.destroy', cat.id), { preserveScroll: true }));
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900">{title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            </div>

            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}
                    placeholder="Nama kategori baru"
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                <button type="submit" disabled={processing}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50">
                    Tambah
                </button>
            </form>
            {errors.name && <p className="text-rose-600 text-xs mb-3 -mt-2">{errors.name}</p>}

            {categories.length > 0 && (
                <div className="relative mb-3">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                    </svg>
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari kategori..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
            )}

            {categories.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">Belum ada kategori.</p>
            ) : filteredCategories.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">Tidak ada kategori yang cocok dengan "{search}".</p>
            ) : (
                <ul className="divide-y divide-slate-100">
                    {filteredCategories.map((cat) => (
                        <li key={cat.id} className="py-2.5">
                            {editId === cat.id ? (
                                <form onSubmit={saveEdit} className="flex gap-2">
                                    <input type="text" value={edit.data.name} autoFocus
                                        onChange={(e) => edit.setData('name', e.target.value)}
                                        className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                    <button type="submit" disabled={edit.processing}
                                        className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-lg">Simpan</button>
                                    <button type="button" onClick={() => setEditId(null)}
                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg">Batal</button>
                                </form>
                            ) : (
                                <div className="flex items-center justify-between gap-2">
                                    <span className={`text-sm font-medium ${cat.is_active ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                                        {cat.name}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => toggle(cat)}
                                            className={`px-2 py-1 text-[11px] font-semibold rounded transition ${cat.is_active ? 'bg-primary-50 text-primary-700 hover:bg-primary-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                            {cat.is_active ? 'Aktif' : 'Nonaktif'}
                                        </button>
                                        <button onClick={() => startEdit(cat)}
                                            className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-primary-700 rounded transition">Ubah</button>
                                        <button onClick={() => remove(cat)}
                                            className="px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-rose-600 rounded transition">Hapus</button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <ConfirmModal {...dialog} onConfirm={dialogConfirm} onClose={dialogClose} />
        </div>
    );
}

export default function Index({ vendorCategories = [], menuCategories = [] }) {
    return (
        <AuthenticatedLayout title="Kategori Marketplace">
            <Head title="Kategori Marketplace" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Kategori Marketplace</h1>
                <p className="text-sm text-slate-500 mt-1">Kelola daftar kategori. Mitra tinggal memilih dari daftar ini.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategoryColumn
                    title="Kategori Mitra"
                    subtitle="Jenis toko mitra (dipakai untuk filter di halaman jajan siswa)."
                    type="vendor"
                    categories={vendorCategories}
                />
                <CategoryColumn
                    title="Kategori Menu"
                    subtitle="Kategori item menu (dipakai mitra saat menambah menu)."
                    type="menu"
                    categories={menuCategories}
                />
            </div>
        </AuthenticatedLayout>
    );
}
