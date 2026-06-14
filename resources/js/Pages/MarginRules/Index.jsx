import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { useDialog } from '@/hooks/useDialog';
import Pagination from '@/Components/Pagination';
import FilterBar from '@/Components/FilterBar';
import SortableHeader from '@/Components/SortableHeader';


    export default function Index({ rules = { data: [], links: [], total: 0 }, filters = {} }) {
    const [editModal, setEditModal] = useState(false);
    const { dialog, confirm: openConfirm, alert: openAlert, dialogConfirm, dialogClose } = useDialog();
    const [editId, setEditId] = useState('');

    // Add Form
    const { data: addData, setData: setAddData, post: postAdd, processing: addProcessing, errors: addErrors, reset: addReset } = useForm({
        min_price: '',
        max_price: '',
        margin: '',
    });

    // Edit Form
    const { data: editData, setData: setEditData, put: putEdit, processing: editProcessing, errors: editErrors, reset: editReset } = useForm({
        min_price: '',
        max_price: '',
        margin: '',
    });

    const formatMargin = (value) => {
        if (value === null || value === undefined || value === '') return 'Tak Terhingga';
        return 'Rp' + new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        postAdd(route('margin-rules.store'), {
            onSuccess: () => addReset(),
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        putEdit(route('margin-rules.update', editId), {
            onSuccess: () => {
                setEditModal(false);
                editReset();
            },
        });
    };

    const handleDelete = (id) => {
        openConfirm({ message: 'Apakah Anda yakin ingin menghapus aturan profit ini?' }, () => router.delete(route('margin-rules.destroy', id)));
    };

    const openEditModal = (rule) => {
        setEditId(rule.id);
        setEditData({
            min_price: rule.min_price,
            max_price: rule.max_price || '',
            margin: rule.margin,
        });
        setEditModal(true);
    };

    return (
        <AuthenticatedLayout title="Aturan Profit (Margin Rules)">
            <Head title="Aturan Profit" />

            <div className="mb-4"><FilterBar filters={filters} searchPlaceholder="Cari data..." /></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Add Rule Form */}
                <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                    <h3 className="text-sm md:text-base font-bold text-slate-900 mb-4">Tambah Aturan Profit</h3>
                    
                    <form onSubmit={handleAddSubmit}>
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Minimal Harga Beli (Rp)
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                placeholder="Contoh: 0"
                                value={addData.min_price}
                                onChange={(e) => setAddData('min_price', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            {addErrors.min_price && <p className="text-rose-600 text-xs mt-1">{addErrors.min_price}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Maksimal Harga Beli (Rp)
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="Kosongi jika tak terhingga"
                                value={addData.max_price}
                                onChange={(e) => setAddData('max_price', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Kosongi jika berlaku sampai harga berapapun ke atas.</p>
                            {addErrors.max_price && <p className="text-rose-600 text-xs mt-1">{addErrors.max_price}</p>}
                        </div>

                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Profit Kantin (Rp)
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                placeholder="Contoh: 500"
                                value={addData.margin}
                                onChange={(e) => setAddData('margin', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            {addErrors.margin && <p className="text-rose-600 text-xs mt-1">{addErrors.margin}</p>}
                        </div>
                        
                        <button
                            type="submit"
                            disabled={addProcessing}
                            className="w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
                        >
                            {addProcessing ? 'Menyimpan...' : 'Simpan Aturan'}
                        </button>
                    </form>
                </div>

                {/* Rule List */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    
                    <div className="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <h3 className="text-sm md:text-base font-bold text-slate-900">Daftar Aturan Profit Produk Siswa</h3>
                        <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-full">
                            {rules.data.length} Aturan
                        </span>
                    </div>
                    
                    {rules.data.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                            Belum ada aturan profit yang ditambahkan.
                        </div>
                    ) : (
                        <>
                            {/* Mobile View */}
                            <div className="grid grid-cols-1 gap-3 md:hidden">
                                {rules.data.map((rule) => (
                                    <div key={rule.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-slate-950 text-sm">Profit: {formatMargin(rule.margin)}</h4>
                                        </div>
                                        <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                                            <span className="text-slate-400 font-semibold">Rentang Modal</span>
                                            <span className="font-bold text-slate-900">
                                                {formatMargin(rule.min_price)} - {formatMargin(rule.max_price)}
                                            </span>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-1">
                                            <button onClick={() => openEditModal(rule)} className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg">Ubah</button>
                                            <button onClick={() => handleDelete(rule.id)} className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg">Hapus</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop View */}
                            <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <SortableHeader column="min_price" label="Harga Beli Minimal" filters={filters} />
                                            <SortableHeader column="max_price" label="Harga Beli Maksimal" filters={filters} />
                                            <SortableHeader column="margin" label="Profit Kantin" filters={filters} />
                                            <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {rules.data.map((rule) => (
                                            <tr key={rule.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-950">{formatMargin(rule.min_price)}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-950">{formatMargin(rule.max_price)}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-primary-600">+{formatMargin(rule.margin)}</td>
                                                <td className="px-6 py-4 text-sm text-center">
                                                    <div className="inline-flex gap-2">
                                                        <button onClick={() => openEditModal(rule)} className="px-2.5 py-1.5 bg-slate-100 font-semibold text-xs rounded">Ubah</button>
                                                        <button onClick={() => handleDelete(rule.id)} className="px-2.5 py-1.5 bg-slate-100 font-semibold text-xs rounded text-rose-600">Hapus</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-slate-900">Ubah Aturan Profit</h3>
                            <button onClick={() => setEditModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Minimal Harga Beli</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={editData.min_price}
                                    onChange={(e) => setEditData('min_price', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                {editErrors.min_price && <p className="text-rose-600 text-xs mt-1">{editErrors.min_price}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Maksimal Harga Beli</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editData.max_price}
                                    onChange={(e) => setEditData('max_price', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                {editErrors.max_price && <p className="text-rose-600 text-xs mt-1">{editErrors.max_price}</p>}
                            </div>

                            <div className="mb-5">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Profit Kantin</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={editData.margin}
                                    onChange={(e) => setEditData('margin', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                {editErrors.margin && <p className="text-rose-600 text-xs mt-1">{editErrors.margin}</p>}
                            </div>
                            
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setEditModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-sm rounded-lg">Batal</button>
                                <button type="submit" disabled={editProcessing} className="px-4 py-2 bg-primary-600 text-white font-semibold text-sm rounded-lg">
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
