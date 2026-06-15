import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { useDialog } from '@/hooks/useDialog';
import { formatRupiah } from '@/utils/format';
import ImageUploadField from '@/Components/ImageUploadField';

const emptyForm = {
    _method: 'post',
    name: '',
    description: '',
    price: '',
    category: '',
    is_active: true,
    image: null,
    current_image_url: null,
};

export default function Index({ menuItems = [], categories = [] }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const { dialog, confirm: openConfirm, dialogConfirm, dialogClose } = useDialog();

    const { data, setData, post, processing, errors, reset } = useForm(emptyForm);

    const openAddModal = () => {
        setEditId(null);
        reset();
        setData(emptyForm);
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditId(item.id);
        setData({
            _method: 'put',
            name: item.name,
            description: item.description || '',
            price: item.price,
            category: item.category || '',
            is_active: item.is_active,
            image: null,
            current_image_url: item.image_url,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = editId ? route('vendor.menu.update', editId) : route('vendor.menu.store');
        post(url, {
            forceFormData: true,
            onSuccess: () => {
                setModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (id) => {
        openConfirm({ message: 'Hapus menu ini?' }, () => router.delete(route('vendor.menu.destroy', id)));
    };

    const handleToggle = (id) => {
        router.post(route('vendor.menu.toggle', id), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout title="Menu Saya">
            <Head title="Menu Saya" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Menu Saya</h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola menu jualan. Siswa bisa menulis permintaan (pedas, tanpa sambal, dll) lewat catatan saat memesan.</p>
                </div>
                <button onClick={openAddModal}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-lg shadow-sm transition">
                    + Tambah Menu
                </button>
            </div>

            {menuItems.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                    Belum ada menu. Tambahkan menu pertama kamu.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menuItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            {item.image_url && (
                                <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover" />
                            )}
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${item.is_active ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                                {item.category && <p className="text-xs text-slate-400 mt-0.5">{item.category}</p>}
                                <p className="text-sm font-bold text-primary-600 mt-2">{formatRupiah(item.price)}</p>
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => openEditModal(item)}
                                        className="flex-1 px-2.5 py-1.5 bg-slate-100 hover:bg-primary-50 hover:text-primary-700 text-slate-700 font-semibold text-xs rounded transition">
                                        Ubah
                                    </button>
                                    <button onClick={() => handleToggle(item.id)}
                                        className="flex-1 px-2.5 py-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 font-semibold text-xs rounded transition">
                                        {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                    </button>
                                    <button onClick={() => handleDelete(item.id)}
                                        className="flex-1 px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold text-xs rounded transition">
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-8 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-100 my-auto max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-slate-900">{editId ? 'Ubah Menu' : 'Tambah Menu'}</h3>
                            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Menu</label>
                                    <input type="text" required value={data.name} onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: Batagor Isi 5"
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                                    {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Harga</label>
                                    <input type="number" min="0" required value={data.price} onChange={(e) => setData('price', e.target.value)}
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                                    {errors.price && <p className="text-rose-600 text-xs mt-1">{errors.price}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                                    <select value={data.category} onChange={(e) => setData('category', e.target.value)}
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                        <option value="">— Pilih kategori —</option>
                                        {data.category && !categories.includes(data.category) && (
                                            <option value={data.category}>{data.category} (lama)</option>
                                        )}
                                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Deskripsi</label>
                                    <textarea rows={2} value={data.description} onChange={(e) => setData('description', e.target.value)}
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                                </div>

                                <div className="col-span-2">
                                    <ImageUploadField
                                        label="Foto Menu"
                                        value={data.image}
                                        onChange={f => setData('image', f)}
                                        currentImageUrl={data.current_image_url}
                                        error={errors.image}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded text-primary-600 focus:ring-primary-500" />
                                        Tampilkan menu ini ke siswa
                                    </label>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 border-t border-slate-100 pt-3">
                                Tidak perlu mengatur varian/topping. Siswa menulis permintaan khusus (pedas, tanpa sambal, dll) di catatan saat memesan.
                            </p>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition">
                                    Batal
                                </button>
                                <button type="submit" disabled={processing}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-lg shadow-sm transition disabled:opacity-50">
                                    {processing ? 'Menyimpan...' : 'Simpan Menu'}
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
