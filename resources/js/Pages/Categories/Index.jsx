import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FilterBar from '@/Components/FilterBar';
import SortableHeader from '@/Components/SortableHeader';


    const Pagination = ({ links = [] }) => {
        if (links.length <= 3) return null;
        return (
            <div className="flex flex-wrap gap-1 justify-center mt-4">
                {links.map((link, key) => (
                    link.url === null ? (
                        <div key={key} className="px-3 py-1.5 text-xs text-slate-400 border border-slate-200 rounded-lg bg-slate-50" dangerouslySetInnerHTML={{ __html: link.label }} />
                    ) : (
                        <Link key={key} href={link.url} className={`px-3 py-1.5 text-xs border rounded-lg transition ${link.active ? 'bg-emerald-600 border-emerald-600 text-white font-bold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                    )
                ))}
            </div>
        );
    };

export default function Index({ categories = { data: [], links: [], total: 0 }, filters = {} }) {
    const [editModal, setEditModal] = useState(false);
    const [editId, setEditId] = useState('');
    const [editName, setEditName] = useState('');

    // Add Form
    const { data: addData, setData: setAddData, post: postAdd, processing: addProcessing, errors: addErrors, reset: addReset } = useForm({
        name: '',
        prefix: '',
    });

    // Edit Form
    const { data: editData, setData: setEditData, put: putEdit, processing: editProcessing, errors: editErrors, reset: editReset } = useForm({
        name: '',
        prefix: '',
    });

    const handleAddSubmit = (e) => {
        e.preventDefault();
        postAdd(route('categories.store'), {
            onSuccess: () => addReset(),
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        putEdit(route('categories.update', editId), {
            onSuccess: () => {
                setEditModal(false);
                editReset();
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            router.delete(route('categories.destroy', id));
        }
    };

    const openEditModal = (category) => {
        setEditId(category.id);
        setEditData({
            name: category.name,
            prefix: category.prefix || '',
        });
        setEditModal(true);
    };

    return (
        <AuthenticatedLayout title="Kategori Produk">
            <Head title="Kategori Produk" />

            <div className="mb-4"><FilterBar filters={filters} searchPlaceholder="Cari data..." /></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Add Category Form */}
                <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                    <h3 className="text-sm md:text-base font-bold text-slate-900 mb-4">Tambah Kategori Baru</h3>
                    
                    <form onSubmit={handleAddSubmit}>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Nama Kategori
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                placeholder="Contoh: Snack, Makanan Berat"
                                value={addData.name}
                                onChange={(e) => setAddData('name', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {addErrors.name && (
                                <p className="text-rose-600 text-xs mt-1">{addErrors.name}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="prefix" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Kode / Prefix Kategori (Opsional)
                            </label>
                            <input
                                type="text"
                                name="prefix"
                                id="prefix"
                                placeholder="Misal: A, M, S"
                                value={addData.prefix}
                                onChange={(e) => setAddData('prefix', e.target.value.toUpperCase())}
                                maxLength={5}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 uppercase"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Jika kosong, otomatis ambil huruf pertama (Maks. 5 huruf).</p>
                            {addErrors.prefix && (
                                <p className="text-rose-600 text-xs mt-1">{addErrors.prefix}</p>
                            )}
                        </div>
                        
                        <button
                            type="submit"
                            disabled={addProcessing}
                            className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
                        >
                            {addProcessing ? 'Menyimpan...' : 'Simpan Kategori'}
                        </button>
                    </form>
                </div>

                {/* Category List */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    
                    {/* Header panel */}
                    <div className="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <h3 className="text-sm md:text-base font-bold text-slate-900">Daftar Kategori</h3>
                        <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-full">
                            {categories.data.length} Kategori
                        </span>
                    </div>
                    
                    {categories.data.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                            Belum ada kategori yang ditambahkan.
                        </div>
                    ) : (
                        <>
                            {/* Mobile View: Card Stack */}
                            <div className="grid grid-cols-1 gap-3 md:hidden">
                                {categories.data.map((c) => (
                                    <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-950 text-sm">{c.name}</h4>
                                                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">{c.prefix}</span>
                                            </div>
                                            <span className="text-xs text-slate-500 font-mono">{c.slug}</span>
                                        </div>

                                        <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                                            <span className="text-slate-400 font-semibold">Jumlah Produk</span>
                                            <span className="font-bold text-slate-900">{c.products_count} Produk</span>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-1">
                                            <button
                                                onClick={() => openEditModal(c)}
                                                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs rounded-lg transition"
                                            >
                                                Ubah
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-lg transition"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop View: Table */}
                            <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-100">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-16">No</th>
                                                <SortableHeader column="name" label="Nama Kategori" filters={filters} />
                                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Prefix</th>
                                                <SortableHeader column="slug" label="Slug" filters={filters} />
                                                <SortableHeader column="products_count" label="Jumlah Produk" filters={filters} className="text-center" />
                                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {categories.data.map((c, index) => (
                                                <tr key={c.id} className="hover:bg-slate-50 transition">
                                                    <td className="px-6 py-4 text-sm font-semibold text-slate-500">{index + 1}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-950">{c.name}</td>
                                                    <td className="px-6 py-4 text-sm text-center">
                                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase">{c.prefix}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{c.slug}</td>
                                                    <td className="px-6 py-4 text-sm text-center font-semibold text-slate-600">{c.products_count}</td>
                                                    <td className="px-6 py-4 text-sm text-center">
                                                        <div className="inline-flex gap-2">
                                                            <button
                                                                onClick={() => openEditModal(c)}
                                                                className="inline-flex items-center px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-xs rounded transition"
                                                            >
                                                                Ubah
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(c.id)}
                                                                className="inline-flex items-center px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold text-xs rounded transition"
                                                            >
                                                                Hapus
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <Pagination links={categories.links} />
                        </>
                    )}
                </div>
            </div>

            {/* Edit Category Modal */}
            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-slate-900">Ubah Kategori</h3>
                            <button onClick={() => setEditModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-5">
                                <label htmlFor="edit_name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Nama Kategori
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="edit_name"
                                    required
                                    value={editData.name}
                                    onChange={(e) => setEditData('name', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                {editErrors.name && (
                                    <p className="text-rose-600 text-xs mt-1">{editErrors.name}</p>
                                )}
                            </div>

                            <div className="mb-5">
                                <label htmlFor="edit_prefix" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Kode / Prefix Kategori (Opsional)
                                </label>
                                <input
                                    type="text"
                                    name="prefix"
                                    id="edit_prefix"
                                    placeholder="Misal: A, M, S"
                                    value={editData.prefix}
                                    onChange={(e) => setEditData('prefix', e.target.value.toUpperCase())}
                                    maxLength={5}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 uppercase"
                                />
                                {editErrors.prefix && (
                                    <p className="text-rose-600 text-xs mt-1">{editErrors.prefix}</p>
                                )}
                            </div>
                            
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditModal(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
                                >
                                    {editProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
