import React, { useState } from 'react';
import Modal from '@/Components/Modal';

const DEFAULT_PRESETS = [
    { key: 'today',     label: 'Hari Ini' },
    { key: 'yesterday', label: 'Kemarin'  },
    { key: 'last7',     label: '7 Hari'   },
    { key: 'thisMonth', label: 'Bulan Ini' },
    { key: 'lastMonth', label: 'Bulan Lalu' },
    { key: 'all',       label: 'Semua'    },
];

const DownloadIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export default function DateRangeFilter({
    localStartDate,
    setLocalStartDate,
    localEndDate,
    setLocalEndDate,
    activePreset,
    applyPreset,
    handleFilterSubmit,
    activeDateLabel = 'Semua Waktu',
    presets = DEFAULT_PRESETS,
    onExportExcel,
    onExportPdf,
    extra,
    className = '',
}) {
    const hasActions = onExportExcel || onExportPdf;
    const hasDownloads = onExportExcel || onExportPdf;
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

    return (
        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
            <div className="p-3 flex flex-col gap-3 items-start justify-between">

                {/* ── Kiri: Judul & Preset ── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
                    <div className="flex items-center gap-2 min-w-max">
                        <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center">
                            <CalendarIcon />
                        </div>
                        <span className="text-sm font-bold text-slate-800">{activeDateLabel}</span>
                    </div>

                    <div className="hidden sm:block w-px h-5 bg-slate-200"></div>

                    <div className="grid grid-cols-3 gap-1.5 w-full sm:flex sm:flex-wrap sm:items-center sm:w-auto">
                        {presets.map(p => (
                            <button
                                key={p.key}
                                type="button"
                                onClick={() => applyPreset(p.key)}
                                className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition-all duration-150 active:scale-95 sm:flex-none ${
                                    activePreset === p.key
                                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400 hover:text-primary-700'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {extra && (
                        <>
                            <div className="hidden sm:block w-px h-5 bg-slate-200"></div>
                            <div className="w-full sm:w-auto">{extra}</div>
                        </>
                    )}
                </div>

                {/* ── Kanan: Filter Manual & Export ── */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full">
                    <form onSubmit={handleFilterSubmit} className="flex flex-col gap-2 w-full md:flex-row md:items-center md:w-auto">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 md:py-1.5 flex-1 min-w-0">
                                <span className="text-[10px] text-slate-500 font-semibold uppercase">Dari</span>
                                <input
                                    type="date"
                                    id="drf_start"
                                    value={localStartDate}
                                    onChange={e => setLocalStartDate(e.target.value)}
                                    style={{ colorScheme: 'light' }}
                                    className="drf-date-input text-xs text-slate-900 font-bold bg-transparent border-none outline-none focus:ring-0 p-0 w-full min-w-0 cursor-pointer"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 md:py-1.5 flex-1 min-w-0">
                                <span className="text-[10px] text-slate-500 font-semibold uppercase">Ke</span>
                                <input
                                    type="date"
                                    id="drf_end"
                                    value={localEndDate}
                                    onChange={e => setLocalEndDate(e.target.value)}
                                    style={{ colorScheme: 'light' }}
                                    className="drf-date-input text-xs text-slate-900 font-bold bg-transparent border-none outline-none focus:ring-0 p-0 w-full min-w-0 cursor-pointer"
                                />
                            </div>
                        </div>
                        <button type="submit"
                            className="w-full md:w-auto px-3 py-2 md:py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-semibold text-xs rounded-lg transition shadow-sm shrink-0">
                            Cari
                        </button>
                    </form>

                    {hasActions && (
                        <>
                            <div className="hidden md:block w-px h-5 bg-slate-200"></div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                {hasDownloads && (
                                    <button type="button" onClick={() => setIsDownloadModalOpen(true)}
                                        className="flex-1 md:flex-none justify-center px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 font-bold text-xs rounded-lg transition flex items-center gap-1.5">
                                        <DownloadIcon /> Unduh Laporan
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .drf-date-input::-webkit-datetime-edit { color: #0f172a; }
                .drf-date-input::-webkit-datetime-edit-fields-wrapper { color: #0f172a; }
                .drf-date-input:in-range::-webkit-datetime-edit-year-field,
                .drf-date-input:in-range::-webkit-datetime-edit-month-field,
                .drf-date-input:in-range::-webkit-datetime-edit-day-field { color: #0f172a; }
                .drf-date-input::-webkit-datetime-edit-text { color: #475569; }
                .drf-date-input::-webkit-calendar-picker-indicator { opacity: 0.7; cursor: pointer; padding: 0; margin-left: 4px; }
            ` }} />

            <Modal show={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Unduh Laporan</h2>
                    <p className="text-sm text-slate-500 mb-6">Pilih format file laporan yang ingin Anda unduh.</p>
                    <div className="grid grid-cols-2 gap-4">
                        {onExportExcel && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDownloadModalOpen(false);
                                    onExportExcel();
                                }}
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
                                onClick={() => {
                                    setIsDownloadModalOpen(false);
                                    onExportPdf();
                                }}
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
        </div>
    );
}
