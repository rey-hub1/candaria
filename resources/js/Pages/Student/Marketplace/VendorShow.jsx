import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/utils/format';
import { getCart, saveCart, cartItemKey, cartTotal } from '@/utils/cart';
import { Utensils, UtensilsCrossed, X } from 'lucide-react';

export default function VendorShow({ vendor }) {
    const [cart, setCart] = useState(null);
    const [activeItem, setActiveItem] = useState(null);
    const [qty, setQty] = useState(1);
    const [notes, setNotes] = useState('');
    const [cartOpen, setCartOpen] = useState(false);

    useEffect(() => {
        setCart(getCart());
    }, []);

    const grouped = (vendor.menu_items || []).reduce((acc, item) => {
        const cat = item.category || 'Lainnya';
        acc[cat] = acc[cat] || [];
        acc[cat].push(item);
        return acc;
    }, {});

    const openItem = (item) => {
        setActiveItem(item);
        setQty(1);
        setNotes('');
    };

    const addToCart = () => {
        let current = getCart();
        if (current && current.vendorId !== vendor.id) {
            if (!window.confirm('Keranjangmu berisi pesanan dari mitra lain. Ganti mitra dan kosongkan keranjang?')) {
                return;
            }
            current = null;
        }

        const unitPrice = Number(activeItem.price);
        const key = cartItemKey(activeItem.id, notes);

        const next = current || { vendorId: vendor.id, vendorSlug: vendor.slug, vendorName: vendor.name, items: [] };
        const existingIndex = next.items.findIndex((i) => i.key === key);

        if (existingIndex >= 0) {
            next.items[existingIndex].qty += qty;
            next.items[existingIndex].subtotal = next.items[existingIndex].qty * unitPrice;
        } else {
            next.items.push({
                key,
                menuItemId: activeItem.id,
                name: activeItem.name,
                unitPrice,
                qty,
                notes,
                subtotal: unitPrice * qty,
            });
        }

        saveCart(next);
        setCart(next);
        setActiveItem(null);
    };

    const updateQty = (key, delta) => {
        const next = { ...cart, items: cart.items.map((i) => i.key === key ? { ...i, qty: Math.max(1, i.qty + delta), subtotal: Math.max(1, i.qty + delta) * i.unitPrice } : i) };
        saveCart(next);
        setCart(next);
    };

    const removeItem = (key) => {
        const items = cart.items.filter((i) => i.key !== key);
        if (items.length === 0) {
            window.localStorage.removeItem('candaria_marketplace_cart');
            setCart(null);
            setCartOpen(false);
            return;
        }
        const next = { ...cart, items };
        saveCart(next);
        setCart(next);
    };

    const itemCount = cart ? cart.items.reduce((sum, i) => sum + i.qty, 0) : 0;

    return (
        <AuthenticatedLayout title={vendor.name}>
            <Head title={vendor.name} />

            <div className="mb-6 flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                    {vendor.logo_url ? (
                        <img src={vendor.logo_url} alt={vendor.name} className="w-full h-full object-cover" />
                    ) : (
                        <Utensils className="w-7 h-7 text-slate-400" />
                    )}
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">{vendor.name}</h1>
                    <p className="text-sm text-slate-500 capitalize">{vendor.category}</p>
                    <p className="text-xs mt-1">
                        <span className={`font-semibold ${vendor.is_open ? 'text-primary-600' : 'text-rose-600'}`}>
                            {vendor.is_open ? 'Buka' : 'Tutup'}
                        </span>
                    </p>
                </div>
            </div>

            {!vendor.is_open && (
                <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
                    Toko sedang tutup. Kamu masih bisa lihat menu, tapi belum bisa pesan sekarang.
                </div>
            )}

            {Object.keys(grouped).length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center text-sm text-slate-500">
                    Belum ada menu tersedia.
                </div>
            ) : (
                Object.entries(grouped).map(([cat, items]) => (
                    <div key={cat} className="mb-6">
                        <h2 className="text-sm font-bold text-slate-900 mb-2 capitalize">{cat}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => vendor.is_open && openItem(item)}
                                    disabled={!vendor.is_open}
                                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex gap-3 text-left hover:border-primary-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <div className="w-14 h-14 rounded-lg bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <UtensilsCrossed className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                                        {item.description && <p className="text-xs text-slate-500 truncate">{item.description}</p>}
                                        <p className="text-sm font-bold text-primary-600 mt-1">{formatRupiah(item.price)}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))
            )}

            {/* Floating cart bar */}
            {cart && cart.items.length > 0 && (
                <button
                    onClick={() => setCartOpen(true)}
                    className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg px-4 py-3 flex items-center justify-between font-semibold text-sm transition z-30"
                >
                    <span>{itemCount} item di keranjang</span>
                    <span>{formatRupiah(cartTotal(cart))}</span>
                </button>
            )}

            {/* Item modal */}
            {activeItem && (
                <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto">
                        <div className="p-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900">{activeItem.name}</h3>
                            {activeItem.description && <p className="text-sm text-slate-500 mt-1">{activeItem.description}</p>}
                            <p className="text-sm font-bold text-primary-600 mt-1">{formatRupiah(activeItem.price)}</p>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-900">Catatan (opsional)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    className="mt-1 w-full rounded-lg border-slate-200 text-sm focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="Mis. pedas, tanpa sambal, tambah keju, dll."
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-900">Jumlah</span>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-full border border-slate-200 text-slate-600 font-bold">-</button>
                                    <span className="w-6 text-center font-semibold">{qty}</span>
                                    <button onClick={() => setQty((q) => q + 1)} className="w-8 h-8 rounded-full border border-slate-200 text-slate-600 font-bold">+</button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 flex items-center gap-3">
                            <button onClick={() => setActiveItem(null)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600">
                                Batal
                            </button>
                            <button onClick={addToCart} className="flex-1 px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold">
                                Tambah · {formatRupiah(Number(activeItem.price) * qty)}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cart drawer */}
            {cartOpen && cart && (
                <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900">Keranjang · {cart.vendorName}</h3>
                            <button onClick={() => setCartOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {cart.items.map((item) => (
                                <div key={item.key} className="p-4 flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                                        {item.notes && <p className="text-xs text-slate-400 italic">"{item.notes}"</p>}
                                        <p className="text-sm font-bold text-primary-600 mt-1">{formatRupiah(item.subtotal)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={() => updateQty(item.key, -1)} className="w-7 h-7 rounded-full border border-slate-200 text-slate-600 font-bold text-sm">-</button>
                                        <span className="w-5 text-center text-sm font-semibold">{item.qty}</span>
                                        <button onClick={() => updateQty(item.key, 1)} className="w-7 h-7 rounded-full border border-slate-200 text-slate-600 font-bold text-sm">+</button>
                                        <button onClick={() => removeItem(item.key)} className="text-rose-500 text-xs font-semibold ml-1">Hapus</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-slate-900">Total</span>
                                <span className="font-bold text-primary-600">{formatRupiah(cartTotal(cart))}</span>
                            </div>
                            <button
                                onClick={() => router.visit(route('student.marketplace.checkout'))}
                                className="w-full px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold"
                            >
                                Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
