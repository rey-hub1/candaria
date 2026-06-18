import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

/**
 * Navbar bersama untuk halaman publik.
 * variant="landing" → fixed, transparan lalu blur saat scroll, anchor in-page.
 * variant="page"    → sticky putih, link balik ke beranda.
 * Self-contained: bawa style sendiri (prefix .snav-), pakai CSS var global tiap page.
 */
export default function SiteNav({ variant = 'page', marketplaceOpen = false }) {
    const isAuthenticated = !!usePage().props.auth?.user;
    const isLanding = variant === 'landing';
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (!isLanding) return;
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [isLanding]);

    const authLink = isAuthenticated
        ? <Link href={route('dashboard')} className="snav-link" style={{ opacity: .7 }}>Dashboard</Link>
        : <Link href={route('login')} className="snav-link" style={{ opacity: .7 }}>{isLanding ? 'Masuk' : 'Masuk Staff'}</Link>;

    return (
        <>
            <style>{`
                .snav { position:fixed; top:0; left:0; right:0; z-index:100; padding:20px 0; transition:all .4s ease; }
                .snav.sc { background:rgba(255,255,255,0.86); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); padding:13px 0; border-bottom:1px solid var(--border-s); }
                .snav.sticky { position:sticky; padding:14px 0; background:rgba(255,255,255,0.88); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); border-bottom:1px solid var(--border-s); }
                .snav-inner { max-width:1200px; margin:0 auto; padding:0 32px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
                .snav-link { color:var(--ink-soft); font-size:.875rem; font-weight:500; text-decoration:none; transition:color .2s; white-space:nowrap; }
                .snav-link:hover { color:var(--tomato); }
                .snav-btn { display:inline-flex; align-items:center; gap:9px; background:var(--yellow); color:var(--ink); font-weight:700; font-family:'DM Sans',sans-serif; border-radius:100px; padding:9px 20px; font-size:.85rem; text-decoration:none; border:none; cursor:pointer; box-shadow:0 5px 0 0 var(--yellow-d); transition:all .25s ease; white-space:nowrap; }
                .snav-btn:hover { transform:translateY(2px); box-shadow:0 3px 0 0 var(--yellow-d); background:#ffe04d; }
                .snav-btn-o { display:inline-flex; align-items:center; gap:8px; background:transparent; color:var(--ink); font-weight:600; font-family:'DM Sans',sans-serif; border-radius:100px; padding:8px 16px; font-size:.8rem; border:1.5px solid var(--ink); text-decoration:none; cursor:pointer; transition:all .25s ease; white-space:nowrap; }
                .snav-btn-o:hover { background:var(--ink); color:var(--paper); }
                .snav-links { display:flex; align-items:center; gap:28px; }
                .snav-mobile { display:none; }
                @media (max-width:600px) {
                    .snav-links { display:none !important; }
                    .snav-mobile { display:flex !important; align-items:center; }
                    .snav-inner { padding:0 16px; }
                }
            `}</style>

            <nav className={`snav ${isLanding ? (scrolled ? 'sc' : '') : 'sticky'}`}>
                <div className="snav-inner">
                    {/* logo */}
                    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src="/img/logo-color.png" alt="Candaria" style={{ width: isLanding ? 66 : 34, height: isLanding ? 66 : 34, objectFit: 'contain', flexShrink: 0 }} />
                        {!isLanding && <span className="d" style={{ fontSize: '1.28rem', fontWeight: 600, color: 'var(--ink)' }}>Candaria</span>}
                    </Link>

                    {/* mobile (≤600px): satu aksi ringkas, nav nggak kosong */}
                    <div className="snav-mobile">
                        {isLanding
                            ? (isAuthenticated
                                ? <Link href={route('dashboard')} className="snav-btn-o">Dashboard</Link>
                                : <Link href={route('login')} className="snav-btn-o">Masuk</Link>)
                            : <Link href="/" className="snav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7 7m-7-7l7-7" /></svg>
                                Beranda
                            </Link>}
                    </div>

                    {/* desktop links */}
                    <div className="snav-links">
                        {isLanding ? (
                            <>
                                <a href="#menu" className="snav-link">Menu</a>
                                {marketplaceOpen && <a href="#jajan-online" className="snav-link">Jajan Online</a>}
                                <a href="#kenapa" className="snav-link">Kenapa Kami</a>
                                <a href="#faq" className="snav-link">FAQ</a>
                                <Link href={route('menu')} className="snav-btn">Semua Menu</Link>
                                {authLink}
                            </>
                        ) : (
                            <>
                                <Link href="/" className="snav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7 7m-7-7l7-7" /></svg>
                                    Beranda
                                </Link>
                                <a href="/#faq" className="snav-link">Jam Buka</a>
                                {authLink}
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}
