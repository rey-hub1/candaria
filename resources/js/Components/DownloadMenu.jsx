import React, { useState } from 'react';
import Modal from '@/Components/Modal';

const DownloadIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

/**
 * Tombol "Unduh Laporan" tunggal → buka modal pilih Excel / PDF.
 * Konsisten dipakai di semua page yang punya export.
 *
 * @param onExportExcel  callback saat pilih Excel (wajib salah satu)
 * @param onExportPdf    callback saat pilih PDF
 * @param label          teks tombol
 * @param buttonClassName  override style tombol
 * @param title, description  teks dalam modal
 */
export default function DownloadMenu({
    onExportExcel,
    onExportPdf,
    label = 'Unduh Laporan',
    buttonClassName = 'flex-1 md:flex-none justify-center px-3 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 font-bold text-xs rounded-lg transition flex items-center gap-1.5',
    title = 'Unduh Laporan',
    description = 'Pilih format file laporan yang ingin Anda unduh.',
}) {
    const [open, setOpen] = useState(false);
    if (!onExportExcel && !onExportPdf) return null;

    const pick = (fn) => () => { setOpen(false); fn?.(); };

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className={buttonClassName}>
                <DownloadIcon /> {label}
            </button>

            <Modal show={open} onClose={() => setOpen(false)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-2">{title}</h2>
                    <p className="text-sm text-slate-500 mb-6">{description}</p>
                    <div className="grid grid-cols-2 gap-4">
                        {onExportExcel && (
                            <button
                                type="button"
                                onClick={pick(onExportExcel)}
                                className="flex flex-col items-center justify-center p-4 border border-emerald-200 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:scale-[1.02] active:scale-95 transition-all gap-2"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                <span className="font-bold text-sm">Excel (.xlsx)</span>
                            </button>
                        )}
                        {onExportPdf && (
                            <button
                                type="button"
                                onClick={pick(onExportPdf)}
                                className="flex flex-col items-center justify-center p-4 border border-rose-200 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 hover:scale-[1.02] active:scale-95 transition-all gap-2"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                <span className="font-bold text-sm">PDF (.pdf)</span>
                            </button>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
}
