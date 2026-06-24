import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/utils/format';

// Normalisasi nomor lokal (08xx) ke format wa.me (62xx)
function waLink(phone) {
    if (!phone) return null;
    let p = String(phone).replace(/\D/g, '');
    if (p.startsWith('0')) p = '62' + p.slice(1);
    else if (!p.startsWith('62')) p = '62' + p;
    return `https://wa.me/${p}`;
}

function WhatsappIcon({ className = 'w-3.5 h-3.5' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.045zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
    );
}

function SellerCard({ seller }) {
    // penyesuaian bertanda per product_id (+ nambah, − ngurangi)
    const [adj, setAdj] = useState({});
    const [savingId, setSavingId] = useState(null);
    const [takeBackProduct, setTakeBackProduct] = useState(null);

    // clamp delta supaya stok hasil tak negatif (delta >= -stock)
    const setVal = (pid, stock, val) => {
        if (val === '' || val === '-') {
            setAdj((prev) => ({ ...prev, [pid]: val }));
            return;
        }
        const n = Math.max(-stock, parseInt(val, 10) || 0);
        setAdj((prev) => ({ ...prev, [pid]: n }));
    };

    const bump = (pid, stock, step) => {
        setAdj((prev) => {
            const cur = parseInt(prev[pid], 10) || 0;
            return { ...prev, [pid]: Math.max(-stock, cur + step) };
        });
    };

    const saveRow = (p) => {
        const delta = parseInt(adj[p.id], 10) || 0;
        if (delta === 0) return;
        setSavingId(p.id);
        router.post(
            route('consignments.intake'),
            { items: [{ product_id: p.id, delta }] },
            {
                preserveScroll: true,
                onSuccess: () => setAdj((prev) => ({ ...prev, [p.id]: '' })),
                onFinish: () => setSavingId(null),
            }
        );
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                <div>
                    <h3 className="font-bold text-slate-900 text-sm">{seller.name}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Kelas: {seller.class || '-'} | Telp: {seller.phone || '-'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {seller.phone && (
                        <a
                            href={waLink(seller.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Chat ${seller.name} via WhatsApp`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-xs rounded-lg transition"
                        >
                            <WhatsappIcon />
                            WhatsApp
                        </a>
                    )}
                    <Link
                        href={route('settlements.index', { pay_seller_id: seller.id })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold text-xs rounded-lg transition"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        Bayar
                    </Link>
                </div>
            </div>

            {/* Tabel produk */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead>
                        <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                            <th className="px-4 py-2 text-left font-bold">Produk</th>
                            <th className="px-3 py-2 text-center font-bold">Stok Awal</th>
                            <th className="px-3 py-2 text-center font-bold">Penyesuaian</th>
                            <th className="px-3 py-2 text-center font-bold">Total</th>
                            <th className="px-3 py-2 text-center font-bold">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {seller.products.map((p) => {
                            const delta = parseInt(adj[p.id], 10) || 0;
                            const total = Math.max(0, p.stock + delta);
                            const dirty = delta !== 0;
                            return (
                                <tr key={p.id} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-2">
                                        <div className="font-semibold text-slate-800">{p.name}</div>
                                        <div className="text-[10px] text-slate-400 font-mono">
                                            {p.code} · {formatRupiah(p.cost_price)}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-center font-bold text-slate-700">{p.stock}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => bump(p.id, p.stock, -1)}
                                                className="w-7 h-7 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 font-bold flex items-center justify-center shrink-0"
                                            >
                                                −
                                            </button>
                                            <input
                                                type="number"
                                                value={adj[p.id] ?? ''}
                                                placeholder="0"
                                                onChange={(e) => setVal(p.id, p.stock, e.target.value)}
                                                className={`w-16 px-2 py-1.5 text-center font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                                    delta < 0 ? 'text-rose-600 border-rose-200' : delta > 0 ? 'text-primary-600 border-primary-200' : 'text-slate-900 border-slate-200'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => bump(p.id, p.stock, 1)}
                                                className="w-7 h-7 rounded-lg bg-primary-100 hover:bg-primary-200 text-primary-700 font-bold flex items-center justify-center shrink-0"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`font-bold ${dirty ? (delta < 0 ? 'text-rose-600' : 'text-primary-600') : 'text-slate-400'}`}>
                                            {total}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => saveRow(p)}
                                                disabled={!dirty || savingId === p.id}
                                                className="px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                {savingId === p.id ? '...' : 'Simpan'}
                                            </button>
                                            {p.stock > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setTakeBackProduct(p)}
                                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-semibold rounded transition whitespace-nowrap"
                                                >
                                                    Ambil Sisa
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {takeBackProduct && (
                <TakeBackModal product={takeBackProduct} onClose={() => setTakeBackProduct(null)} />
            )}
        </div>
    );
}

function TakeBackModal({ product, onClose }) {
    const [leave, setLeave] = useState(0);
    const [saving, setSaving] = useState(false);

    const taken = Math.max(0, product.stock - (parseInt(leave, 10) || 0));

    const submit = () => {
        setSaving(true);
        router.post(
            route('consignments.takeback'),
            { product_id: product.id, leave: parseInt(leave, 10) || 0 },
            {
                preserveScroll: true,
                onSuccess: onClose,
                onFinish: () => setSaving(false),
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">Ambil Sisa</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-sm text-slate-600 mb-1">{product.name}</p>
                <p className="text-xs text-slate-400 mb-4">Stok saat ini: <b className="text-slate-700">{product.stock}</b></p>

                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Dititipkan / Disisakan (carry ke besok)
                </label>
                <input
                    type="number"
                    min="0"
                    max={product.stock}
                    value={leave}
                    onChange={(e) => setLeave(Math.max(0, Math.min(product.stock, parseInt(e.target.value, 10) || 0)))}
                    className="w-full px-4 py-3 text-lg font-bold text-center text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                />
                <p className="text-xs text-slate-500 mb-5">
                    Penitip bawa pulang: <b className="text-amber-600">{taken}</b> unit · sisa di kantin: <b className="text-slate-700">{parseInt(leave, 10) || 0}</b>
                </p>

                <div className="flex gap-3">
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

export default function Index({ sellers = [] }) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return sellers;
        const q = search.toLowerCase();
        return sellers.filter(
            (s) => s.name.toLowerCase().includes(q) || (s.class || '').toLowerCase().includes(q)
        );
    }, [search, sellers]);

    return (
        <AuthenticatedLayout title="Stok Titipan Harian">
            <Head title="Stok Titipan Harian" />

            <div className="space-y-4">
                {/* Header */}
                <div className="bg-primary-50 px-5 py-4 rounded-xl border border-primary-200 shadow-sm">
                    <h3 className="text-sm md:text-base font-bold text-primary-900">Penerimaan Titipan Pagi</h3>
                    <p className="text-xs text-primary-700 mt-1">
                        Pilih penitip, ketik jumlah titipan baru tiap produk, lalu simpan sekali. Sore: pakai "Ambil Sisa" saat penitip bawa pulang sisa. Pembayaran ada di tombol "Bayar".
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama penitip atau kelas..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>

                {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 py-16 text-center text-sm text-slate-400">
                        Tidak ada penitip dengan produk titipan.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((seller) => (
                            <SellerCard key={seller.id} seller={seller} />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
