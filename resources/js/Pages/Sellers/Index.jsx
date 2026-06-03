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

export default function Index({ sellers = { data: [], links: [], total: 0 }, filters = {} }) {
    const [editModal, setEditModal] = useState(false);
    const [editId, setEditId] = useState('');

    // Add Form
    const { data: addData, setData: setAddData, post: postAdd, processing: addProcessing, errors: addErrors, reset: addReset } = useForm({
        name: '',
        class: '',
        phone: '',
    });

    // Edit Form
    const { data: editData, setData: setEditData, put: putEdit, processing: editProcessing, errors: editErrors, reset: editReset } = useForm({
        name: '',
        class: '',
        phone: '',
        is_active: '1',
    });

    const handleAddSubmit = (e) => {
        e.preventDefault();
        postAdd(route('sellers.store'), {
            onSuccess: () => addReset(),
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        putEdit(route('sellers.update', editId), {
            onSuccess: () => {
                setEditModal(false);
                editReset();
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data penitip ini?')) {
            router.delete(route('sellers.destroy', id));
        }
    };

    const openEditModal = (seller) => {
        setEditId(seller.id);
        setEditData({
            name: seller.name,
            class: seller.class || '',
            phone: seller.phone || '',
            is_active: seller.is_active ? '1' : '0',
        });
        setEditModal(true);
    };

    return (
        <AuthenticatedLayout title="Siswa Penitip">
            <Head title="Siswa Penitip" />


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Add Seller Form */}
                <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                    <h3 className="text-sm md:text-base font-bold text-slate-900 mb-4">Daftar Penitip Baru (Siswa)</h3>
                    
                    <form onSubmit={handleAddSubmit}>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                placeholder="Contoh: Budi Setiawan"
                                value={addData.name}
                                onChange={(e) => setAddData('name', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {addErrors.name && (
                                <p className="text-rose-600 text-xs mt-1">{addErrors.name}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="class" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Kelas
                            </label>
                            <input
                                type="text"
                                name="class"
                                id="class"
                                placeholder="Contoh: XII RPL 1"
                                value={addData.class}
                                onChange={(e) => setAddData('class', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {addErrors.class && (
                                <p className="text-rose-600 text-xs mt-1">{addErrors.class}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="phone" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                No. HP / WA
                            </label>
                            <input
                                type="text"
                                name="phone"
                                id="phone"
                                placeholder="Contoh: 08123456xxx"
                                value={addData.phone}
                                onChange={(e) => setAddData('phone', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {addErrors.phone && (
                                <p className="text-rose-600 text-xs mt-1">{addErrors.phone}</p>
                            )}
                        </div>
                        
                        <button
                            type="submit"
                            disabled={addProcessing}
                            className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
                        >
                            {addProcessing ? 'Menyimpan...' : 'Simpan Penitip'}
                        </button>
                    </form>
                </div>

                {/* Seller List */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    
                    {/* Header panel */}
                    <div className="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <h3 className="text-sm md:text-base font-bold text-slate-900">Daftar Siswa Penitip</h3>
                        <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-full">
                            {sellers.data.length} Orang
                        </span>
                    </div>

                    <FilterBar filters={filters} searchPlaceholder="Cari nama penitip, kelas, atau nomor HP..." />
                    
                    {sellers.data.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                            Belum ada data siswa penitip.
                        </div>
                    ) : (
                        <>
                            {/* Mobile View: Card Stack */}
                            <div className="grid grid-cols-1 gap-3 md:hidden">
                                {sellers.data.map((s) => (
                                    <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-slate-950 text-sm">{s.name}</h4>
                                                <span className="text-xs text-slate-500">Kelas: {s.class || '-'}</span>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                s.is_active 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                            }`}>
                                                {s.is_active ? 'Aktif' : 'Non-Aktif'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                                            <div>
                                                <p className="text-slate-400 font-semibold">No. HP</p>
                                                <p className="font-bold text-slate-700">
                                                    {s.phone ? (
                                                        <a href={`https://wa.me/${s.phone.replace(/^0/, '62').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-500 underline decoration-emerald-200 hover:decoration-emerald-500 transition-colors" title="Hubungi via WhatsApp">
                                                            {s.phone}
                                                        </a>
                                                    ) : '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 font-semibold">Jumlah Produk</p>
                                                <p className="font-extrabold text-slate-900">{s.products_count} Produk</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-1">
                                            <button
                                                onClick={() => openEditModal(s)}
                                                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs rounded-lg transition"
                                            >
                                                Ubah
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id)}
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
                                                <SortableHeader column="name" label="Nama" filters={filters} />
                                                <SortableHeader column="class" label="Kelas" filters={filters} />
                                                <SortableHeader column="phone" label="No. HP" filters={filters} />
                                                <SortableHeader column="is_active" label="Status" filters={filters} className="text-center" />
                                                <SortableHeader column="products_count" label="Produk" filters={filters} className="text-center" />
                                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {sellers.data.map((s, index) => (
                                                <tr key={s.id} className="hover:bg-slate-50 transition">
                                                    <td className="px-6 py-4 text-sm font-semibold text-slate-500">{index + 1}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-950">{s.name}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">{s.class || '-'}</td>
                                                    <td className="px-6 py-4 text-sm font-medium">
                                                        {s.phone ? (
                                                            <a href={`https://wa.me/${s.phone.replace(/^0/, '62').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-500 underline decoration-emerald-200 hover:decoration-emerald-500 transition-colors" title="Hubungi via WhatsApp">
                                                                {s.phone}
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-600">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-center">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                            s.is_active 
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                        }`}>
                                                            {s.is_active ? 'Aktif' : 'Non-Aktif'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-center font-semibold text-slate-600">{s.products_count}</td>
                                                    <td className="px-6 py-4 text-sm text-center">
                                                        <div className="inline-flex gap-2">
                                                            <button
                                                                onClick={() => openEditModal(s)}
                                                                className="inline-flex items-center px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-xs rounded transition"
                                                            >
                                                                Ubah
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(s.id)}
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
                            <Pagination links={sellers.links} />
                        </>
                    )}
                </div>
            </div>

            {/* Edit Seller Modal */}
            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-slate-900">Ubah Data Penitip</h3>
                            <button onClick={() => setEditModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label htmlFor="edit_name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Nama Lengkap
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

                            <div className="mb-4">
                                <label htmlFor="edit_class" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Kelas
                                </label>
                                <input
                                    type="text"
                                    name="class"
                                    id="edit_class"
                                    value={editData.class}
                                    onChange={(e) => setEditData('class', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                {editErrors.class && (
                                    <p className="text-rose-600 text-xs mt-1">{editErrors.class}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="edit_phone" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    No. HP / WA
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    id="edit_phone"
                                    value={editData.phone}
                                    onChange={(e) => setEditData('phone', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                {editErrors.phone && (
                                    <p className="text-rose-600 text-xs mt-1">{editErrors.phone}</p>
                                )}
                            </div>

                            <div className="mb-5">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Status Aktif
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <input
                                            type="radio"
                                            name="is_active"
                                            value="1"
                                            checked={editData.is_active === '1'}
                                            onChange={(e) => setEditData('is_active', e.target.value)}
                                            className="text-emerald-600 focus:ring-emerald-500"
                                        />
                                        Aktif
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <input
                                            type="radio"
                                            name="is_active"
                                            value="0"
                                            checked={editData.is_active === '0'}
                                            onChange={(e) => setEditData('is_active', e.target.value)}
                                            className="text-emerald-600 focus:ring-emerald-500"
                                        />
                                        Non-Aktif
                                    </label>
                                </div>
                                {editErrors.is_active && (
                                    <p className="text-rose-600 text-xs mt-1">{editErrors.is_active}</p>
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
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
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
