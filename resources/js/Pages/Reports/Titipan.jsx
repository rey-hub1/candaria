import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useDateFilter } from '@/hooks/useDateFilter';
import DateRangeFilter from '@/Components/DateRangeFilter';

const Pagination = ({ links = [] }) => {
    if (links.length <= 3) return null;
    return (
        <div className="flex flex-wrap gap-1 justify-center mt-4">
            {links.map((link, key) =>
                link.url === null ? (
                    <div key={key} className="px-3 py-1.5 text-xs text-slate-400 border border-slate-200 rounded-lg bg-slate-50"
                        dangerouslySetInnerHTML={{ __html: link.label }} />
                ) : (
                    <Link key={key} href={link.url} preserveScroll
                        className={`px-3 py-1.5 text-xs border rounded-lg transition ${
                            link.active
                                ? 'bg-primary-600 border-primary-600 text-white font-bold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }} />
                )
            )}
        </div>
    );
};

// Header kolom yang bisa di-sort
const SortHeader = ({ label, column, sort, dir, onSort, align = 'left' }) => {
    const active = sort === column;
    const alignCls = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';
    return (
        <th className={`px-4 sm:px-6 py-3 text-${align} text-xs font-bold uppercase tracking-wider`}>
            <button
                type="button"
                onClick={() => onSort(column)}
                className={`inline-flex items-center gap-1 ${alignCls} w-full transition hover:text-primary-600 ${active ? 'text-primary-600' : 'text-slate-400'}`}
            >
                {label}
                <span className="text-[9px] leading-none">
                    {active ? (dir === 'asc' ? '▲' : '▼') : '↕'}
                </span>
            </button>
        </th>
    );
};

// Dropdown penitip yang bisa diketik (searchable combobox)
const SellerCombobox = ({ sellers = [], value, onChange }) => {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const ref = useRef(null);

    const selected = sellers.find((s) => String(s.id) === String(value));
    const label = selected ? `${selected.name} (${selected.class})` : 'Semua Penitip';

    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return sellers;
        return sellers.filter((s) =>
            s.name.toLowerCase().includes(t) || String(s.class).toLowerCase().includes(t)
        );
    }, [sellers, q]);

    useEffect(() => {
        const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const pick = (id) => { onChange(id); setOpen(false); setQ(''); };

    return (
        <div className="relative w-full sm:w-56" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between gap-2 pl-2.5 pr-2 py-1.5 text-[11px] font-bold rounded-lg border bg-white text-slate-600 border-slate-200 hover:border-primary-400 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
            >
                <span className="truncate">{label}</span>
                <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
            {open && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                        <input
                            autoFocus
                            type="text"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Cari penitip…"
                            className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                        />
                    </div>
                    <ul className="max-h-56 overflow-y-auto py-1 text-xs">
                        <li>
                            <button type="button" onClick={() => pick('')}
                                className={`w-full text-left px-3 py-1.5 hover:bg-primary-50 ${!value ? 'font-bold text-primary-700 bg-primary-50/50' : 'text-slate-600'}`}>
                                Semua Penitip
                            </button>
                        </li>
                        {filtered.map((s) => (
                            <li key={s.id}>
                                <button type="button" onClick={() => pick(s.id)}
                                    className={`w-full text-left px-3 py-1.5 hover:bg-primary-50 ${String(s.id) === String(value) ? 'font-bold text-primary-700 bg-primary-50/50' : 'text-slate-600'}`}>
                                    {s.name} <span className="text-slate-400">({s.class})</span>
                                </button>
                            </li>
                        ))}
                        {filtered.length === 0 && (
                            <li className="px-3 py-2 text-slate-400">Tidak ada penitip.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default function Titipan({
    items = { data: [], links: [], total: 0 },
    startDate = '',
    endDate = '',
    summary = { total_qty: 0, total_seller: 0, total_kantin: 0 },
    sellerId = '',
    sellers = [],
    filters = { search: '', status: '', sort: 'date', dir: 'desc', per_page: 15 },
}) {
    // Param dasar yang selalu ikut di setiap navigasi
    const baseParams = useMemo(() => ({
        start_date: startDate,
        end_date: endDate,
        seller_id: sellerId,
        search: filters.search || '',
        status: filters.status || '',
        sort: filters.sort || 'date',
        dir: filters.dir || 'desc',
        per_page: filters.per_page || 15,
    }), [startDate, endDate, sellerId, filters]);

    const go = (overrides = {}) => {
        router.get(route('reports.titipan'), { ...baseParams, ...overrides }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const filter = useDateFilter({
        initialStart: startDate,
        initialEnd: endDate,
        onNavigate: (start, end) => go({ start_date: start, end_date: end }),
    });

    // Loading indikator
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const onStart = () => setLoading(true);
        const onFinish = () => setLoading(false);
        const a = router.on('start', onStart);
        const b = router.on('finish', onFinish);
        return () => { a(); b(); };
    }, []);

    // Search dengan debounce
    const [searchInput, setSearchInput] = useState(filters.search || '');
    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) { firstRender.current = false; return; }
        const t = setTimeout(() => {
            if (searchInput !== (filters.search || '')) go({ search: searchInput });
        }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const handleSort = (column) => {
        const dir = filters.sort === column && filters.dir === 'asc' ? 'desc' : 'asc';
        go({ sort: column, dir });
    };

    const handleSellerChange = (id) => go({ seller_id: id });
    const handleStatusChange = (e) => go({ status: e.target.value });
    const handlePerPageChange = (e) => go({ per_page: e.target.value });

    const formatRupiah = (value) =>
        'Rp' + new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value || 0);

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    // Tanggal transaksi (transaction_date), fallback ke created_at item
    const itemDate = (item) => item.transaction?.transaction_date || item.created_at;

    const padZero = (num, size) => String(num).padStart(size, '0');

    // Subtotal halaman aktif
    const pageSubtotal = useMemo(() => items.data.reduce((acc, it) => ({
        qty: acc.qty + (it.quantity || 0),
        seller: acc.seller + (it.profit_seller || 0),
        kantin: acc.kantin + (it.profit_kantin || 0),
    }), { qty: 0, seller: 0, kantin: 0 }), [items.data]);

    const exportParams = { ...baseParams };
    const handleExportExcel = () => {
        window.location.href = route('reports.titipan', { ...exportParams, export: 'xlsx' });
    };
    const handleExportPdf = () => {
        window.open(route('reports.titipan', { ...exportParams, export: 'pdf' }), '_blank');
    };

    const isFiltered = searchInput.trim() !== '' || (filters.status || '') !== '';

    const StatusBadge = ({ item }) =>
        item.seller_settlement_id ? (
            <Link
                href={route('settlements.show', item.seller_settlement_id)}
                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-50 text-primary-700 border border-primary-200 hover:underline"
            >
                Lunas (#SET-{padZero(item.seller_settlement_id, 4)})
            </Link>
        ) : (
            <Link
                href={route('settlements.index', { pay_seller_id: item.product?.seller_id })}
                className="inline-flex items-center px-3 py-1 rounded text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition shadow-sm"
            >
                Bayar
            </Link>
        );

    return (
        <AuthenticatedLayout title="Laporan Titipan Siswa">
            <Head title="Laporan Titipan Siswa" />

            <div className="space-y-6">

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Produk Titipan</p>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5 sm:mt-1">{summary.total_products || 0} produk</h3>
                        <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">Jumlah jenis barang titipan</p>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Hasil untuk Siswa</p>
                        <h3 className="text-lg sm:text-2xl font-extrabold text-blue-600 mt-0.5 sm:mt-1">{formatRupiah(summary.total_seller || 0)}</h3>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Keuntungan Kantin</p>
                        <h3 className="text-lg sm:text-2xl font-extrabold text-primary-600 mt-0.5 sm:mt-1">{formatRupiah(summary.total_kantin || 0)}</h3>
                    </div>
                </div>

                <DateRangeFilter
                    {...filter}
                    onExportExcel={handleExportExcel}
                    onExportPdf={handleExportPdf}
                    extra={
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <SellerCombobox sellers={sellers} value={sellerId} onChange={handleSellerChange} />
                            <div className="relative w-full sm:w-auto">
                                <select
                                    value={filters.status || ''}
                                    onChange={handleStatusChange}
                                    className="w-full sm:w-auto appearance-none pl-2.5 pr-7 py-1.5 text-[11px] font-bold rounded-lg border bg-white text-slate-600 border-slate-200 hover:border-primary-400 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 cursor-pointer transition-all duration-150"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="unpaid">Belum Dibayar</option>
                                    <option value="paid">Sudah Lunas</option>
                                </select>
                                <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </div>
                        </div>
                    }
                />

                {/* Search bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Cari nama produk, kode, atau nama penitip…"
                            className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => { setSearchInput(''); go({ search: '' }); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="whitespace-nowrap">Tampil</span>
                        <select
                            value={filters.per_page || 15}
                            onChange={handlePerPageChange}
                            className="appearance-none px-2.5 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                        >
                            {[15, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <span className="whitespace-nowrap">/ hal</span>
                    </div>
                </div>

                {/* Table / Cards */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="report-titipan-table">
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                        <h3 className="text-base font-bold text-slate-900">Rincian Penjualan Barang Titipan</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                            {loading && (
                                <span className="inline-flex items-center gap-1.5 text-primary-600 font-semibold">
                                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                    Memuat…
                                </span>
                            )}
                            <span className="font-semibold text-slate-600">{items.total || 0} baris</span>
                        </div>
                    </div>

                    {items.data.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm">
                            {isFiltered
                                ? 'Tidak ada data yang cocok dengan filter/pencarian.'
                                : 'Tidak ada data penjualan barang titipan pada rentang tanggal tersebut.'}
                        </div>
                    ) : (
                        <>
                            {/* Desktop: tabel */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">ID Produk</th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Siswa Penitip</th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Produk</th>
                                            <th className="px-4 sm:px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Stok Awal</th>
                                            <SortHeader label="Terjual" column="quantity" sort={filters.sort} dir={filters.dir} onSort={handleSort} align="center" />
                                            <th className="px-4 sm:px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Sisa Stok</th>
                                            <SortHeader label="Harga Siswa" column="cost_price" sort={filters.sort} dir={filters.dir} onSort={handleSort} align="right" />
                                            <SortHeader label="Hasil Siswa" column="profit_seller" sort={filters.sort} dir={filters.dir} onSort={handleSort} align="right" />
                                            <SortHeader label="Laba Kantin" column="profit_kantin" sort={filters.sort} dir={filters.dir} onSort={handleSort} align="right" />
                                            <th className="px-4 sm:px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Status Bayar</th>
                                            <SortHeader label="Tanggal & Waktu" column="date" sort={filters.sort} dir={filters.dir} onSort={handleSort} align="left" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {items.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition">
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-slate-600 font-mono">{item.product?.code || item.product_id}</td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-bold text-slate-950">{item.product?.seller?.name || '-'} ({item.product?.seller?.class || '-'})</td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">{item.product?.name}</td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-center font-bold text-slate-500">{item.stok_awal ?? '-'} pcs</td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-center font-bold text-slate-700">{item.quantity} pcs</td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-center font-bold text-slate-500">{item.product?.stock} pcs</td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-right text-slate-600">{formatRupiah(item.cost_price)}</td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">{formatRupiah(item.profit_seller)}</td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-right font-bold text-primary-600">{formatRupiah(item.profit_kantin)}</td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-center"><StatusBadge item={item} /></td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-slate-600 font-mono">{formatDateTime(itemDate(item))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-700">
                                            <td className="px-4 sm:px-6 py-3 text-xs uppercase text-slate-500" colSpan={4}>Subtotal Halaman Ini</td>
                                            <td className="px-4 sm:px-6 py-3 text-sm text-center">{pageSubtotal.qty} pcs</td>
                                            <td></td>
                                            <td></td>
                                            <td className="px-4 sm:px-6 py-3 text-sm text-right text-blue-600">{formatRupiah(pageSubtotal.seller)}</td>
                                            <td className="px-4 sm:px-6 py-3 text-sm text-right text-primary-600">{formatRupiah(pageSubtotal.kantin)}</td>
                                            <td colSpan={2}></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Mobile: kartu */}
                            <div className="lg:hidden divide-y divide-slate-100">
                                {items.data.map((item) => (
                                    <div key={item.id} className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{item.product?.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    <span className="font-mono">{item.product?.code || item.product_id}</span>
                                                    {' · '}{item.product?.seller?.name || '-'} ({item.product?.seller?.class || '-'})
                                                </p>
                                            </div>
                                            <StatusBadge item={item} />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div>
                                                <p className="text-slate-400">Terjual</p>
                                                <p className="font-bold text-slate-700">{item.quantity} pcs</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Stok Awal</p>
                                                <p className="font-bold text-slate-600">{item.stok_awal ?? '-'} pcs</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Sisa</p>
                                                <p className="font-bold text-slate-600">{item.product?.stock} pcs</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Harga Siswa</p>
                                                <p className="font-semibold text-slate-600">{formatRupiah(item.cost_price)}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Hasil Siswa</p>
                                                <p className="font-bold text-blue-600">{formatRupiah(item.profit_seller)}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Laba Kantin</p>
                                                <p className="font-bold text-primary-600">{formatRupiah(item.profit_kantin)}</p>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-mono">{formatDateTime(itemDate(item))}</p>
                                    </div>
                                ))}
                                {/* Subtotal mobile */}
                                <div className="p-4 bg-slate-50 flex items-center justify-between text-xs font-bold">
                                    <span className="uppercase text-slate-500">Subtotal Halaman: {pageSubtotal.qty} pcs</span>
                                    <span className="text-right">
                                        <span className="text-blue-600">{formatRupiah(pageSubtotal.seller)}</span>
                                        {' · '}
                                        <span className="text-primary-600">{formatRupiah(pageSubtotal.kantin)}</span>
                                    </span>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
                        <Pagination links={items.links} />
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
