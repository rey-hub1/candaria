import React, { useState, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { useDialog } from '@/hooks/useDialog';
import { formatRupiah } from '@/utils/format';
import Pagination from '@/Components/Pagination';
import SortableHeader from '@/Components/SortableHeader';

const FormField = ({ label, error, children, hint }) => (
    <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
        {children}
        {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
        {error && <p className="text-rose-600 text-xs mt-1 font-medium">{error}</p>}
    </div>
);

const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition";

export default function Index({ products = { data: [], links: [], total: 0 }, filters = {}, categories = [], sellers = [] }) {
    const [addModal, setAddModal] = useState(false);
    const { dialog, confirm: openConfirm, alert: openAlert, dialogConfirm, dialogClose } = useDialog();
    const [editModal, setEditModal] = useState(false);
    const [editId, setEditId] = useState('');
    const [search, setSearch] = useState(filters.search || '');
    const [sellerSearch, setSellerSearch] = useState(filters.seller_search || '');
    const searchTimerRef = useRef(null);
    const sellerTimerRef = useRef(null);

    const { data: addData, setData: setAddData, post: postAdd, processing: addProcessing, errors: addErrors, reset: addReset } = useForm({
        name: '', code: '', category_id: '', type: 'siswa',
        cost_price: '', selling_price: '', seller_id: '', stock: '', image: null,
    });

    const { data: editData, setData: setEditData, post: postEdit, processing: editProcessing, errors: editErrors, reset: editReset } = useForm({
        _method: 'put', name: '', code: '', category_id: '', type: 'siswa',
        cost_price: '', selling_price: '', seller_id: '', stock: '', image: null,
    });

    const handleSearch = (val) => {
        setSearch(val);
        clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            router.get(window.location.pathname, { ...filters, search: val }, { preserveState: true, preserveScroll: true, replace: true });
        }, 300);
    };

    const handleSellerSearch = (val) => {
        setSellerSearch(val);
        clearTimeout(sellerTimerRef.current);
        sellerTimerRef.current = setTimeout(() => {
            router.get(window.location.pathname, { ...filters, seller_search: val }, { preserveState: true, preserveScroll: true, replace: true });
        }, 300);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        postAdd(route('products.store'), { onSuccess: () => { setAddModal(false); addReset(); } });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        postEdit(route('products.update', editId), { onSuccess: () => { setEditModal(false); editReset(); } });
    };

    const handleDelete = (id) => {
        openConfirm({ message: 'Hapus produk ini? Aksi ini tidak dapat dibatalkan.' }, () => router.delete(route('products.destroy', id)));
    };

    const openEditModal = (product) => {
        setEditId(product.id);
        setEditData({
            _method: 'put', name: product.name, code: product.code || '',
            category_id: product.category_id, type: product.type,
            cost_price: Math.round(product.cost_price),
            selling_price: product.selling_price ? Math.round(product.selling_price) : '',
            seller_id: product.seller_id || '', stock: product.stock, image: null,
        });
        setEditModal(true);
    };


    const ProductForm = ({ data, setData, errors, onSubmit, processing, isEdit = false }) => (
        <form onSubmit={onSubmit} className="space-y-4">
            <FormField label="Nama Produk" error={errors.name}>
                <input type="text" required placeholder="Contoh: Roti Cokelat" value={data.name}
                    onChange={e => setData('name', e.target.value)} className={inputCls} autoFocus />
            </FormField>

            <FormField label="Kode Produk" error={errors.code}
                hint={!isEdit ? "Kosongkan untuk buat otomatis berdasarkan kategori." : undefined}>
                <input type="text" placeholder={!isEdit ? "Otomatis jika kosong..." : ""} value={data.code}
                    onChange={e => setData('code', e.target.value)} className={inputCls} />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
                <FormField label="Kategori" error={errors.category_id}>
                    <select required value={data.category_id} onChange={e => setData('category_id', e.target.value)} className={inputCls}>
                        <option value="">Pilih...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </FormField>
                <FormField label="Jenis" error={errors.type}>
                    <select required value={data.type} onChange={e => setData('type', e.target.value)} className={inputCls}>
                        <option value="siswa">Titipan Siswa</option>
                        <option value="kantin">Produk Kantin</option>
                    </select>
                </FormField>
            </div>

            {data.type === 'siswa' && (
                <FormField label="Siswa Penitip" error={errors.seller_id}>
                    <div className="flex gap-2">
                        <select required={data.type === 'siswa'} value={data.seller_id}
                            onChange={e => setData('seller_id', e.target.value)} className={inputCls}>
                            <option value="">Pilih siswa...</option>
                            {sellers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class})</option>)}
                        </select>
                        <Link href={route('sellers.index')} title="Kelola Penitip"
                            className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition flex items-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </Link>
                    </div>
                </FormField>
            )}

            <div className="grid grid-cols-2 gap-3">
                <FormField label={data.type === 'siswa' ? 'Harga Siswa (Modal)' : 'Harga Modal'} error={errors.cost_price}>
                    <input type="number" required min="0" placeholder="Rp 0" value={data.cost_price}
                        onChange={e => setData('cost_price', e.target.value)} className={inputCls} />
                </FormField>
                {data.type === 'kantin' ? (
                    <FormField label="Harga Jual" error={errors.selling_price}>
                        <input type="number" required min="0" placeholder="Rp 0" value={data.selling_price}
                            onChange={e => setData('selling_price', e.target.value)} className={inputCls} />
                    </FormField>
                ) : (
                    <FormField label="Harga Jual">
                        <div className="flex items-center h-[38px] px-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-700 font-semibold">
                            Otomatis dihitung oleh sistem
                        </div>
                    </FormField>
                )}
            </div>

            <FormField label={isEdit ? "Stok Sisa" : "Stok Awal"} error={errors.stock}>
                <input type="number" required min="0" placeholder="0" value={data.stock}
                    onChange={e => setData('stock', e.target.value)} className={inputCls} />
            </FormField>

            <FormField label="Foto Produk (Opsional)" error={errors.image}>
                <input type="file" accept="image/*" onChange={e => setData('image', e.target.files[0])}
                    className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
            </FormField>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => isEdit ? setEditModal(false) : setAddModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition">
                    Batal
                </button>
                <button type="submit" disabled={processing}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {processing ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Produk')}
                </button>
            </div>
        </form>
    );

    return (
        <AuthenticatedLayout title="Kelola Produk">
            <Head title="Kelola Produk" />

            <div className="space-y-4">

                {/* Header */}
                <div className="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Kelola Produk</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{products.total ?? products.data.length} produk terdaftar</p>
                    </div>
                    <button onClick={() => setAddModal(true)}
                        className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition inline-flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Tambah Produk
                    </button>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-48">
                        <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Cari nama / kode produk..." value={search}
                            onChange={e => handleSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                    <div className="relative flex-1 min-w-48">
                        <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        <input type="text" placeholder="Cari nama siswa penitip..." value={sellerSearch}
                            onChange={e => handleSellerSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                </div>

                {products.data.length === 0 ? (
                    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-16 text-center">
                        <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                        <p className="text-slate-400 text-sm font-medium">Belum ada produk ditemukan.</p>
                        <button onClick={() => setAddModal(true)} className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition">
                            + Tambah Produk Pertama
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Mobile Cards */}
                        <div className="grid grid-cols-1 gap-3 md:hidden">
                            {products.data.map(p => (
                                <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        {p.image_url ? (
                                            <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm truncate">{p.name}</h4>
                                                    <span className="text-[10px] text-slate-400 font-mono">{p.code || '—'}</span>
                                                </div>
                                                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${p.type === 'kantin' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {p.type === 'kantin' ? 'Kantin' : 'Titipan'}
                                                </span>
                                            </div>
                                            <div className="mt-2 text-xs text-slate-500">{p.category?.name}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100">
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-400">Modal</p>
                                            <p className="text-xs font-bold text-slate-700">{formatRupiah(p.cost_price)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-400">Jual</p>
                                            <p className="text-xs font-bold text-slate-900">{formatRupiah(p.selling_price)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-400">Stok</p>
                                            <p className={`text-xs font-extrabold ${p.stock <= 5 ? 'text-rose-600' : p.stock <= 15 ? 'text-amber-600' : 'text-emerald-600'}`}>{p.stock}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-3">
                                        <button onClick={() => openEditModal(p)}
                                            className="flex-1 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs rounded-lg transition text-center">
                                            ✏ Ubah
                                        </button>
                                        <button onClick={() => handleDelete(p.id)}
                                            className="flex-1 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-lg transition text-center">
                                            🗑 Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <SortableHeader column="name" label="Produk" filters={filters} />
                                            <SortableHeader column="type" label="Kategori & Jenis" filters={filters} />
                                            <SortableHeader column="cost_price" label="Modal" filters={filters} className="text-right" />
                                            <SortableHeader column="selling_price" label="Harga Jual" filters={filters} className="text-right" />
                                            <SortableHeader column="stock" label="Stok" filters={filters} className="text-center" />
                                            <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {products.data.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50/70 transition group">
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        {p.image_url ? (
                                                            <img src={p.image_url} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0" />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-slate-300 shrink-0">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-900">{p.name}</div>
                                                            <div className="text-[11px] text-slate-400 font-mono">{p.code || '—'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <div className="text-xs font-semibold text-slate-700">{p.category?.name}</div>
                                                    <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                        p.type === 'kantin' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700'
                                                    }`}>
                                                        {p.type === 'kantin' ? 'Kantin' : (p.seller ? `${p.seller.name}` : 'Titipan')}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-sm text-right text-slate-500 font-mono">{formatRupiah(p.cost_price)}</td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-sm text-right font-bold text-slate-900 font-mono">{formatRupiah(p.selling_price)}</td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-center">
                                                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                        p.stock <= 5 ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                                        : p.stock <= 15 ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                    }`}>
                                                        {p.stock} pcs
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-center">
                                                    <div className="inline-flex gap-1.5 opacity-70 group-hover:opacity-100 transition">
                                                        <button onClick={() => openEditModal(p)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 text-slate-600 font-semibold text-xs rounded-lg transition shadow-sm">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                                                            Ubah
                                                        </button>
                                                        <button onClick={() => handleDelete(p.id)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-slate-600 font-semibold text-xs rounded-lg transition shadow-sm">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
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

                        <Pagination links={products.links} />
                    </>
                )}
            </div>

            {/* Add Modal */}
            {addModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4" onClick={e => e.target === e.currentTarget && setAddModal(false)}>
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Tambah Produk Baru</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Isi data produk di bawah ini</p>
                            </div>
                            <button onClick={() => setAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="px-6 py-5 overflow-y-auto flex-1">
                            <ProductForm data={addData} setData={setAddData} errors={addErrors}
                                onSubmit={handleAddSubmit} processing={addProcessing} />
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4" onClick={e => e.target === e.currentTarget && setEditModal(false)}>
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Ubah Produk</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Edit informasi produk</p>
                            </div>
                            <button onClick={() => setEditModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="px-6 py-5 overflow-y-auto flex-1">
                            <ProductForm data={editData} setData={setEditData} errors={editErrors}
                                onSubmit={handleEditSubmit} processing={editProcessing} isEdit />
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal {...dialog} onConfirm={dialogConfirm} onClose={dialogClose} />
        </AuthenticatedLayout>
    );
}
