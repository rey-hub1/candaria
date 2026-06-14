import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { useDialog } from '@/hooks/useDialog';
import Pagination from '@/Components/Pagination';
import FilterBar from '@/Components/FilterBar';
import SortableHeader from '@/Components/SortableHeader';

const STATUS_BADGE = {
    active: 'bg-primary-50 text-primary-700 border border-primary-200',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    suspended: 'bg-rose-50 text-rose-700 border border-rose-200',
};

const STATUS_LABEL = {
    active: 'Aktif',
    pending: 'Menunggu',
    suspended: 'Ditangguhkan',
};

export default function Index({ vendors = { data: [], links: [], total: 0 }, filters = {} }) {
    const [editModal, setEditModal] = useState(false);
    const { dialog, confirm: openConfirm, dialogConfirm, dialogClose } = useDialog();
    const [editId, setEditId] = useState('');

    const { data: addData, setData: setAddData, post: postAdd, processing: addProcessing, errors: addErrors, reset: addReset } = useForm({
        name: '',
        category: '',
        phone: '',
        address: '',
        description: '',
        owner_email: '',
        owner_password: '',
    });

    const { data: editData, setData: setEditData, put: putEdit, processing: editProcessing, errors: editErrors } = useForm({
        name: '',
        category: '',
        phone: '',
        address: '',
        description: '',
        status: 'active',
    });

    const handleAddSubmit = (e) => {
        e.preventDefault();
        postAdd(route('admin.vendors.store'), { onSuccess: () => addReset() });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        putEdit(route('admin.vendors.update', editId), { onSuccess: () => setEditModal(false) });
    };

    const handleDelete = (id) => {
        openConfirm({ message: 'Hapus mitra ini?' }, () => router.delete(route('admin.vendors.destroy', id)));
    };

    const openEditModal = (vendor) => {
        setEditId(vendor.id);
        setEditData({
            name: vendor.name,
            category: vendor.category || '',
            phone: vendor.phone || '',
            address: vendor.address || '',
            description: vendor.description || '',
            status: vendor.status,
        });
        setEditModal(true);
    };

    return (
        <AuthenticatedLayout title="Mitra / Pedagang Afiliasi">
            <Head title="Mitra / Pedagang Afiliasi" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add Vendor Form */}
                <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                    <h3 className="text-sm md:text-base font-bold text-slate-900 mb-4">Daftarkan Mitra Baru</h3>

                    <form onSubmit={handleAddSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Toko</label>
                            <input type="text" required value={addData.name} onChange={(e) => setAddData('name', e.target.value)}
                                placeholder="Contoh: Batagor Bang Jaja"
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                            {addErrors.name && <p className="text-rose-600 text-xs mt-1">{addErrors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                            <input type="text" value={addData.category} onChange={(e) => setAddData('category', e.target.value)}
                                placeholder="Contoh: Makanan Berat"
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">No. HP / WA</label>
                            <input type="text" value={addData.phone} onChange={(e) => setAddData('phone', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Alamat</label>
                            <input type="text" value={addData.address} onChange={(e) => setAddData('address', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Deskripsi</label>
                            <textarea rows={2} value={addData.description} onChange={(e) => setAddData('description', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Akun Login Mitra</p>
                            <div className="space-y-3">
                                <div>
                                    <input type="email" required value={addData.owner_email} onChange={(e) => setAddData('owner_email', e.target.value)}
                                        placeholder="Email login mitra"
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                                    {addErrors.owner_email && <p className="text-rose-600 text-xs mt-1">{addErrors.owner_email}</p>}
                                </div>
                                <div>
                                    <input type="text" required value={addData.owner_password} onChange={(e) => setAddData('owner_password', e.target.value)}
                                        placeholder="Password awal"
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                                    {addErrors.owner_password && <p className="text-rose-600 text-xs mt-1">{addErrors.owner_password}</p>}
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={addProcessing}
                            className="w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50">
                            {addProcessing ? 'Menyimpan...' : 'Simpan Mitra'}
                        </button>
                    </form>
                </div>

                {/* Vendor List */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <h3 className="text-sm md:text-base font-bold text-slate-900">Daftar Mitra</h3>
                        <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-full">{vendors.total} Mitra</span>
                    </div>

                    <FilterBar filters={filters} searchPlaceholder="Cari nama toko atau kategori..." />

                    {vendors.data.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                            Belum ada mitra terdaftar.
                        </div>
                    ) : (
                        <>
                            <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-100">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <SortableHeader column="name" label="Nama Toko" filters={filters} />
                                                <SortableHeader column="category" label="Kategori" filters={filters} />
                                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Menu</th>
                                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {vendors.data.map((v) => (
                                                <tr key={v.id} className="hover:bg-slate-50 transition">
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-950">{v.name}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">{v.category || '-'}</td>
                                                    <td className="px-6 py-4 text-sm text-center font-semibold text-slate-600">{v.menu_items_count}</td>
                                                    <td className="px-6 py-4 text-sm text-center">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${STATUS_BADGE[v.status]}`}>
                                                            {STATUS_LABEL[v.status]}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-center">
                                                        <div className="inline-flex gap-2">
                                                            <button onClick={() => openEditModal(v)}
                                                                className="inline-flex items-center px-2.5 py-1.5 bg-slate-100 hover:bg-primary-50 hover:text-primary-700 text-slate-700 font-semibold text-xs rounded transition">
                                                                Ubah
                                                            </button>
                                                            <button onClick={() => handleDelete(v.id)}
                                                                className="inline-flex items-center px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold text-xs rounded transition">
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
                            <Pagination links={vendors.links} />
                        </>
                    )}
                </div>
            </div>

            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-slate-900">Ubah Data Mitra</h3>
                            <button onClick={() => setEditModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Toko</label>
                                <input type="text" required value={editData.name} onChange={(e) => setEditData('name', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                                {editErrors.name && <p className="text-rose-600 text-xs mt-1">{editErrors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                                <input type="text" value={editData.category} onChange={(e) => setEditData('category', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">No. HP / WA</label>
                                <input type="text" value={editData.phone} onChange={(e) => setEditData('phone', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Alamat</label>
                                <input type="text" value={editData.address} onChange={(e) => setEditData('address', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                                <select value={editData.status} onChange={(e) => setEditData('status', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                    <option value="active">Aktif</option>
                                    <option value="pending">Menunggu</option>
                                    <option value="suspended">Ditangguhkan</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setEditModal(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition">
                                    Batal
                                </button>
                                <button type="submit" disabled={editProcessing}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-lg shadow-sm transition disabled:opacity-50">
                                    {editProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmModal {...dialog} onConfirm={dialogConfirm} onClose={dialogClose} />
        </AuthenticatedLayout>
    );
}
