import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/utils/format';
import { getCart, clearCart, cartTotal } from '@/utils/cart';

export default function Checkout({ slots, now, paymentQrisEnabled }) {
    const [cart, setCart] = useState(undefined);
    const [slot, setSlot] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setCart(getCart());
    }, []);

    const slotAvailable = (key) => slots[key].enabled && now <= slots[key].cutoff;

    useEffect(() => {
        if (slotAvailable('09:00')) setSlot('09:00');
        else if (slotAvailable('12:00')) setSlot('12:00');
    }, []);

    if (cart === undefined) return null;

    if (!cart || cart.items.length === 0) {
        return (
            <AuthenticatedLayout title="Checkout">
                <Head title="Checkout" />
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center text-sm text-slate-500">
                    Keranjangmu masih kosong.
                </div>
            </AuthenticatedLayout>
        );
    }

    const submit = () => {
        if (!slot) {
            setErrors({ delivery_slot: 'Pilih jadwal antar.' });
            return;
        }

        setProcessing(true);
        router.post(route('student.orders.store'), {
            vendor_id: cart.vendorId,
            delivery_slot: slot,
            payment_method: paymentMethod,
            notes,
            items: cart.items.map((item) => ({
                menu_item_id: item.menuItemId,
                qty: item.qty,
                notes: item.notes || null,
                option_ids: item.options.map((o) => o.optionId),
            })),
        }, {
            onSuccess: () => clearCart(),
            onError: (errs) => setErrors(errs),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout title="Checkout">
            <Head title="Checkout" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Checkout</h1>
                <p className="text-sm text-slate-500 mt-1">{cart.vendorName}</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
                <h2 className="text-sm font-bold text-slate-900 mb-3">Ringkasan Pesanan</h2>
                <div className="divide-y divide-slate-100">
                    {cart.items.map((item) => (
                        <div key={item.key} className="py-2 flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{item.qty}x {item.name}</p>
                                {item.options.length > 0 && (
                                    <p className="text-xs text-slate-500">{item.options.map((o) => o.optionName).join(', ')}</p>
                                )}
                                {item.notes && <p className="text-xs text-slate-400 italic">"{item.notes}"</p>}
                            </div>
                            <p className="text-sm font-semibold text-slate-900 shrink-0">{formatRupiah(item.subtotal)}</p>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-bold text-emerald-600">{formatRupiah(cartTotal(cart))}</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
                <h2 className="text-sm font-bold text-slate-900 mb-3">Jadwal Antar</h2>
                <div className="space-y-2">
                    {['09:00', '12:00'].map((key) => {
                        const available = slotAvailable(key);
                        return (
                            <label key={key} className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border ${available ? 'border-slate-200 cursor-pointer hover:border-emerald-300' : 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-60'}`}>
                                <span className="flex items-center gap-2 text-sm text-slate-700">
                                    <input
                                        type="radio"
                                        name="slot"
                                        checked={slot === key}
                                        disabled={!available}
                                        onChange={() => setSlot(key)}
                                        className="accent-emerald-600"
                                    />
                                    Jam {key}
                                </span>
                                {!available && (
                                    <span className="text-xs text-rose-500">
                                        {!slots[key].enabled ? 'Tidak tersedia' : `Ditutup (batas ${slots[key].cutoff})`}
                                    </span>
                                )}
                            </label>
                        );
                    })}
                </div>
                {errors.delivery_slot && <p className="text-sm text-rose-600 mt-2">{errors.delivery_slot}</p>}
                {!slotAvailable('09:00') && !slotAvailable('12:00') && (
                    <p className="text-sm text-amber-600 mt-2">Pemesanan untuk hari ini sudah ditutup.</p>
                )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
                <h2 className="text-sm font-bold text-slate-900 mb-3">Pembayaran</h2>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 cursor-pointer hover:border-emerald-300 text-sm text-slate-700">
                        <input type="radio" name="payment" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="accent-emerald-600" />
                        Bayar Tunai di Tempat
                    </label>
                    <label className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm ${paymentQrisEnabled ? 'border-slate-200 cursor-pointer hover:border-emerald-300 text-slate-700' : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'}`}>
                        <input type="radio" name="payment" checked={paymentMethod === 'qris'} disabled={!paymentQrisEnabled} onChange={() => setPaymentMethod('qris')} className="accent-emerald-600" />
                        QRIS {!paymentQrisEnabled && '(belum tersedia)'}
                    </label>
                </div>
                {errors.payment_method && <p className="text-sm text-rose-600 mt-2">{errors.payment_method}</p>}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
                <label className="text-sm font-bold text-slate-900">Catatan untuk Mitra (opsional)</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="mt-2 w-full rounded-lg border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
            </div>

            {errors.items && <p className="text-sm text-rose-600 mb-3">{errors.items}</p>}
            {errors.vendor_id && <p className="text-sm text-rose-600 mb-3">{errors.vendor_id}</p>}

            <button
                onClick={submit}
                disabled={processing || !slotAvailable('09:00') && !slotAvailable('12:00')}
                className="w-full px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold text-sm"
            >
                {processing ? 'Memproses...' : `Pesan Sekarang · ${formatRupiah(cartTotal(cart))}`}
            </button>
        </AuthenticatedLayout>
    );
}
