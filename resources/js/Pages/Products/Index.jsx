import React, { useState, useEffect } from 'react';
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

export default function Index({ products = { data: [], links: [], total: 0 }, filters = {}, categories = [], sellers = [] }) {
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [editId, setEditId] = useState('');

    // Add Form
    const { data: addData, setData: setAddData, post: postAdd, processing: addProcessing, errors: addErrors, reset: addReset } = useForm({
        name: '',
        code: '',
        category_id: '',
        type: 'siswa',
        cost_price: '',
        selling_price: '',
        seller_id: '',
        stock: '',
        image: null,
    });

    // Edit Form
    const { data: editData, setData: setEditData, post: postEdit, processing: editProcessing, errors: editErrors, reset: editReset } = useForm({
        _method: 'put',
        name: '',
        code: '',
        category_id: '',
        type: 'siswa',
        cost_price: '',
        selling_price: '',
        seller_id: '',
        stock: '',
        image: null,
    });

    const handleAddSubmit = (e) => {
        e.preventDefault();
        postAdd(route('products.store'), {
            onSuccess: () => {
                setAddModal(false);
                addReset();
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        postEdit(route('products.update', editId), {
            onSuccess: () => {
                setEditModal(false);
                editReset();
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            router.delete(route('products.destroy', id));
        }
    };

    const openEditModal = (product) => {
        setEditId(product.id);
        setEditData({
            _method: 'put',
            name: product.name,
            code: product.code || '',
            category_id: product.category_id,
            type: product.type,
            cost_price: Math.round(product.cost_price),
            selling_price: product.selling_price ? Math.round(product.selling_price) : '',
            seller_id: product.seller_id || '',
            stock: product.stock,
            image: null,
        });
        setEditModal(true);
    };

    const formatRupiah = (value) => {
        return 'Rp' + new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <AuthenticatedLayout title="Kelola Produk">
            <Head title="Kelola Produk" />

            <div className="flex flex-col gap-6">
                
                {/* Product List */}
                <div className="flex flex-col gap-4">
                    
                    {/* Header Panel */}
                    <div className="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div>
                            <h3 className="text-sm md:text-base font-bold text-slate-900">Daftar Produk</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{products.total ?? products.data.length} Produk terdaftar</p>
                        </div>
                        <button onClick={() => setAddModal(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition inline-flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
                            </svg>
                            Tambah Produk
                        </button>
                    </div>

                    <FilterBar filters={filters} searchPlaceholder="Cari nama / kode produk..." />
                    <input 
                        type="text" 
                        defaultValue={filters.seller_search || ''} 
                        onChange={(e) => {
                            clearTimeout(window.sellerSearchTimeout);
                            const value = e.target.value;
                            window.sellerSearchTimeout = setTimeout(() => {
                                const query = { ...filters, seller_search: value };
                                if (!value) delete query.seller_search;
                                import('@inertiajs/react').then(({ router }) => {
                                    router.get(window.location.pathname, query, { preserveState: true, preserveScroll: true, replace: true });
                                });
                            }, 300);
                        }}
                        placeholder="Cari nama pemilik (siswa penitip)..." 
                        className="w-full sm:max-w-md px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4"
                    />

                    {products.data.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                            Belum ada produk yang ditambahkan.
                        </div>
                    ) : (
                        <>
                            {/* Mobile View: Card Stack */}
                            <div className="grid grid-cols-1 gap-3 md:hidden">
                                {products.data.map((p) => (
                                    <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex items-center gap-3">
                                                {p.image_url ? (
                                                    <img src={p.image_url} alt={p.name} className="w-10 h-10 min-w-10 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                                                ) : (
                                                    <div className="w-10 h-10 min-w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1">{p.name}</h4>
                                                    <span className="text-[10px] text-slate-400 font-mono">{p.code || 'Tanpa Kode'}</span>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                                p.type === 'kantin' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700'
                                            }`}>
                                                {p.type === 'kantin' ? 'Kantin' : (p.seller ? `${p.seller.name} (${p.seller.class})` : 'Siswa')}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                                            <div>
                                                <p className="text-slate-400 font-medium">Kategori</p>
                                                <p className="font-bold text-slate-700">{p.category?.name}</p>
                                            </div>
                                            <div>
                                                <p class="text-slate-400 font-medium">Stok Sisa</p>
                                                <p className={`font-extrabold ${p.stock <= 5 ? 'text-rose-600' : 'text-slate-700'}`}>{p.stock} pcs</p>
                                            </div>
                                            <div className="mt-1">
                                                <p className="text-slate-400 font-medium">Harga Modal</p>
                                                <p className="font-bold text-slate-700">{formatRupiah(p.cost_price)}</p>
                                            </div>
                                            <div className="mt-1">
                                                <p className="text-slate-400 font-medium">Harga Jual</p>
                                                <p className="font-extrabold text-slate-900">{formatRupiah(p.selling_price)}</p>
                                            </div>
                                        </div>



                                        <div className="flex justify-end gap-2 pt-1">
                                            <button
                                                onClick={() => openEditModal(p)}
                                                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs rounded-lg transition"
                                            >
                                                Ubah
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
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
                                                <SortableHeader column="name" label="Info Produk" filters={filters} />
                                                <SortableHeader column="type" label="Kategori & Jenis" filters={filters} />
                                                <SortableHeader column="cost_price" label="Harga Modal" filters={filters} className="text-right" />
                                                <SortableHeader column="selling_price" label="Harga Jual" filters={filters} className="text-right" />
                                                <SortableHeader column="stock" label="Stok" filters={filters} className="text-center" />
                                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {products.data.map((p) => (
                                                <tr key={p.id} className="hover:bg-slate-50 transition">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            {p.image_url ? (
                                                                <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-950">{p.name}</div>
                                                                <div className="text-xs text-slate-500 font-mono">{p.code || 'Tanpa Kode'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-xs font-semibold text-slate-700">{p.category?.name}</div>
                                                        <div className="mt-1 flex flex-wrap gap-1 items-center">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                                p.type === 'kantin' 
                                                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                                                                    : 'bg-orange-50 text-orange-700 border border-orange-200'
                                                            } capitalize`}>
                                                                {p.type === 'kantin' ? 'Produk Kantin' : (p.seller ? `${p.seller.name} (${p.seller.class})` : 'Produk Siswa')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600">
                                                        {formatRupiah(p.cost_price)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-slate-950">
                                                        {formatRupiah(p.selling_price)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                            p.stock <= 5 
                                                                ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                                                : 'bg-slate-100 text-slate-700'
                                                        }`}>
                                                            {p.stock}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                        <div className="inline-flex gap-2">
                                                            <button
                                                                onClick={() => openEditModal(p)}
                                                                className="inline-flex items-center px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-xs rounded transition"
                                                            >
                                                                Ubah
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(p.id)}
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
                            <Pagination links={products.links} />
                        </>
                    )}
                </div>
            </div>

            
            {/* Add Product Modal */}
            {addModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-slate-900">Tambah Produk Baru</h3>
                            <button onClick={() => setAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddSubmit}>
                        <div className="mb-4">
                            <label htmlFor="add_name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Produk</label>
                            <input
                                type="text"
                                name="name"
                                id="add_name"
                                required
                                placeholder="Contoh: Roti Cokelat"
                                value={addData.name}
                                onChange={(e) => setAddData('name', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {addErrors.name && <p className="text-rose-600 text-xs mt-1">{addErrors.name}</p>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="add_code" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kode Produk</label>
                            <input
                                type="text"
                                name="code"
                                id="add_code"
                                placeholder="Kosongkan untuk buat otomatis..."
                                value={addData.code}
                                onChange={(e) => setAddData('code', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Kode bersifat unik. Jika kosong, akan otomatis dibuat (contoh: KDE-0001).</p>
                            {addErrors.code && <p className="text-rose-600 text-xs mt-1">{addErrors.code}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="add_category_id" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                                <select
                                    name="category_id"
                                    id="add_category_id"
                                    required
                                    value={addData.category_id}
                                    onChange={(e) => setAddData('category_id', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="">Pilih...</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {addErrors.category_id && <p className="text-rose-600 text-xs mt-1">{addErrors.category_id}</p>}
                            </div>
                            <div>
                                <label htmlFor="add_type" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Jenis Produk</label>
                                <select
                                    name="type"
                                    id="add_type"
                                    required
                                    value={addData.type}
                                    onChange={(e) => setAddData('type', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="siswa">Produk Siswa (Titipan)</option>
                                    <option value="kantin">Produk Kantin</option>
                                </select>
                                {addErrors.type && <p className="text-rose-600 text-xs mt-1">{addErrors.type}</p>}
                            </div>
                        </div>

                        {/* Dynamic field for Siswa: Seller selection */}
                        {addData.type === 'siswa' && (
                            <div className="mb-4">
                                <label htmlFor="add_seller_id" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Siswa Penitip</label>
                                <div className="flex gap-2 items-center">
                                    <Link href={route('sellers.index')} className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition flex items-center justify-center font-bold" title="Kelola Penitip / Tambah Siswa">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
                                        </svg>
                                    </Link>
                                    <select
                                        name="seller_id"
                                        id="add_seller_id"
                                        required={addData.type === 'siswa'}
                                        value={addData.seller_id}
                                        onChange={(e) => setAddData('seller_id', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="">Pilih Siswa...</option>
                                        {sellers.map((sel) => (
                                            <option key={sel.id} value={sel.id}>{sel.name} ({sel.class})</option>
                                        ))}
                                    </select>
                                </div>
                                {addErrors.seller_id && <p className="text-rose-600 text-xs mt-1">{addErrors.seller_id}</p>}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="add_cost_price" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    {addData.type === 'siswa' ? 'Harga Siswa (Modal)' : 'Harga Modal'}
                                </label>
                                <input
                                    type="number"
                                    name="cost_price"
                                    id="add_cost_price"
                                    required
                                    min="0"
                                    placeholder="Contoh: 1500"
                                    value={addData.cost_price}
                                    onChange={(e) => setAddData('cost_price', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                {addErrors.cost_price && <p className="text-rose-600 text-xs mt-1">{addErrors.cost_price}</p>}
                            </div>
                            
                            {addData.type === 'kantin' ? (
                                <div>
                                    <label htmlFor="add_selling_price" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Harga Jual</label>
                                    <input
                                        type="number"
                                        name="selling_price"
                                        id="add_selling_price"
                                        required={addData.type === 'kantin'}
                                        min="0"
                                        placeholder="Contoh: 2000"
                                        value={addData.selling_price}
                                        onChange={(e) => setAddData('selling_price', e.target.value)}
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                    {addErrors.selling_price && <p className="text-rose-600 text-xs mt-1">{addErrors.selling_price}</p>}
                                </div>
                            ) : (
                                <div className="flex flex-col justify-end pb-1.5">
                                    <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 font-semibold leading-normal">
                                        Harga jual otomatis diset <span className="text-emerald-600">Siswa + Rp500</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mb-5">
                            <label htmlFor="add_stock" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stok Awal</label>
                            <input
                                type="number"
                                name="stock"
                                id="add_stock"
                                required
                                min="0"
                                placeholder="Contoh: 50"
                                value={addData.stock}
                                onChange={(e) => setAddData('stock', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {addErrors.stock && <p className="text-rose-600 text-xs mt-1">{addErrors.stock}</p>}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="add_image" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Foto Produk (Opsional)</label>
                            <input
                                type="file"
                                id="add_image"
                                accept="image/*"
                                onChange={(e) => setAddData('image', e.target.files[0])}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                            />
                            {addErrors.image && <p className="text-rose-600 text-xs mt-1">{addErrors.image}</p>}
                        </div>
                        
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setAddModal(false)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={addProcessing}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
                            >
                                {addProcessing ? 'Menyimpan...' : 'Simpan Produk'}
                            </button>
                        </div>
                    </form>
                    </div>
                </div>
            )}
        
            {/* Edit Product Modal */}
            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-slate-900">Ubah Produk</h3>
                            <button onClick={() => setEditModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label htmlFor="edit_name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Produk</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="edit_name"
                                    required
                                    value={editData.name}
                                    onChange={(e) => setEditData('name', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                {editErrors.name && <p className="text-rose-600 text-xs mt-1">{editErrors.name}</p>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="edit_code" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kode Produk</label>
                                <input
                                    type="text"
                                    name="code"
                                    id="edit_code"
                                    required
                                    value={editData.code}
                                    onChange={(e) => setEditData('code', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                {editErrors.code && <p className="text-rose-600 text-xs mt-1">{editErrors.code}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="edit_category_id" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                                    <select
                                        name="category_id"
                                        id="edit_category_id"
                                        required
                                        value={editData.category_id}
                                        onChange={(e) => setEditData('category_id', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {editErrors.category_id && <p className="text-rose-600 text-xs mt-1">{editErrors.category_id}</p>}
                                </div>
                                <div>
                                    <label htmlFor="edit_type" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Jenis Produk</label>
                                    <select
                                        name="type"
                                        id="edit_type"
                                        required
                                        value={editData.type}
                                        onChange={(e) => setEditData('type', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="siswa">Produk Siswa (Titipan)</option>
                                        <option value="kantin">Produk Kantin</option>
                                    </select>
                                    {editErrors.type && <p className="text-rose-600 text-xs mt-1">{editErrors.type}</p>}
                                </div>
                            </div>

                            {editData.type === 'siswa' && (
                                <div className="mb-4">
                                    <label htmlFor="edit_seller_id" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Siswa Penitip</label>
                                    <select
                                        name="seller_id"
                                        id="edit_seller_id"
                                        required={editData.type === 'siswa'}
                                        value={editData.seller_id}
                                        onChange={(e) => setEditData('seller_id', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="">Pilih Siswa...</option>
                                        {sellers.map((sel) => (
                                            <option key={sel.id} value={sel.id}>{sel.name} ({sel.class})</option>
                                        ))}
                                    </select>
                                    {editErrors.seller_id && <p className="text-rose-600 text-xs mt-1">{editErrors.seller_id}</p>}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="edit_cost_price" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                        {editData.type === 'siswa' ? 'Harga Siswa (Modal)' : 'Harga Modal'}
                                    </label>
                                    <input
                                        type="number"
                                        name="cost_price"
                                        id="edit_cost_price"
                                        required
                                        min="0"
                                        value={editData.cost_price}
                                        onChange={(e) => setEditData('cost_price', e.target.value)}
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                    {editErrors.cost_price && <p className="text-rose-600 text-xs mt-1">{editErrors.cost_price}</p>}
                                </div>
                                
                                {editData.type === 'kantin' ? (
                                    <div>
                                        <label htmlFor="edit_selling_price" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Harga Jual</label>
                                        <input
                                            type="number"
                                            name="selling_price"
                                            id="edit_selling_price"
                                            required={editData.type === 'kantin'}
                                            min="0"
                                            value={editData.selling_price}
                                            onChange={(e) => setEditData('selling_price', e.target.value)}
                                            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                        {editErrors.selling_price && <p className="text-rose-600 text-xs mt-1">{editErrors.selling_price}</p>}
                                    </div>
                                ) : (
                                    <div className="flex flex-col justify-end pb-1.5">
                                        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 font-semibold leading-normal">
                                            Harga jual otomatis diset <span className="text-emerald-600">Siswa + Rp500</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mb-5">
                                <label htmlFor="edit_stock" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stok Sisa</label>
                                <input
                                    type="number"
                                    name="stock"
                                    id="edit_stock"
                                    required
                                    min="0"
                                    value={editData.stock}
                                    onChange={(e) => setEditData('stock', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                {editErrors.stock && <p className="text-rose-600 text-xs mt-1">{editErrors.stock}</p>}
                            </div>
                            <div className="mb-5">
                                <label htmlFor="edit_image" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Foto Produk (Opsional)</label>
                                <input
                                    type="file"
                                    id="edit_image"
                                    accept="image/*"
                                    onChange={(e) => setEditData('image', e.target.files[0])}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                />
                                {editErrors.image && <p className="text-rose-600 text-xs mt-1">{editErrors.image}</p>}
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
