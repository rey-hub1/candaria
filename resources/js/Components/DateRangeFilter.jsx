import React from 'react';

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
    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

/**
 * Shared date range filter card.
 *
 * Props from useDateFilter():
 *   localStartDate, setLocalStartDate, localEndDate, setLocalEndDate,
 *   activePreset, applyPreset, handleFilterSubmit, activeDateLabel
 *
 * Optional:
 *   presets       – override preset list (defaults to DEFAULT_PRESETS)
 *   onExportExcel – handler for Excel export button
 *   onExportPdf   – handler for PDF export button
 *   showPrint     – show print button (default false)
 *   className     – extra classes on the wrapper
 */
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
    showPrint = false,
    className = '',
}) {
    const hasActions = onExportExcel || onExportPdf || showPrint;

    return (
        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm print:hidden overflow-hidden ${className}`}>

            {/* ── Header ── */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <CalendarIcon />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Periode Laporan</p>
                        <p className="text-sm font-bold text-slate-800">{activeDateLabel}</p>
                    </div>
                </div>

                {hasActions && (
                    <div className="flex items-center gap-2">
                        {onExportExcel && (
                            <button type="button" onClick={onExportExcel}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5">
                                <DownloadIcon /> Excel
                            </button>
                        )}
                        {onExportPdf && (
                            <button type="button" onClick={onExportPdf}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5">
                                <DownloadIcon /> PDF
                            </button>
                        )}
                        {showPrint && (
                            <button type="button" onClick={() => window.print()}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.617 0-1.11-.474-1.12-1.09L5.87 18M10.5 8.5h3M18 8.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                </svg>
                                Cetak
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Preset pills ── */}
            <div className="px-6 py-4 flex flex-wrap gap-2 items-center border-b border-slate-100 bg-slate-50">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Pilih Cepat:</span>
                {presets.map(p => (
                    <button
                        key={p.key}
                        type="button"
                        onClick={() => applyPreset(p.key)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all duration-150 ${
                            activePreset === p.key
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-700'
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* ── Manual range ── */}
            <form onSubmit={handleFilterSubmit} className="px-6 py-4 flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Atau atur manual:</span>
                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 sm:flex-none min-w-0">
                        <label htmlFor="drf_start" className="text-xs text-slate-500 font-semibold whitespace-nowrap">Dari</label>
                        <input
                            type="date"
                            id="drf_start"
                            value={localStartDate}
                            onChange={e => setLocalStartDate(e.target.value)}
                            style={{ colorScheme: 'light' }}
                            className="drf-date-input text-sm text-slate-900 font-semibold bg-transparent border-none outline-none cursor-pointer min-w-[120px] w-full sm:w-auto"
                        />
                    </div>
                    <svg className="w-4 h-4 text-slate-400 hidden sm:block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 sm:flex-none min-w-0">
                        <label htmlFor="drf_end" className="text-xs text-slate-500 font-semibold whitespace-nowrap">Sampai</label>
                        <input
                            type="date"
                            id="drf_end"
                            value={localEndDate}
                            onChange={e => setLocalEndDate(e.target.value)}
                            style={{ colorScheme: 'light' }}
                            className="drf-date-input text-sm text-slate-900 font-semibold bg-transparent border-none outline-none cursor-pointer min-w-[120px] w-full sm:w-auto"
                        />
                    </div>
                    <button type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition w-full sm:w-auto">
                        Terapkan
                    </button>
                </div>
            </form>

            <style dangerouslySetInnerHTML={{ __html: `
                /* Darken native date text + placeholder so tanggal always visible */
                .drf-date-input::-webkit-datetime-edit { color: #0f172a; }
                .drf-date-input::-webkit-datetime-edit-fields-wrapper { color: #0f172a; }
                .drf-date-input:in-range::-webkit-datetime-edit-year-field,
                .drf-date-input:in-range::-webkit-datetime-edit-month-field,
                .drf-date-input:in-range::-webkit-datetime-edit-day-field { color: #0f172a; }
                .drf-date-input::-webkit-datetime-edit-text { color: #475569; }
                .drf-date-input::-webkit-calendar-picker-indicator { opacity: 0.7; cursor: pointer; }
            ` }} />
        </div>
    );
}
