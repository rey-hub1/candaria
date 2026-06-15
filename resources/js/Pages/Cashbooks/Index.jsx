import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import Modal from '@/Components/Modal';
import { useDialog } from '@/hooks/useDialog';
import { formatRupiah } from '@/utils/format';
import FilterBar from '@/Components/FilterBar';
import SortableHeader from '@/Components/SortableHeader';
import { useDateFilter } from '@/hooks/useDateFilter';
import DateRangeFilter from '@/Components/DateRangeFilter';

const Pagination = ({ links = [] }) => {
    if (links.length <= 3) return null;
    return (
        <div className="flex flex-wrap gap-1 justify-center mt-4">
            {links.map((link, key) =>
                link.url === null ? (
                    <div key={key} className="px-3 py-1.5 text-xs text-slate-400 border border-slate-200 rounded-lg bg-slate-50"
                        dangerouslySetInnerHTML={{ __html: link.label }} />
                ) : (
                    <Link key={key} href={link.url}
                        className={`px-3 py-1.5 text-xs border rounded-lg transition ${
                            link.active
                                ? 'bg-primary-600 border-primary-600 text-white font-bold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }} />
                )
            )}
        </div>
    );
};

export default function Index({
    cashbooks = { data: [], links: [], total: 0 },
    filters = {},
    currentBalance = 0,
    totalDebit = 0,
    totalCredit = 0,
}) {
    const [addModal, setAddModal] = useState(false);
    const { dialog, confirm: openConfirm, alert: openAlert, dialogConfirm, dialogClose } = useDialog();
    const filter = useDateFilter({
        initialStart: filters.start_date || '',
        initialEnd: filters.end_date || '',
        initialPreset: filters.preset || null,
        onNavigate: (start, end, preset) =>
            router.get(route('cashbooks.index'), { ...filters, start_date: start, end_date: end, preset: preset || null }),
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        date: new Date().toISOString().split('T')[0],
        description: '',
        type: 'debit',
        amount: '',
    });


    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('cashbooks.store'), { onSuccess: () => { reset('description', 'amount'); setAddModal(false); } });
    };

    const handleDelete = (id) => {
        openConfirm({ message: 'Apakah Anda yakin ingin menghapus pencatatan kas manual ini?' }, () => router.delete(route('cashbooks.destroy', id)));
    };

    return (
        <AuthenticatedLayout title="Buku Kas & Mutasi Saldo">
            <Head title="Buku Kas & Mutasi Saldo" />

            <div className="flex flex-col gap-4 mb-6">

                {/* Buku Kas List */}
                <div className="flex flex-col gap-4">

                    {/* Balance Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                        <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center min-w-0">
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Total Debit</p>
                            <p className="text-sm md:text-lg font-extrabold text-primary-600 mt-1 truncate">{formatRupiah(totalDebit)}</p>
                        </div>
                        <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center min-w-0">
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Total Kredit</p>
                            <p className="text-sm md:text-lg font-extrabold text-rose-600 mt-1 truncate">{formatRupiah(totalCredit)}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1 bg-primary-50 p-3 md:p-4 rounded-xl border border-primary-200 shadow-sm flex flex-col justify-center relative overflow-hidden min-w-0">
                            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary-200 rounded-full blur-xl opacity-50" />
                            <p className="text-[10px] md:text-xs font-bold text-primary-700/70 uppercase tracking-wider relative z-10 truncate">Saldo Kas Saat Ini</p>
                            <p className="text-base md:text-2xl font-black text-primary-800 mt-1 relative z-10 truncate">{formatRupiah(currentBalance)}</p>
                        </div>
                    </div>

                    <DateRangeFilter 
                        {...filter} 
                        onExportExcel={() => window.location.href = route('cashbooks.index', { ...filters, export: 'xlsx' })}
                        onExportPdf={() => window.open(route('cashbooks.index', { ...filters, export: 'pdf' }), '_blank')}
                    />

                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <FilterBar filters={filters} searchPlaceholder="Cari keterangan..." />

                        <div className="flex gap-2 shrink-0">
                            <button onClick={() => setAddModal(true)}
                                className="inline-flex items-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm transition">
                                <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Tambah Mutasi
                            </button>
                        </div>
                    </div>

                    {cashbooks.data.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-12 text-center text-sm text-slate-400">
                            Belum ada mutasi kas atau data tidak ditemukan.
                        </div>
                    ) : (
                        <>
                            {/* Mobile View: Card Stack */}
                            <div className="grid grid-cols-1 gap-3 md:hidden">
                                {cashbooks.data.map((item) => (
                                    <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="font-bold text-slate-900 text-sm">{item.description}</div>
                                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{formatDate(item.date)}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                                            {item.source === 'manual'
                                                ? 'Manual (Oleh ' + (item.user?.name || 'Kasir') + ')'
                                                : item.source === 'transaction'
                                                    ? 'Penjualan Otomatis'
                                                    : 'Pelunasan Otomatis'}
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                            {item.type === 'debit' ? (
                                                <span className="text-sm font-extrabold text-primary-600">+ {formatRupiah(item.amount)}</span>
                                            ) : (
                                                <span className="text-sm font-extrabold text-rose-600">- {formatRupiah(item.amount)}</span>
                                            )}
                                            {item.source === 'manual' ? (
                                                <button onClick={() => handleDelete(item.id)}
                                                    className="inline-flex items-center px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded transition">
                                                    Hapus
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 font-semibold px-2 py-1 bg-slate-100 rounded">Auto</span>
                                            )}
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
                                                <SortableHeader column="date" label="Tanggal" filters={filters} />
                                                <SortableHeader column="description" label="Keterangan" filters={filters} />
                                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Debit (Masuk)</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Kredit (Keluar)</th>
                                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {cashbooks.data.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50 transition">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600">
                                                        {formatDate(item.date)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="font-bold text-slate-900">{item.description}</div>
                                                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                                                            {item.source === 'manual'
                                                                ? 'Manual (Oleh ' + (item.user?.name || 'Kasir') + ')'
                                                                : item.source === 'transaction'
                                                                    ? 'Penjualan Otomatis'
                                                                    : 'Pelunasan Otomatis'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-primary-600">
                                                        {item.type === 'debit' ? formatRupiah(item.amount) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-rose-600">
                                                        {item.type === 'credit' ? formatRupiah(item.amount) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                        {item.source === 'manual' ? (
                                                            <button onClick={() => handleDelete(item.id)}
                                                                className="inline-flex items-center px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded transition">
                                                                Hapus
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400 font-semibold px-2 py-1 bg-slate-100 rounded">Auto</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    <Pagination links={cashbooks.links} />
                </div>
            </div>

            {/* Modal Tambah Mutasi */}
            <Modal show={addModal} onClose={() => { setAddModal(false); reset('description', 'amount'); }} maxWidth="lg">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">Tambah Mutasi Manual</h3>
                    <button onClick={() => { setAddModal(false); reset('description', 'amount'); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tanggal</label>
                        <input type="date" required value={data.date} onChange={e => setData('date', e.target.value)}
                            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        {errors.date && <p className="text-rose-600 text-xs mt-1">{errors.date}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tipe Mutasi</label>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="type" value="debit" checked={data.type === 'debit'}
                                    onChange={e => setData('type', e.target.value)} className="text-primary-600 focus:ring-primary-500" />
                                <span className="text-sm font-semibold text-primary-700">Debit (Masuk)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="type" value="credit" checked={data.type === 'credit'}
                                    onChange={e => setData('type', e.target.value)} className="text-rose-600 focus:ring-rose-500" />
                                <span className="text-sm font-semibold text-rose-700">Kredit (Keluar)</span>
                            </label>
                        </div>
                        {errors.type && <p className="text-rose-600 text-xs mt-1">{errors.type}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nominal (Rp)</label>
                        <input type="number" required min="1" placeholder="Contoh: 50000" value={data.amount}
                            onChange={e => setData('amount', e.target.value)}
                            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        {errors.amount && <p className="text-rose-600 text-xs mt-1">{errors.amount}</p>}
                    </div>

                    <div className="mb-5">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Keterangan / Deskripsi</label>
                        <textarea required rows="2" placeholder="Contoh: Beli sabun cuci piring" value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                        {errors.description && <p className="text-rose-600 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <button type="submit" disabled={processing}
                        className="w-full px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50">
                        {processing ? 'Menyimpan...' : 'Simpan Mutasi'}
                    </button>
                </form>
            </Modal>

            <ConfirmModal {...dialog} onConfirm={dialogConfirm} onClose={dialogClose} />
        </AuthenticatedLayout>
    );
}
