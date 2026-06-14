import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { useDialog } from '@/hooks/useDialog';
import { formatRupiah } from '@/utils/format';
import ImageUploadField from '@/Components/ImageUploadField';

const emptyOption = () => ({ name: '', price_delta: 0, is_default: false });
const emptyGroup = () => ({ name: '', type: 'single', is_required: false, min_select: 0, max_select: '', options: [emptyOption()] });

const emptyForm = {
    _method: 'post',
    name: '',
    description: '',
    price: '',
    category: '',
    is_active: true,
    image: null,
    current_image_url: null,
    option_groups: [],
};

export default function Index({ menuItems = [] }) {
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
            option_groups: (item.option_groups || []).map((g) => ({
                name: g.name,
                type: g.type,
                is_required: g.is_required,
                min_select: g.min_select,
                max_select: g.max_select ?? '',
                options: (g.options || []).map((o) => ({
                    name: o.name,
                    price_delta: o.price_delta,
                    is_default: o.is_default,
                })),
            })),
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

    const addGroup = () => setData('option_groups', [...data.option_groups, emptyGroup()]);
    const removeGroup = (gi) => setData('option_groups', data.option_groups.filter((_, i) => i !== gi));
    const updateGroup = (gi, field, value) => {
        const groups = [...data.option_groups];
        groups[gi] = { ...groups[gi], [field]: value };
        setData('option_groups', groups);
    };
    const addOption = (gi) => {
        const groups = [...data.option_groups];
        groups[gi] = { ...groups[gi], options: [...groups[gi].options, emptyOption()] };
        setData('option_groups', groups);
    };
    const removeOption = (gi, oi) => {
        const groups = [...data.option_groups];
        groups[gi] = { ...groups[gi], options: groups[gi].options.filter((_, i) => i !== oi) };
        setData('option_groups', groups);
    };
    const updateOption = (gi, oi, field, value) => {
        const groups = [...data.option_groups];
        const options = [...groups[gi].options];
        options[oi] = { ...options[oi], [field]: value };
        groups[gi] = { ...groups[gi], options };
        setData('option_groups', groups);
    };

    return (
        <AuthenticatedLayout title="Menu Saya">
            <Head title="Menu Saya" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Menu Saya</h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola menu jualan dan pilihan tambahan (topping, level pedas, dll).</p>
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
                                {item.option_groups?.length > 0 && (
                                    <p className="text-xs text-slate-400 mt-1">{item.option_groups.length} grup pilihan</p>
                                )}
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
                                    <input type="text" value={data.category} onChange={(e) => setData('category', e.target.value)}
                                        placeholder="Makanan / Minuman / Snack"
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
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

                            <div className="border-t border-slate-100 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pilihan Tambahan (Opsional)</p>
                                    <button type="button" onClick={addGroup}
                                        className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                                        + Grup Pilihan
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {data.option_groups.map((group, gi) => (
                                        <div key={gi} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
                                            <div className="flex items-start gap-2">
                                                <input type="text" required value={group.name}
                                                    onChange={(e) => updateGroup(gi, 'name', e.target.value)}
                                                    placeholder="Nama grup, contoh: Pilihan Isi"
                                                    className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                                                <select value={group.type} onChange={(e) => updateGroup(gi, 'type', e.target.value)}
                                                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                                    <option value="single">Pilih Satu</option>
                                                    <option value="multiple">Pilih Banyak</option>
                                                </select>
                                                <button type="button" onClick={() => removeGroup(gi)}
                                                    className="px-2.5 py-1.5 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-500 font-semibold text-xs rounded border border-slate-200 transition">
                                                    Hapus Grup
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                                    <input type="checkbox" checked={group.is_required}
                                                        onChange={(e) => updateGroup(gi, 'is_required', e.target.checked)}
                                                        className="rounded text-primary-600 focus:ring-primary-500" />
                                                    Wajib dipilih
                                                </label>
                                                {group.type === 'multiple' && (
                                                    <>
                                                        <label className="flex items-center gap-2 text-xs text-slate-600">
                                                            Min
                                                            <input type="number" min="0" value={group.min_select}
                                                                onChange={(e) => updateGroup(gi, 'min_select', e.target.value)}
                                                                className="w-16 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                                        </label>
                                                        <label className="flex items-center gap-2 text-xs text-slate-600">
                                                            Max
                                                            <input type="number" min="0" value={group.max_select}
                                                                onChange={(e) => updateGroup(gi, 'max_select', e.target.value)}
                                                                placeholder="-"
                                                                className="w-16 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                                        </label>
                                                    </>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                {group.options.map((opt, oi) => (
                                                    <div key={oi} className="flex items-center gap-2">
                                                        <input type="text" required value={opt.name}
                                                            onChange={(e) => updateOption(gi, oi, 'name', e.target.value)}
                                                            placeholder="Nama pilihan, contoh: Tahu"
                                                            className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                                                        <input type="number" value={opt.price_delta}
                                                            onChange={(e) => updateOption(gi, oi, 'price_delta', e.target.value)}
                                                            placeholder="+/- harga"
                                                            className="w-28 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                                                        <label className="flex items-center gap-1 text-xs text-slate-600 shrink-0">
                                                            <input type="checkbox" checked={opt.is_default}
                                                                onChange={(e) => updateOption(gi, oi, 'is_default', e.target.checked)}
                                                                className="rounded text-primary-600 focus:ring-primary-500" />
                                                            Default
                                                        </label>
                                                        <button type="button" onClick={() => removeOption(gi, oi)}
                                                            className="px-2 py-1.5 text-slate-400 hover:text-rose-600 transition">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => addOption(gi)}
                                                    className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                                                    + Pilihan
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {data.option_groups.length === 0 && (
                                        <p className="text-xs text-slate-400">Belum ada grup pilihan. Tambahkan jika menu ini punya varian (contoh: isi, level pedas).</p>
                                    )}
                                </div>
                            </div>

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
