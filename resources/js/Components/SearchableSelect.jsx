import React, { useEffect, useRef, useState } from 'react';

/**
 * Dropdown searchable ringan tanpa dependency tambahan.
 *
 * Props:
 *   options      – array { value, label }
 *   value        – value terpilih (string/number)
 *   onChange     – (value) => void
 *   placeholder  – teks saat belum ada pilihan
 *   required     – validasi native (lewat hidden input)
 *   className    – class pada tombol pemicu
 *   name         – name untuk hidden input (opsional)
 */
export default function SearchableSelect({
    options = [],
    value = '',
    onChange,
    placeholder = 'Pilih...',
    required = false,
    className = '',
    name,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const wrapRef = useRef(null);
    const searchRef = useRef(null);

    const selected = options.find(o => String(o.value) === String(value));

    // Tutup saat klik di luar
    useEffect(() => {
        const onDocClick = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    // Fokus ke kolom cari saat dibuka
    useEffect(() => {
        if (open && searchRef.current) searchRef.current.focus();
    }, [open]);

    const filtered = query.trim()
        ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    const pick = (val) => {
        onChange(val);
        setOpen(false);
        setQuery('');
    };

    return (
        <div className="relative" ref={wrapRef}>
            {/* Hidden input untuk validasi required native */}
            {required && (
                <input
                    tabIndex={-1}
                    autoComplete="off"
                    name={name}
                    value={value || ''}
                    required
                    onChange={() => {}}
                    className="sr-only"
                    aria-hidden="true"
                />
            )}

            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`${className} flex items-center justify-between text-left`}
            >
                <span className={selected ? 'text-slate-900 truncate' : 'text-slate-400 truncate'}>
                    {selected ? selected.label : placeholder}
                </span>
                <svg className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                        <input
                            ref={searchRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Ketik nama / kelas..."
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <ul className="max-h-56 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-slate-400">Tidak ada hasil.</li>
                        ) : (
                            filtered.map(o => (
                                <li key={o.value}>
                                    <button
                                        type="button"
                                        onClick={() => pick(o.value)}
                                        className={`w-full text-left px-3 py-2 text-sm transition hover:bg-primary-50 ${
                                            String(o.value) === String(value)
                                                ? 'bg-primary-50 text-primary-700 font-semibold'
                                                : 'text-slate-700'
                                        }`}
                                    >
                                        {o.label}
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
