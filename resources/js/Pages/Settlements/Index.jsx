import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/utils/format';
import Pagination from '@/Components/Pagination';
import FilterBar from '@/Components/FilterBar';
import SortableHeader from '@/Components/SortableHeader';
import DateRangeFilter from '@/Components/DateRangeFilter';



import { useDateFilter } from '@/hooks/useDateFilter';

export default function Index({ sellers = { data: [], links: [], total: 0 }, filters = {}, totalUnpaid = 0 }) {
    const [payModal, setPayModal] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [takeBackSeller, setTakeBackSeller] = useState(null);

    const filter = useDateFilter({
        initialStart: filters.start_date || '',
        initialEnd: filters.end_date || '',
        initialPreset: filters.preset || null,
        onNavigate: (start, end, preset) =>
            router.get(route('settlements.index'), { ...filters, start_date: start, end_date: end, preset: preset || null }),
    });



    const { data: payData, setData: setPayData, post: postPay, processing: payProcessing, reset: payReset, errors: payErrors } = useForm({
        seller_id: '',
        amount: '',
        notes: '',
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paySellerId = urlParams.get('pay_seller_id');
        if (paySellerId) {
            const sellerToPay = sellers.data.find(s => s.id == paySellerId);
            if (sellerToPay && sellerToPay.unpaid_amount > 0) {
                openPayModal(sellerToPay);
                
                // Optional: remove query param so it doesn't reopen on refresh
                window.history.replaceState(null, '', window.location.pathname);
            }
        }
    }, [sellers.data]);

    const openPayModal = (seller) => {
        setSelectedSeller(seller);
        setPayData({
            seller_id: seller.id,
            amount: seller.unpaid_amount,
            notes: `Pencairan dana untuk ${seller.name}`,
        });
        setPayModal(true);
    };

    const handleExportExcel = () => {
        window.location.href = route('settlements.index', { ...filters, start_date: filter.localStartDate, end_date: filter.localEndDate, export: 'xlsx' });
    };

    const handleExportPdf = () => {
        window.open(route('settlements.index', { ...filters, start_date: filter.localStartDate, end_date: filter.localEndDate, export: 'pdf' }), '_blank');
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



        return (
        <AuthenticatedLayout title="Pembayaran Penitip">
            <Head title="Pembayaran Penitip (Pencairan Dana)" />

            <div className="space-y-4">
                <div className="bg-primary-50 px-5 py-4 rounded-xl border border-primary-200 shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="text-sm md:text-base font-bold text-primary-900">Total Tanggungan (Belum Dibayar)</h3>
                        <p className="text-xs text-primary-700 mt-1">Total hutang ke semua siswa penitip yang belum dicairkan.</p>
                    </div>
                    <span className="text-xl md:text-2xl text-primary-700 font-black">
                        {formatRupiah(totalUnpaid)}
                    </span>
                </div>

                <DateRangeFilter {...filter} onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} />

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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-primary-600">
                                                {formatRupiah(seller.unpaid_amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center flex justify-center gap-2">
                                                {seller.unpaid_amount > 0 && (
                                                    <button
                                                        onClick={() => openPayModal(seller)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-primary-100 hover:bg-primary-200 text-primary-700 font-bold text-xs rounded transition"
                                                    >
                                                        Cairkan
                                                    </button>
                                                )}
                                                {seller.products && seller.products.length > 0 && (
                                                    <button
                                                        onClick={() => setTakeBackSeller(seller)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold text-xs rounded transition"
                                                    >
                                                        Ambil Sisa
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
                        
                        <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 mb-6 text-center">
                            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wider">Sisa Saldo Saat Ini</p>
                            <p className="text-2xl font-black text-primary-800 mt-1">{formatRupiah(selectedSeller.unpaid_amount)}</p>
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
                                        step="1"
                                        max={selectedSeller.unpaid_amount}
                                        value={payData.amount}
                                        onChange={(e) => setPayData('amount', e.target.value)}
                                        className="w-full px-4 py-3 text-lg font-bold text-center text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setPayData('amount', Math.min(selectedSeller.unpaid_amount, Number(payData.amount || 0) + 500))}
                                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex-shrink-0"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path></svg>
                                    </button>
                                </div>
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
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                ></textarea>
                            </div>
                            
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setPayModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition">
                                    Batal
                                </button>
                                <button type="submit" disabled={payProcessing} className="flex-1 py-3 bg-primary-600 text-white font-bold text-sm rounded-xl hover:bg-primary-700 transition disabled:opacity-50">
                                    {payProcessing ? 'Memproses...' : 'Proses Pencairan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {takeBackSeller && (
                <TakeBackModal seller={takeBackSeller} onClose={() => setTakeBackSeller(null)} />
            )}
        </AuthenticatedLayout>
    );
}

function TakeBackModal({ seller, onClose }) {
    // leave (disisakan) per product_id, default 0 = penitip ambil semua
    const [leaves, setLeaves] = useState({});
    const [saving, setSaving] = useState(false);

    const setLeave = (p, val) => {
        const n = Math.max(0, Math.min(p.stock, parseInt(val, 10) || 0));
        setLeaves((prev) => ({ ...prev, [p.id]: n }));
    };

    const items = seller.products.map((p) => ({ product_id: p.id, leave: leaves[p.id] ?? 0 }));

    const submit = () => {
        setSaving(true);
        router.post(
            route('consignments.takeback'),
            { items },
            {
                preserveScroll: true,
                onSuccess: onClose,
                onFinish: () => setSaving(false),
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-slate-900">Ambil Sisa Stok</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                    {seller.name} · {seller.class || '-'}. Isi kolom "Sisakan" kalau ada yang dititipkan lagi (default 0 = diambil semua).
                </p>

                <div className="overflow-y-auto -mx-2 px-2 flex-1">
                    <table className="min-w-full text-sm">
                        <thead className="sticky top-0 bg-white">
                            <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                                <th className="px-2 py-2 text-left font-bold">Produk</th>
                                <th className="px-2 py-2 text-center font-bold">Stok</th>
                                <th className="px-2 py-2 text-center font-bold">Sisakan</th>
                                <th className="px-2 py-2 text-center font-bold">Diambil</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {seller.products.map((p) => {
                                const leave = leaves[p.id] ?? 0;
                                const taken = Math.max(0, p.stock - leave);
                                return (
                                    <tr key={p.id}>
                                        <td className="px-2 py-2">
                                            <div className="font-semibold text-slate-800">{p.name}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">{p.code}</div>
                                        </td>
                                        <td className="px-2 py-2 text-center font-bold text-slate-700">{p.stock}</td>
                                        <td className="px-2 py-2 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max={p.stock}
                                                value={leaves[p.id] ?? 0}
                                                onChange={(e) => setLeave(p, e.target.value)}
                                                className="w-16 px-2 py-1.5 text-center font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </td>
                                        <td className="px-2 py-2 text-center font-bold text-amber-600">{taken}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex gap-3 mt-5 pt-4 border-t border-slate-100">
                    <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition">
                        Batal
                    </button>
                    <button onClick={submit} disabled={saving} className="flex-1 py-2.5 bg-amber-600 text-white font-bold text-sm rounded-xl hover:bg-amber-700 transition disabled:opacity-50">
                        {saving ? 'Memproses...' : 'Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
}
