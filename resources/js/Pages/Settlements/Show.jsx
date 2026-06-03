import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ seller, ledger = [] }) {
    const [payModal, setPayModal] = useState(false);

    const { data: payData, setData: setPayData, post: postPay, processing: payProcessing, reset: payReset, errors } = useForm({
        seller_id: seller.id,
        amount: seller.unpaid_amount, // Default to full unpaid amount
        notes: `Pencairan dana untuk ${seller.name}`,
    });

    const formatRupiah = (value) => {
        return 'Rp' + new Intl.NumberFormat('id-ID').format(value || 0);
    };

    const formatDate = (dateString, withTime = true) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        if (!withTime) return `${day}/${month}/${year}`;
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const handlePaySubmit = (e) => {
        e.preventDefault();
        postPay(route('settlements.store'), {
            onSuccess: () => {
                setPayModal(false);
                payReset('notes');
                payData.amount = 0; // will be updated by fresh props anyway
            }
        });
    };

    const openPayModal = () => {
        setPayData('amount', seller.unpaid_amount);
        setPayModal(true);
    };

    return (
        <AuthenticatedLayout title={`Mutasi & Pencairan: ${seller.name}`}>
            <Head title={`Buku Tabungan - ${seller.name}`} />

            <div className="mb-4">
                <Link href={route('settlements.index')} className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1">
                    &larr; Kembali ke Daftar Penitip
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Saldo Information Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{seller.name}</h2>
                        <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{seller.class}</p>
                        
                        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-slate-500">Total Penjualan</span>
                                <span className="text-sm font-bold text-slate-900">{formatRupiah(seller.total_earnings)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-slate-500">Sudah Dicairkan</span>
                                <span className="text-sm font-bold text-rose-600">-{formatRupiah(seller.total_paid)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg mt-2">
                                <span className="text-sm font-bold text-slate-700">Sisa Saldo</span>
                                <span className="text-lg font-black text-emerald-600">{formatRupiah(seller.unpaid_amount)}</span>
                            </div>
                        </div>

                        {seller.unpaid_amount > 0 && (
                            <button
                                onClick={openPayModal}
                                className="w-full mt-6 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition"
                            >
                                Cairkan Dana (Bayar)
                            </button>
                        )}
                    </div>
                </div>

                {/* Ledger (Mutasi) List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Mutasi Buku Tabungan Siswa</h3>
                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
                                {ledger.length} Riwayat
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead>
                                    <tr>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal & Waktu</th>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keterangan</th>
                                        <th className="px-5 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Penjualan (+)</th>
                                        <th className="px-5 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pencairan (-)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {ledger.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-sm text-slate-400">
                                                Belum ada histori penjualan atau pencairan untuk siswa ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        ledger.map((entry, index) => (
                                            <tr key={index} className="hover:bg-slate-50 transition">
                                                <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                                                    {formatDate(entry.created_at)}
                                                </td>
                                                <td className="px-5 py-3 text-xs">
                                                    {entry.type === 'sale' ? (
                                                        <div>
                                                            <span className="font-bold text-slate-900">{entry.product?.name || 'Produk Dihapus'}</span>
                                                            <span className="text-slate-500 ml-1">x{entry.quantity}</span>
                                                            <div className="text-[9px] text-slate-400 mt-0.5">TRX: {entry.transaction?.transaction_code || '-'}</div>
                                                        </div>
                                                    ) : (
                                                        <div className="font-bold text-rose-600">
                                                            {entry.notes || 'Pencairan Dana'}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 whitespace-nowrap text-right text-xs font-bold text-emerald-600">
                                                    {entry.type === 'sale' ? '+' + formatRupiah(entry.amount) : '-'}
                                                </td>
                                                <td className="px-5 py-3 whitespace-nowrap text-right text-xs font-bold text-rose-600">
                                                    {entry.type === 'payout' ? '-' + formatRupiah(entry.amount) : '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Cairkan Dana */}
            {payModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Cairkan Dana (Bayar)</h3>
                            <button onClick={() => setPayModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-6 text-center">
                            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Sisa Saldo Saat Ini</p>
                            <p className="text-2xl font-black text-emerald-800 mt-1">{formatRupiah(seller.unpaid_amount)}</p>
                        </div>

                        <form onSubmit={handlePaySubmit}>
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Nominal yang Dibayarkan (Rp)
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPayData('amount', Math.max(1, Number(payData.amount || 0) - 500))}
                                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex-shrink-0"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15"></path></svg>
                                    </button>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        step="500"
                                        max={seller.unpaid_amount}
                                        value={payData.amount}
                                        onChange={(e) => setPayData('amount', e.target.value)}
                                        className="w-full px-4 py-3 text-lg font-bold text-center text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setPayData('amount', Math.min(seller.unpaid_amount, Number(payData.amount || 0) + 500))}
                                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex-shrink-0"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path></svg>
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">Anda bisa membayar sebagian (dicicil) atau bayar lunas seluruh saldo.</p>
                                {errors.amount && <p className="text-rose-600 text-xs mt-1">{errors.amount}</p>}
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Catatan / Keterangan Tambahan
                                </label>
                                <textarea
                                    rows="2"
                                    value={payData.notes}
                                    onChange={(e) => setPayData('notes', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                ></textarea>
                            </div>
                            
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setPayModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition">
                                    Batal
                                </button>
                                <button type="submit" disabled={payProcessing} className="flex-1 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition disabled:opacity-50">
                                    {payProcessing ? 'Memproses...' : 'Proses Pencairan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
