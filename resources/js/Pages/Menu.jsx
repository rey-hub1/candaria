import { Link, Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function Menu({ products = [], categories = [], canLogin }) {
    const [q, setQ] = useState('');
    const [cat, setCat] = useState('all');
    const [sort, setSort] = useState('popular');
    const [onlyAvailable, setOnlyAvailable] = useState(false);

    const formatPrice = (price) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        let list = products.filter((p) => {
            if (cat !== 'all' && String(p.category_id) !== String(cat)) return false;
            if (onlyAvailable && !(p.stock > 0)) return false;
            if (term) {
                const hay = `${p.name} ${p.category?.name || ''} ${p.code || ''}`.toLowerCase();
                if (!hay.includes(term)) return false;
            }
            return true;
        });
        const sold = (p) => p.transaction_items_sum_quantity || 0;
        list = [...list].sort((a, b) => {
            if (sort === 'cheap') return a.selling_price - b.selling_price;
            if (sort === 'expensive') return b.selling_price - a.selling_price;
            if (sort === 'az') return a.name.localeCompare(b.name, 'id');
            return sold(b) - sold(a); // popular
        });
        return list;
    }, [products, q, cat, sort, onlyAvailable]);

    const totalAvail = products.filter((p) => p.stock > 0).length;

    return (
        <>
            <Head title="Semua Menu — Candaria">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
            </Head>

            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                :root {
                    --paper: #ffffff;
                    --paper-2: #f4f4fb;
                    --paper-3: #e9e9f5;
                    --ink: #1b1a38;
                    --ink-soft: #5a5982;
                    --tomato: #2c2a9c;
                    --tomato-d: #1d1c6e;
                    --yellow: #ffd60a;
                    --yellow-d: #d9af00;
                    --leaf: #4543c8;
                    --border: rgba(27,26,56,0.14);
                    --border-s: rgba(27,26,56,0.09);
                }
                html { scroll-behavior: smooth; }
                body { background: var(--paper); color: var(--ink); font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
                ::selection { background: rgba(44,42,156,0.22); color: var(--ink); }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: var(--tomato); border-radius: 2px; }
                .d { font-family: 'Fraunces', serif; }
                .ink-em { color: var(--tomato); font-style: italic; }

                @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                .fu { animation: fadeUp .6s cubic-bezier(0.22,1,0.36,1) both; }

                .nav { position:sticky; top:0; z-index:90; background:rgba(255,255,255,0.88); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); border-bottom:1px solid var(--border-s); }
                .nav-link { color:var(--ink-soft); font-size:.875rem; font-weight:500; text-decoration:none; transition:color .2s; }
                .nav-link:hover { color:var(--tomato); }

                .btn-g {
                    display:inline-flex; align-items:center; gap:9px; background:var(--yellow);
                    color:var(--ink); font-weight:700; font-family:'DM Sans',sans-serif;
                    border-radius:100px; padding:9px 20px; font-size:.85rem;
                    transition:all .25s ease; text-decoration:none; border:none; cursor:pointer;
                    box-shadow:0 5px 0 0 var(--yellow-d);
                }
                .btn-g:hover { transform:translateY(2px); box-shadow:0 3px 0 0 var(--yellow-d); background:#ffe04d; }

                /* search */
                .search-wrap { position:relative; flex:1; min-width:220px; }
                .search-in {
                    width:100%; font-family:'DM Sans',sans-serif; font-size:.95rem; color:var(--ink);
                    background:var(--paper-2); border:1.5px solid var(--border); border-radius:100px;
                    padding:14px 18px 14px 46px; transition:all .2s; outline:none;
                }
                .search-in:focus { border-color:var(--tomato); background:var(--paper); box-shadow:0 0 0 4px rgba(44,42,156,.1); }
                .search-ico { position:absolute; left:17px; top:50%; transform:translateY(-50%); color:var(--ink-soft); pointer-events:none; }

                /* chip */
                .chip {
                    font-family:'DM Sans',sans-serif; font-size:.82rem; font-weight:600; cursor:pointer;
                    padding:8px 16px; border-radius:100px; border:1.5px solid var(--border);
                    background:var(--paper); color:var(--ink-soft); transition:all .2s; white-space:nowrap;
                }
                .chip:hover { border-color:var(--tomato); color:var(--tomato); }
                .chip.on { background:var(--tomato); border-color:var(--tomato); color:#fff; }

                .sel {
                    font-family:'DM Sans',sans-serif; font-size:.85rem; font-weight:600; color:var(--ink);
                    background:var(--paper-2); border:1.5px solid var(--border); border-radius:100px;
                    padding:10px 38px 10px 16px; cursor:pointer; outline:none; appearance:none;
                    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%231b1a38' stroke-width='2.5' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
                    background-repeat:no-repeat; background-position:right 15px center;
                }
                .sel:focus { border-color:var(--tomato); }

                .toggle { display:inline-flex; align-items:center; gap:8px; cursor:pointer; user-select:none; font-size:.82rem; font-weight:600; color:var(--ink-soft); }
                .toggle .box { width:38px; height:22px; border-radius:100px; background:var(--paper-3); border:1.5px solid var(--border); position:relative; transition:all .2s; }
                .toggle .box::after { content:''; position:absolute; top:1.5px; left:2px; width:15px; height:15px; border-radius:50%; background:#fff; box-shadow:0 1px 2px rgba(0,0,0,.2); transition:all .2s; }
                .toggle.on .box { background:var(--tomato); border-color:var(--tomato); }
                .toggle.on .box::after { transform:translateX(15px); }
                .toggle.on { color:var(--tomato); }

                .pc { background:var(--paper); border:1.5px solid var(--ink); border-radius:18px; overflow:hidden; transition:all .3s cubic-bezier(.4,0,.2,1); position:relative; box-shadow:4px 4px 0 0 rgba(27,26,56,.14); }
                .pc:hover { transform:translate(-3px,-3px); box-shadow:8px 8px 0 0 var(--yellow); border-color:var(--tomato); }
                .pc.out { opacity:.6; }

                @media (max-width:600px) { .nav-actions { display:none !important; } }
            `}</style>

            <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
                {/* NAV */}
                <nav className="nav">
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src="/img/logo-color.png" alt="Candaria" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                            <span className="d" style={{ fontSize: '1.28rem', fontWeight: 600, color: 'var(--ink)' }}>Candaria</span>
                        </Link>
                        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                            <Link href="/" className="nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7 7m-7-7l7-7" /></svg>
                                Beranda
                            </Link>
                            <a href="/#faq" className="nav-link">Jam Buka</a>
                            {canLogin
                                ? <Link href={route('dashboard')} className="nav-link" style={{ opacity: .7 }}>Dashboard</Link>
                                : <Link href={route('login')} className="nav-link" style={{ opacity: .7 }}>Masuk Staff</Link>}
                        </div>
                    </div>
                </nav>

                {/* HEADER */}
                <header style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 32px 28px' }}>
                    <div className="fu" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '.72rem', fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--tomato)', marginBottom: 16 }}>
                        <span style={{ fontSize: '.6rem' }}>●</span> Daftar Lengkap
                    </div>
                    <h1 className="d fu" style={{ fontSize: 'clamp(2.4rem,5vw,4rem)', fontWeight: 600, lineHeight: 1.02, letterSpacing: '-.025em', marginBottom: 14 }}>
                        Semua <span className="ink-em">Menu</span> Kami
                    </h1>
                    <p className="fu" style={{ fontSize: '1.02rem', color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 520 }}>
                        Cari, saring, dan temukan jajanan favoritmu. Datang langsung ke kantin buat pesan — pilih di etalase, bayar di kasir.
                    </p>
                </header>

                {/* CONTROLS */}
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
                        <div className="search-wrap">
                            <svg className="search-ico" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                            </svg>
                            <input
                                className="search-in"
                                type="text"
                                placeholder="Cari menu… (nasi goreng, es teh, …)"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                        </div>
                        <select className="sel" value={sort} onChange={(e) => setSort(e.target.value)}>
                            <option value="popular">Terlaris</option>
                            <option value="cheap">Termurah</option>
                            <option value="expensive">Termahal</option>
                            <option value="az">Nama A–Z</option>
                        </select>
                        <div className={`toggle ${onlyAvailable ? 'on' : ''}`} onClick={() => setOnlyAvailable((v) => !v)}>
                            <span className="box" />
                            Tersedia saja
                        </div>
                    </div>

                    {/* CATEGORY CHIPS */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22, paddingBottom: 22, borderBottom: '1.5px solid var(--border-s)' }}>
                        <button className={`chip ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>
                            Semua
                        </button>
                        {categories.map((c) => (
                            <button key={c.id} className={`chip ${String(cat) === String(c.id) ? 'on' : ''}`} onClick={() => setCat(c.id)}>
                                {c.name}
                            </button>
                        ))}
                    </div>

                    {/* RESULT COUNT */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
                        <p style={{ color: 'var(--ink-soft)', fontSize: '.88rem' }}>
                            Menampilkan <strong style={{ color: 'var(--ink)' }}>{filtered.length}</strong> menu
                            {' '}<span style={{ opacity: .7 }}>· {totalAvail} tersedia hari ini</span>
                        </p>
                        {(q || cat !== 'all' || onlyAvailable) && (
                            <button
                                onClick={() => { setQ(''); setCat('all'); setOnlyAvailable(false); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tomato)', fontSize: '.85rem', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                                Reset filter
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* GRID */}
                <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 100px' }}>
                    {filtered.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 20 }}>
                            {filtered.map((p) => {
                                const out = !(p.stock > 0);
                                return (
                                    <div key={p.id} className={`pc ${out ? 'out' : ''}`}>
                                        <div style={{ aspectRatio: '4/3', background: 'var(--paper-2)', position: 'relative', overflow: 'hidden', borderBottom: '1.5px solid var(--ink)' }}>
                                            {out ? (
                                                <div style={{ position: 'absolute', top: 11, left: 11, background: 'var(--ink)', borderRadius: 100, padding: '4px 11px', fontSize: '.64rem', fontWeight: 700, color: '#fff', zIndex: 2, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                                                    Habis
                                                </div>
                                            ) : (p.transaction_items_sum_quantity > 0 && (
                                                <div style={{ position: 'absolute', top: 11, left: 11, background: 'var(--yellow)', borderRadius: 100, padding: '4px 11px', fontSize: '.64rem', fontWeight: 800, color: 'var(--ink)', zIndex: 2, letterSpacing: '.04em', textTransform: 'uppercase', boxShadow: '2px 2px 0 0 rgba(27,26,56,.28)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
                                                    {p.transaction_items_sum_quantity} terjual
                                                </div>
                                            ))}
                                            {p.image_url ? (
                                                <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: .5 }}>
                                                    <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ color: 'var(--ink-soft)' }}><path d="M12 21a9 9 0 0 0 9-7H3a9 9 0 0 0 9 7Z" /><path d="M7 21h10" /><path d="M19.5 12 22 6" /><path d="M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62" /><path d="M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62" /><path d="M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62" /></svg>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ padding: '15px 17px 17px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                                                <h3 className="d" style={{ fontSize: '1.14rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2, letterSpacing: '-.01em' }}>{p.name}</h3>
                                                <span className="d" style={{ fontSize: '1.06rem', fontWeight: 600, color: 'var(--tomato)', whiteSpace: 'nowrap', fontStyle: 'italic' }}>{formatPrice(p.selling_price)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '.7rem', color: 'var(--ink-soft)', padding: '3px 10px', border: '1px solid var(--border)', borderRadius: 100 }}>{p.category?.name || 'Jajanan'}</span>
                                                {!out && (
                                                    <span style={{ fontSize: '.7rem', color: 'var(--leaf)', fontWeight: 600 }}>
                                                        Stok {p.stock}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '90px 0', color: 'var(--ink-soft)', border: '1.5px dashed var(--border)', borderRadius: 18 }}>
                            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ marginBottom: 12, display: 'inline-block' }}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
                            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Nggak ketemu menunya</p>
                            <p style={{ fontSize: '.9rem' }}>Coba kata kunci lain atau reset filternya.</p>
                        </div>
                    )}
                </section>

                {/* FOOTER STRIP */}
                <footer style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '40px 32px', textAlign: 'center' }}>
                    <p className="d" style={{ fontSize: '1.4rem', fontStyle: 'italic', marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        Lihat yang kamu mau? Mampir aja.
                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2" /><path d="M5 11v11" /><path d="M9 2v20" /><path d="M21 15V2a5 5 0 0 0-3 5v6c0 1.1.9 2 2 2h1Zm0 0v7" /></svg>
                    </p>
                    <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.85rem' }}>Kantin Candaria · Buka 07.30 – 12.30 · Pesan langsung di tempat</p>
                </footer>
            </div>
        </>
    );
}
