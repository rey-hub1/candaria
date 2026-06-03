import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FilterBar from '@/Components/FilterBar';
import SortableHeader from '@/Components/SortableHeader';

export default function Index({ cashbooks = { data: [], links: [], total: 0 }, filters = {}, currentBalance = 0, totalDebit = 0, totalCredit = 0 }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        date: new Date().toISOString().split('T')[0],
        description: '',
        type: 'debit',
        amount: '',
    });

    const formatRupiah = (value) => {
        return 'Rp' + new Intl.NumberFormat('id-ID').format(value || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('cashbooks.store'), {
            onSuccess: () => reset('description', 'amount'),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus pencatatan kas manual ini?')) {
            router.delete(route('cashbooks.destroy', id));
        }
    };

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

    return (
        <AuthenticatedLayout title="Buku Kas & Mutasi Saldo">
            <Head title="Buku Kas & Mutasi Saldo" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                
                {/* Form Tambah Mutasi */}
                <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                    <h3 className="text-sm md:text-base font-bold text-slate-900 mb-4">Tambah Mutasi Manual</h3>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tanggal</label>
                            <input
                                type="date"
                                required
                                value={data.date}
                                onChange={e => setData('date', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            {errors.date && <p className="text-rose-600 text-xs mt-1">{errors.date}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tipe Mutasi</label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="type" 
                                        value="debit" 
                                        checked={data.type === 'debit'} 
                                        onChange={e => setData('type', e.target.value)} 
                                        className="text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm font-semibold text-emerald-700">Debit (Masuk)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="type" 
                                        value="credit" 
                                        checked={data.type === 'credit'} 
                                        onChange={e => setData('type', e.target.value)} 
                                        className="text-rose-600 focus:ring-rose-500"
                                    />
                                    <span className="text-sm font-semibold text-rose-700">Kredit (Keluar)</span>
                                </label>
                            </div>
                            {errors.type && <p className="text-rose-600 text-xs mt-1">{errors.type}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nominal (Rp)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                placeholder="Contoh: 50000"
                                value={data.amount}
                                onChange={e => setData('amount', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            {errors.amount && <p className="text-rose-600 text-xs mt-1">{errors.amount}</p>}
                        </div>

                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Keterangan / Deskripsi</label>
                            <textarea
                                required
                                rows="2"
                                placeholder="Contoh: Beli sabun cuci piring"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            ></textarea>
                            {errors.description && <p className="text-rose-600 text-xs mt-1">{errors.description}</p>}
                        </div>
                        
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Mutasi'}
                        </button>
                    </form>
                </div>

                {/* Buku Kas List */}
                <div className="lg:col-span-2 flex flex-col gap-4">

                    {/* Balance Cards */}
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Total Debit</p>
                            <p className="text-sm md:text-lg font-extrabold text-emerald-600 mt-1">{formatRupiah(totalDebit)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Total Kredit</p>
                            <p className="text-sm md:text-lg font-extrabold text-rose-600 mt-1">{formatRupiah(totalCredit)}</p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-200 rounded-full blur-xl opacity-50"></div>
                            <p className="text-[10px] md:text-xs font-bold text-emerald-700/70 uppercase tracking-wider relative z-10">Saldo Kas Saat Ini</p>
                            <p className="text-base md:text-2xl font-black text-emerald-800 mt-1 relative z-10">{formatRupiah(currentBalance)}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <FilterBar filters={filters} searchPlaceholder="Cari keterangan..." />
                        
                        <div className="flex gap-2 shrink-0">
                            <a 
                                href={route('cashbooks.index', { ...filters, export: 'pdf' })}
                                target="_blank"
                                className="inline-flex items-center px-4 py-2.5 bg-rose-50 text-rose-600 font-semibold text-xs rounded-lg border border-rose-200 hover:bg-rose-100 transition shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                Export PDF
                            </a>
                            <a 
                                href={route('cashbooks.index', { ...filters, export: 'xlsx' })}
                                target="_blank"
                                className="inline-flex items-center px-4 py-2.5 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-lg border border-emerald-200 hover:bg-emerald-100 transition shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                </svg>
                                Export Excel
                            </a>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <SortableHeader column="date" label="Tanggal" filters={filters} />
                                        <SortableHeader column="description" label="Keterangan" filters={filters} />
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Debit (Masuk)</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Kredit (Keluar)</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {cashbooks.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-400">
                                                Belum ada mutasi kas atau data tidak ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        cashbooks.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600">
                                                    {formatDate(item.date)}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="font-bold text-slate-900">{item.description}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                                                        {item.source === 'manual' ? 'Manual (Oleh ' + (item.user?.name || 'Kasir') + ')' : 
                                                         item.source === 'transaction' ? 'Penjualan Otomatis' : 'Pelunasan Otomatis'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-emerald-600">
                                                    {item.type === 'debit' ? formatRupiah(item.amount) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-rose-600">
                                                    {item.type === 'credit' ? formatRupiah(item.amount) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                    {item.source === 'manual' ? (
                                                        <button 
                                                            onClick={() => handleDelete(item.id)} 
                                                            className="inline-flex items-center px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded transition"
                                                        >
                                                            Hapus
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 font-semibold px-2 py-1 bg-slate-100 rounded">Auto</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <Pagination links={cashbooks.links} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
