import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FilterBar from '@/Components/FilterBar';
import SortableHeader from '@/Components/SortableHeader';

export default function Index({ sellers = { data: [], links: [], total: 0 }, filters = {}, totalUnpaid = 0 }) {
    const [payModal, setPayModal] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState(null);

    const { data: payData, setData: setPayData, post: postPay, processing: payProcessing, reset: payReset, errors: payErrors } = useForm({
        seller_id: '',
        amount: '',
        notes: '',
    });

    const openPayModal = (seller) => {
        setSelectedSeller(seller);
        setPayData({
            seller_id: seller.id,
            amount: seller.unpaid_amount,
            notes: `Pencairan dana untuk ${seller.name}`,
        });
        setPayModal(true);
    };

    const handlePaySubmit = (e) => {
        e.preventDefault();
        postPay(route('settlements.store'), {
            onSuccess: () => {
                setPayModal(false);
                setSelectedSeller(null);
                payReset();
            }
        });
    };

    const formatRupiah = (value) => {
        return 'Rp' + new Intl.NumberFormat('id-ID').format(value || 0);
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
        <AuthenticatedLayout title="Pembayaran Penitip">
            <Head title="Pembayaran Penitip (Pencairan Dana)" />

            <div className="space-y-4">
                <div className="bg-emerald-50 px-5 py-4 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="text-sm md:text-base font-bold text-emerald-900">Total Tanggungan (Belum Dibayar)</h3>
                        <p className="text-xs text-emerald-700 mt-1">Total hutang ke semua siswa penitip yang belum dicairkan.</p>
                    </div>
                    <span className="text-xl md:text-2xl text-emerald-700 font-black">
                        {formatRupiah(totalUnpaid)}
                    </span>
                </div>

                <FilterBar filters={filters} searchPlaceholder="Cari nama penitip..." />

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead>
                                <tr className="bg-slate-50">
                                    <SortableHeader column="name" label="Nama Penitip" filters={filters} />
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Total Omzet</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Sudah Dicairkan</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Sisa Saldo (Belum Dibayar)</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {sellers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-400">
                                            Tidak ada data siswa penitip ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    sellers.data.map((seller) => (
                                        <tr key={seller.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-slate-950 text-sm">{seller.name}</div>
                                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Kelas: {seller.class} | Telp: {seller.phone || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-slate-600">
                                                {formatRupiah(seller.total_earnings)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-rose-600">
                                                {formatRupiah(seller.total_paid)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-emerald-600">
                                                {formatRupiah(seller.unpaid_amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center flex justify-center gap-2">
                                                {seller.unpaid_amount > 0 && (
                                                    <button
                                                        onClick={() => openPayModal(seller)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold text-xs rounded transition"
                                                    >
                                                        Cairkan
                                                    </button>
                                                )}
                                                <Link
                                                    href={route('settlements.show', seller.id)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded transition"
                                                >
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination links={sellers.links} />
            </div>

            {/* Modal Cairkan Dana */}
            {payModal && selectedSeller && (
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
                            <p className="text-2xl font-black text-emerald-800 mt-1">{formatRupiah(selectedSeller.unpaid_amount)}</p>
                        </div>

                        <form onSubmit={handlePaySubmit}>
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Nominal yang Dibayarkan (Rp)
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max={selectedSeller.unpaid_amount}
                                    value={payData.amount}
                                    onChange={(e) => setPayData('amount', e.target.value)}
                                    className="w-full px-4 py-3 text-lg font-bold text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Anda bisa membayar sebagian (dicicil) atau bayar lunas seluruh saldo.</p>
                                {payErrors.amount && <p className="text-rose-600 text-xs mt-1">{payErrors.amount}</p>}
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
