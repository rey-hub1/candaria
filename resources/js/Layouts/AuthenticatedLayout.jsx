import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { ToastContainer } from '@/Components/Toast';

export default function AuthenticatedLayout({ children, title }) {
    const { auth, flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toasts, setToasts] = useState([]);

    const addToast = (type, message) => {
        if (type === 'success' && route().current('transactions.create')) {
            return;
        }
        const id = Date.now() + Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, message }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    // Trigger toast on mount if initial flash exists
    useEffect(() => {
        if (flash?.success) {
            addToast('success', flash.success);
        }
        if (flash?.error) {
            addToast('error', flash.error);
        }
    }, []);

    // Listen for subsequent navigation/Inertia requests
    useEffect(() => {
        const removeListener = router.on('success', (event) => {
            const pageFlash = event.detail.page.props.flash;
            if (pageFlash) {
                if (pageFlash.success) {
                    addToast('success', pageFlash.success);
                }
                if (pageFlash.error) {
                    addToast('error', pageFlash.error);
                }
            }
        });
        return () => removeListener();
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    // Helper to check active routes
    const isRouteActive = (routeName, checkParam = false) => {
        return route().current(routeName);
    };

    const linkClass = (active) => {
        return `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition ${
            active
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`;
    };

    const mobileLinkClass = (active) => {
        return `flex flex-col items-center justify-center flex-1 text-center py-2 transition ${
            active ? 'text-emerald-600' : 'text-slate-400'
        }`;
    };

    const renderSidebarLinks = () => (
        <>
            {/* Dashboard */}
            <Link href={route('dashboard')} className={linkClass(isRouteActive('dashboard'))}>
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"></path>
                </svg>
                Dashboard
            </Link>

            {auth.user.role !== 'penitip' && (
                <>
                    {/* Kasir */}
                    <Link href={route('transactions.create')} className={linkClass(isRouteActive('transactions.create'))}>
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"></path>
                        </svg>
                        Kasir (Checkout)
                    </Link>

                    {/* Transaksi (History) */}
                    <Link href={route('transactions.index')} className={linkClass(isRouteActive('transactions.index') || isRouteActive('transactions.show'))}>
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0 1 12 3c.08 0 .16.002.24.005M9 10.5h.008v.008H9V10.5Zm0 3h.008v.008H9v-.008Zm0 3h.008v.008H9v-.008Z"></path>
                        </svg>
                        Riwayat Transaksi
                    </Link>
                </>
            )}

            {auth.user.role === 'admin' && (
                <>
                    <div className="pt-4 pb-2">
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Master</p>
                    </div>

                    {/* Kategori */}
                    <Link href={route('categories.index')} className={linkClass(isRouteActive('categories.index'))}>
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 0 0 3.181 0l4.319-4.319a2.25 2.25 0 0 0 0-3.182L11.16 3.659A2.25 2.25 0 0 0 9.568 3Z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z"></path>
                        </svg>
                        Kategori
                    </Link>

                    {/* Produk */}
                    <Link href={route('products.index')} className={linkClass(isRouteActive('products.index'))}>
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"></path>
                        </svg>
                        Produk
                    </Link>

                    {/* Penitip */}
                    <Link href={route('sellers.index')} className={linkClass(isRouteActive('sellers.index'))}>
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0 1 8.625 21c-2.38 0-4.577-.732-6.375-1.96v-.109A4.125 4.125 0 0 1 9.75 16.5c1.802 0 3.327.962 4.121 2.393M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6.5 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"></path>
                        </svg>
                        Siswa Penitip
                    </Link>


                    <div className="pt-4 pb-2">
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Keuangan & Laporan</p>
                    </div>

                    {/* Pembayaran Penitip */}
                    <Link href={route('settlements.index')} className={linkClass(isRouteActive('settlements.index') || isRouteActive('settlements.show'))}>
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5M5.25 7.5h13.5m-12 3h10.5m-12 3h12m-12.75 3h13.5"></path>
                        </svg>
                        Pembayaran Penitip
                    </Link>

                    {/* Buku Kas */}
                    <Link href={route('cashbooks.index')} className={linkClass(isRouteActive('cashbooks.index'))}>
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
                        </svg>
                        Mutasi & Buku Kas
                    </Link>

                    {/* Laporan Penjualan */}
                    <Link href={route('reports.sales')} className={linkClass(isRouteActive('reports.sales'))}>
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"></path>
                        </svg>
                        Laporan Penjualan
                    </Link>

                    {/* Laporan Titipan */}
                    <Link href={route('reports.titipan')} className={linkClass(isRouteActive('reports.titipan'))}>
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H3.75A1.125 1.125 0 0 0 2.625 3.375v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-2.25M16.5 7.5l-3.375-3.375m0 0H18v3.375m-9-3.375v12.75"></path>
                        </svg>
                        Laporan Titipan
                    </Link>

                    {/* Laporan Produk & Stok */}
                    <Link href={route('reports.products')} className={linkClass(isRouteActive('reports.products'))}>
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"></path>
                        </svg>
                        Laporan Produk & Stok
                    </Link>

                    {/* Laporan Stok Harian */}
                    <Link href={route('reports.stock')} className={linkClass(isRouteActive('reports.stock'))}>
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0 1 12 3c.08 0 .16.002.24.005M9 10.5h.008v.008H9V10.5Zm0 3h.008v.008H9v-.008Zm0 3h.008v.008H9v-.008Z"></path>
                        </svg>
                        Laporan Stok Harian
                    </Link>

                    <div className="pt-4 pb-2">
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pengaturan</p>
                    </div>

                    {/* User Management */}
                    <Link href={route('users.index')} className={linkClass(isRouteActive('users.index'))}>
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
                        </svg>
                        User Management
                    </Link>

                    {/* Margin Rules */}
                    <Link href={route('margin-rules.index')} className={linkClass(isRouteActive('margin-rules.index'))}>
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Aturan Profit
                    </Link>
                </>
            )}
        </>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex md:flex-col md:w-64 bg-slate-900 text-white shrink-0 border-r border-slate-800">
                {/* Brand / Logo */}
                <div className="flex items-center gap-3 h-16 px-6 bg-slate-950 border-b border-slate-800">
                    <img src="/logo.jpeg" alt="Logo" className="w-9 h-9 object-contain rounded-lg" />
                    <span className="text-base font-bold tracking-wider uppercase text-emerald-400">Kantin Smekda</span>
                </div>
                
                {/* Nav Items */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {renderSidebarLinks()}
                </nav>

                {/* User Footer Info */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                    <div className="truncate pr-2">
                        <p className="text-sm font-semibold text-white truncate">{auth.user.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{auth.user.role}</p>
                    </div>
                    <form onSubmit={handleLogout}>
                        <button type="submit" className="text-slate-400 hover:text-rose-400 transition" title="Log Out">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"></path>
                            </svg>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 flex md:hidden bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <div className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-white md:hidden transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Brand / Logo */}
                <div className="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
                        <span className="text-base font-bold tracking-wider uppercase text-emerald-400">Kantin Smekda</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                {/* Nav Items */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {renderSidebarLinks()}
                </nav>
                {/* User Footer Info */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-white">{auth.user.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{auth.user.role}</p>
                    </div>
                    <form onSubmit={handleLogout}>
                        <button type="submit" className="text-slate-400 hover:text-rose-400 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"></path>
                            </svg>
                        </button>
                    </form>
                </div>
            </div>

            {/* Page Container */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top Header */}
                <header className="flex items-center justify-between h-14 md:h-16 px-4 md:px-6 bg-white border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-base md:text-lg font-bold text-slate-900">
                            {title || 'Kantin Smekda'}
                        </span>
                    </div>

                    {/* Right Header Info */}
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-semibold ${
                            auth.user.role === 'admin' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-blue-50 text-blue-700 border border-blue-100'
                        } capitalize`}>
                            {auth.user.role}
                        </span>
                        
                        <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
                        <span className="text-xs md:text-sm font-semibold text-slate-600 hidden sm:inline">{auth.user.name}</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 pb-20 md:pb-6">
                    <ToastContainer toasts={toasts} removeToast={removeToast} />

                    {children}
                </main>
            </div>

            {/* Bottom Navigation Bar for Mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center z-30 shadow-lg px-2">
                {/* Dashboard */}
                <Link href={route('dashboard')} className={mobileLinkClass(isRouteActive('dashboard'))}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    <span className="text-[10px] font-semibold mt-1">Dashboard</span>
                </Link>

                {auth.user.role === 'penitip' ? (
                    <>
                        {/* Penitip: Profile */}
                        <Link href={route('profile.edit')} className={mobileLinkClass(isRouteActive('profile.edit'))}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                            <span className="text-[10px] font-semibold mt-1">Profil</span>
                        </Link>

                        {/* Penitip: Export / Laporan */}
                        <a href={route('penitip.export')} className={mobileLinkClass(false)}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            <span className="text-[10px] font-semibold mt-1">Ekspor</span>
                        </a>

                        {/* Penitip: Logout */}
                        <form onSubmit={handleLogout} className="flex-1">
                            <button type="submit" className={mobileLinkClass(false) + ' w-full'}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                </svg>
                                <span className="text-[10px] font-semibold mt-1">Keluar</span>
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        {/* Kasir */}
                        <Link href={route('transactions.create')} className={mobileLinkClass(isRouteActive('transactions.create'))}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>
                            <span className="text-[10px] font-semibold mt-1">Kasir</span>
                        </Link>

                        {/* Riwayat */}
                        <Link href={route('transactions.index')} className={mobileLinkClass(isRouteActive('transactions.index') || isRouteActive('transactions.show'))}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0 1 12 3c.08 0 .16.002.24.005M9 10.5h.008v.008H9V10.5Zm0 3h.008v.008H9v-.008Zm0 3h.008v.008H9v-.008Z" />
                            </svg>
                            <span className="text-[10px] font-semibold mt-1">Riwayat</span>
                        </Link>

                        {/* Menu drawer */}
                        <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center justify-center flex-1 text-center py-2 text-slate-400 hover:text-slate-600 focus:outline-none">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                            <span className="text-[10px] font-semibold mt-1">Menu</span>
                        </button>
                    </>
                )}
            </nav>
        </div>
    );
}
