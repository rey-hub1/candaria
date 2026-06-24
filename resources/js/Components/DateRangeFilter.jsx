import React from 'react';
import DownloadMenu from '@/Components/DownloadMenu';

const DEFAULT_PRESETS = [
    { key: 'today',     label: 'Hari Ini' },
    { key: 'yesterday', label: 'Kemarin'  },
    { key: 'last7',     label: '7 Hari'   },
    { key: 'thisMonth', label: 'Bulan Ini' },
    { key: 'lastMonth', label: 'Bulan Lalu' },
    { key: 'all',       label: 'Semua'    },
];

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
                                <DownloadMenu onExportExcel={onExportExcel} onExportPdf={onExportPdf} />
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
        </div>
    );
}
