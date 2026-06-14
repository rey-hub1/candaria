import React, { useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { useDialog } from '@/hooks/useDialog';
import { formatRupiah } from '@/utils/format';

export default function Show({ transaction = {}, printModal = false }) {

    const { dialog, confirm: openConfirm, alert: openAlert, dialogConfirm, dialogClose } = useDialog();

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };


    return (
        <AuthenticatedLayout title="Detail Transaksi">
            <Head title="Detail Transaksi" />

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    /* Hide everything in layout */
                    body * {
                        visibility: hidden;
                    }
                    /* Show receipt only */
                    #receipt-print, #receipt-print * {
                        visibility: visible;
                    }
                    #receipt-print {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        border: none;
                        padding: 0;
                        box-shadow: none;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            ` }} />

            <div className="max-w-2xl mx-auto">
                {/* Back link */}
                <div className="mb-6 print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                    <Link
                        href={route('transactions.create')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 w-full sm:w-auto"
                    >
                        Transaksi Selanjutnya &rarr;
                    </Link>
                    <div className="flex gap-3 w-full sm:w-auto">
                        {transaction.status !== 'voided' && (
                        <button
                            onClick={() => {
                                openConfirm({ message: 'Apakah Anda yakin ingin membatalkan transaksi ini? Stok barang akan dikembalikan.' }, () => {
                                    const reason = window.prompt(`Alasan pembatalan transaksi ${transaction.transaction_code} (opsional):`, '');
                                    if (reason === null) return;
                                    router.delete(route('transactions.destroy', transaction.id), { data: { reason } });
                                });
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Void / Batal
                        </button>
                        )}
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.617 0-1.11-.474-1.12-1.09L5.87 18M10.5 8.5h3M18 8.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm-6 11.25h.008v.008H12v-.008Zm0-3h.008v.008H12v-.008Zm0-3h.008v.008H12v-.008Zm0-3h.008v.008H12v-.008Z"></path>
                            </svg>
                            Cetak Struk
                        </button>
                    </div>
                </div>

                {/* Voided banner */}
                {transaction.status === 'voided' && (
                    <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-5 py-4 print:border-rose-400">
                        <p className="text-sm font-bold text-rose-700">Transaksi ini telah DIBATALKAN (void)</p>
                        {transaction.void_reason && (
                            <p className="text-xs text-rose-600 mt-1">Alasan: {transaction.void_reason}</p>
                        )}
                        {transaction.voider?.name && (
                            <p className="text-xs text-rose-500 mt-0.5">Oleh: {transaction.voider.name}</p>
                        )}
                    </div>
                )}

                {/* Receipt Container */}
                <div
                    className="bg-white p-8 rounded-xl border border-black shadow-sm print:shadow-none print:border-none print:p-0 text-black"
                    id="receipt-print"
                >
                    {/* Receipt Header */}
                    <div className="text-center pb-6 border-b border-dashed border-black">
                        <h2 className="text-xl font-extrabold text-black tracking-wide uppercase">KANTIN SEKOLAH</h2>
                        <p className="text-xs text-black mt-1">SMKN 2 PURWAKARTA</p>
                        <p className="text-xs text-black">Jl. Jend. Ahmad Yani No.98, Purwakarta</p>
                    </div>

                    {/* Receipt Metadata */}
                    <div className="py-4 border-b border-dashed border-black text-xs text-black space-y-1.5 font-mono">
                        <div className="flex justify-between">
                            <span>No. Transaksi :</span>
                            <span className="font-bold">{transaction.transaction_code}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tanggal :</span>
                            <span>{formatDate(transaction.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Kasir :</span>
                            <span>{transaction.user?.name}</span>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="py-4 border-b border-dashed border-black">
                        <table className="w-full text-xs text-black font-mono">
                            <thead>
                                <tr className="border-b border-black font-bold pb-2">
                                    <th className="text-left pb-2">Item</th>
                                    <th className="text-center pb-2">Qty</th>
                                    <th className="text-right pb-2">Harga</th>
                                    <th className="text-right pb-2">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/20">
                                {transaction.items?.map((item) => (
                                    <tr key={item.id}>
                                        <td className="py-2.5">
                                            <span className="font-bold">{item.product?.name}</span>
                                            {item.product?.type === 'siswa' && (
                                                <span className="text-[9px] px-1 border border-black rounded font-semibold ml-1">Siswa</span>
                                            )}
                                        </td>
                                        <td className="text-center py-2.5">{item.quantity}</td>
                                        <td className="text-right py-2.5">{formatRupiah(item.selling_price)}</td>
                                        <td className="text-right py-2.5 font-bold">
                                            {formatRupiah(item.selling_price * item.quantity)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Financial Summary */}
                    <div className="py-4 space-y-1.5 text-xs text-black font-mono">
                        <div className="flex justify-between text-sm font-extrabold">
                            <span>TOTAL BELANJA :</span>
                            <span>{formatRupiah(transaction.total_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>TUNAI / BAYAR :</span>
                            <span>{formatRupiah(transaction.paid_amount)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>KEMBALIAN :</span>
                            <span>{formatRupiah(transaction.change_amount)}</span>
                        </div>
                    </div>

                    {/* Footer / Greetings */}
                    <div className="pt-6 border-t border-dashed border-black text-center text-[10px] text-black space-y-1">
                        <p className="font-semibold">Terima Kasih Atas Kunjungan Anda!</p>
                        <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
                    </div>

                </div>
            </div>
            <ConfirmModal {...dialog} onConfirm={dialogConfirm} onClose={dialogClose} />
        </AuthenticatedLayout>
    );
}
