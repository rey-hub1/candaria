import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { formatRupiah } from '@/utils/format';
import Pagination from '@/Components/Pagination';
import SortableHeader from '@/Components/SortableHeader';
import DownloadMenu from '@/Components/DownloadMenu';

export default function Index({ transactions = { data: [], links: [], total: 0 }, filters = {}, cashiers = [] }) {
    const [voidingId, setVoidingId] = React.useState(null);
    const [voidTarget, setVoidTarget] = React.useState(null);
    const [voidReason, setVoidReason] = React.useState('');
    const [expandedId, setExpandedId] = React.useState(null);

    // ── Filtering ──────────────────────────────────────────────
    const pushFilter = (patch) => {
        const query = { ...filters, ...patch };
        Object.keys(query).forEach((k) => {
            if (query[k] === '' || query[k] == null) delete query[k];
        });
        router.get(window.location.pathname, query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const debouncedFilter = (key, value) => {
        clearTimeout(window.__txnFilterTimeout);
        window.__txnFilterTimeout = setTimeout(() => pushFilter({ [key]: value }), 350);
    };

    const hasActiveFilters = ['search', 'start_date', 'end_date', 'status', 'cashier_id', 'min_amount', 'max_amount']
        .some((k) => filters[k]);

    const exportUrl = (format) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
        params.set('export', format);
        return `${window.location.pathname}?${params.toString()}`;
    };

    // ── Void ───────────────────────────────────────────────────
    const formatDate = (dateString, withDay = false) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return withDay
            ? `${day} ${month} ${year} ${hours}:${minutes}`
            : `${day}/${String(date.getMonth() + 1).padStart(2, '0')}/${year} ${hours}:${minutes}`;
    };

    const requestVoid = (t) => {
        if (t.status === 'voided') return;
        setVoidReason('');
        setVoidTarget(t);
    };

    const confirmVoid = () => {
        const t = voidTarget;
        if (!t) return;
        setVoidTarget(null);
        setVoidingId(t.id);
        router.delete(route('transactions.destroy', t.id), {
            data: { reason: voidReason },
            preserveScroll: true,
            onFinish: () => setVoidingId(null),
        });
    };

    const toggleExpand = (id) => setExpandedId((cur) => (cur === id ? null : id));

    const VoidedBadge = () => (
        <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-700 font-bold rounded-full uppercase tracking-wide">Dibatalkan</span>
    );

    const inputCls = "px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white";

    // Item detail block (shared mobile + desktop)
    const ItemDetail = ({ t }) => (
        <div className="space-y-2">
            {t.items?.length ? (
                <table className="w-full text-xs">
                    <thead>
                        <tr className="text-slate-400 text-left">
                            <th className="py-1 font-semibold">Produk</th>
                            <th className="py-1 font-semibold text-center w-12">Qty</th>
                            <th className="py-1 font-semibold text-right">Harga</th>
                            <th className="py-1 font-semibold text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {t.items.map((it) => (
                            <tr key={it.id} className="border-t border-slate-100">
                                <td className="py-1.5 text-slate-700 font-medium">{it.product?.name ?? '(produk dihapus)'}</td>
                                <td className="py-1.5 text-center text-slate-500">{it.quantity}</td>
                                <td className="py-1.5 text-right text-slate-500">{formatRupiah(it.selling_price)}</td>
                                <td className="py-1.5 text-right font-semibold text-slate-700">{formatRupiah(it.selling_price * it.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-xs text-slate-400">Tidak ada item.</p>
            )}
            {t.change_debt && (
                <div className="text-[11px] bg-amber-50 text-amber-700 rounded-lg px-3 py-2 border border-amber-100">
                    Titip kembalian {formatRupiah(t.change_debt.amount)}
                    {t.change_debt.customer_name ? ` — ${t.change_debt.customer_name}` : ''}
                    <span className="font-semibold"> ({t.change_debt.status === 'paid' ? 'lunas' : 'belum lunas'})</span>
                </div>
            )}
            {t.status === 'voided' && t.void_reason && (
                <p className="text-[11px] text-rose-600">Alasan batal: {t.void_reason}</p>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout title="Riwayat Transaksi">
            <Head title="Riwayat Transaksi" />

            <div className="space-y-4">
                {/* ── Filter panel ── */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex flex-col lg:flex-row gap-3">
                        <input
                            type="text"
                            defaultValue={filters.search || ''}
                            onChange={(e) => debouncedFilter('search', e.target.value)}
                            placeholder="Cari kode transaksi..."
                            className={`${inputCls} w-full lg:flex-1`}
                        />
                        <div className="flex gap-2 items-center">
                            <input type="date" value={filters.start_date || ''} onChange={(e) => pushFilter({ start_date: e.target.value })} className={`${inputCls} w-full`} />
                            <span className="text-slate-400 text-sm">s/d</span>
                            <input type="date" value={filters.end_date || ''} onChange={(e) => pushFilter({ end_date: e.target.value })} className={`${inputCls} w-full`} />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        <select value={filters.status || ''} onChange={(e) => pushFilter({ status: e.target.value })} className={inputCls}>
                            <option value="">Semua Status</option>
                            <option value="completed">Selesai</option>
                            <option value="voided">Dibatalkan</option>
                        </select>

                        <select value={filters.cashier_id || ''} onChange={(e) => pushFilter({ cashier_id: e.target.value })} className={inputCls}>
                            <option value="">Semua Kasir</option>
                            {cashiers.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

                        <div className="flex gap-2 items-center">
                            <input type="number" min="0" defaultValue={filters.min_amount || ''} onChange={(e) => debouncedFilter('min_amount', e.target.value)} placeholder="Min Rp" className={`${inputCls} w-28`} />
                            <span className="text-slate-400 text-sm">–</span>
                            <input type="number" min="0" defaultValue={filters.max_amount || ''} onChange={(e) => debouncedFilter('max_amount', e.target.value)} placeholder="Max Rp" className={`${inputCls} w-28`} />
                        </div>

                        {hasActiveFilters && (
                            <button onClick={() => router.get(window.location.pathname)} className="px-3 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
                                Reset
                            </button>
                        )}

                        <div className="ml-auto">
                            <DownloadMenu
                                onExportExcel={() => { window.location.href = exportUrl('xlsx'); }}
                                onExportPdf={() => { window.open(exportUrl('pdf'), '_blank'); }}
                                label="Unduh"
                            />
                        </div>
                    </div>
                </div>

                {/* Header panel */}
                <div className="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <h3 className="text-sm md:text-base font-bold text-slate-900">Daftar Transaksi Kantin</h3>
                    <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-full">
                        Total: {transactions.total} Transaksi
                    </span>
                </div>

                {transactions.data.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                        Belum ada transaksi yang tercatat atau cocok dengan pencarian.
                    </div>
                ) : (
                    <>
                        {/* Mobile View: Card Stack */}
                        <div className="grid grid-cols-1 gap-3 md:hidden">
                            {transactions.data.map((t) => (
                                <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-950 font-mono text-sm flex items-center gap-2">
                                            {t.transaction_code}
                                            {t.status === 'voided' && <VoidedBadge />}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium">{formatDate(t.created_at)}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-xs py-2 border-y border-slate-100">
                                        <div>
                                            <p className="text-slate-400 font-semibold">Petugas Kasir</p>
                                            <p className="font-bold text-slate-700 mt-0.5">{t.user?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-400 font-semibold">Total Belanja</p>
                                            <p className="font-extrabold text-slate-900 text-sm mt-0.5">{formatRupiah(t.total_amount)}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                                        <span>Tunai: {formatRupiah(t.paid_amount)}</span>
                                        <span className="text-primary-600 font-bold">Kembalian: {formatRupiah(t.change_amount)}</span>
                                    </div>

                                    <button onClick={() => toggleExpand(t.id)} className="w-full text-center py-1.5 text-xs font-semibold text-primary-600 hover:bg-primary-50 rounded-lg transition">
                                        {expandedId === t.id ? 'Sembunyikan Item ▲' : 'Lihat Item ▼'}
                                    </button>
                                    {expandedId === t.id && (
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <ItemDetail t={t} />
                                        </div>
                                    )}

                                    <div className="pt-1 flex gap-3">
                                        <Link href={route('transactions.show', t.id)} className="flex-1 text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition">
                                            Lihat Struk
                                        </Link>
                                        {t.status !== 'voided' && (
                                            <button onClick={() => requestVoid(t)} disabled={voidingId === t.id} className="flex-1 text-center py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-lg transition disabled:opacity-50">
                                                {voidingId === t.id ? 'Membatalkan...' : 'Batal'}
                                            </button>
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
                                            <th className="w-10 px-3 py-3"></th>
                                            <SortableHeader column="transaction_code" label="Kode Transaksi" filters={filters} />
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Kasir / Petugas</th>
                                            <SortableHeader column="created_at" label="Tanggal & Waktu" filters={filters} />
                                            <SortableHeader column="total_amount" label="Total Belanja" filters={filters} className="text-right" />
                                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Uang Bayar</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Kembalian</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {transactions.data.map((t) => (
                                            <React.Fragment key={t.id}>
                                                <tr className={`transition ${t.status === 'voided' ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-slate-50'}`}>
                                                    <td className="px-3 py-4 text-center">
                                                        <button onClick={() => toggleExpand(t.id)} className="text-slate-400 hover:text-primary-600 transition" title="Lihat item">
                                                            <svg className={`w-4 h-4 transition-transform ${expandedId === t.id ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-950 font-mono">
                                                        <span className="flex items-center gap-2">
                                                            <span className={t.status === 'voided' ? 'line-through text-slate-400' : ''}>{t.transaction_code}</span>
                                                            {t.status === 'voided' && <VoidedBadge />}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{t.user?.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(t.created_at, true)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-slate-950">{formatRupiah(t.total_amount)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600">{formatRupiah(t.paid_amount)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-primary-600 font-semibold">{formatRupiah(t.change_amount)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <Link href={route('transactions.show', t.id)} className="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded transition">
                                                                Struk
                                                            </Link>
                                                            {t.status !== 'voided' && (
                                                                <button onClick={() => requestVoid(t)} disabled={voidingId === t.id} className="inline-flex items-center px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-xs rounded transition disabled:opacity-50">
                                                                    {voidingId === t.id ? 'Membatalkan...' : 'Batal'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedId === t.id && (
                                                    <tr className="bg-slate-50/70">
                                                        <td></td>
                                                        <td colSpan={7} className="px-6 py-4">
                                                            <ItemDetail t={t} />
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <Pagination links={transactions.links} />
                    </>
                )}
            </div>

            <Modal show={!!voidTarget} maxWidth="sm" onClose={() => setVoidTarget(null)} closeable>
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-5">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-rose-100">
                            <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div className="pt-0.5">
                            <h3 className="text-base font-bold text-slate-900 mb-1">Batalkan Transaksi</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Yakin batalkan transaksi {voidTarget?.transaction_code}? Stok produk akan dikembalikan.
                            </p>
                        </div>
                    </div>

                    <label htmlFor="void_reason" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Alasan Pembatalan (opsional)
                    </label>
                    <textarea
                        id="void_reason"
                        rows={3}
                        value={voidReason}
                        onChange={(e) => setVoidReason(e.target.value)}
                        placeholder="Contoh: Salah input pesanan..."
                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />

                    <div className="flex gap-3 justify-end pt-5 mt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setVoidTarget(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
                            Batal
                        </button>
                        <button type="button" onClick={confirmVoid} className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition">
                            Ya, Batalkan Transaksi
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
