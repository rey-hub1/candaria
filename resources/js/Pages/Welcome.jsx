import { Link, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Welcome({ canLogin, popularProducts }) {
    const [activeFaq, setActiveFaq] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const formatPrice = (price) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    const faqs = [
        { question: 'Apa itu Candaria?', answer: 'Candaria adalah platform Point of Sale modern yang dirancang khusus untuk memudahkan manajemen kantin sekolah dan mengelola sistem titipan siswa secara transparan.' },
        { question: 'Bagaimana cara menitipkan makanan?', answer: 'Siswa atau pihak penitip dapat mendaftar melalui admin kantin, kemudian menyerahkan barang titipan. Sistem akan mencatat stok dan hasil penjualan secara otomatis.' },
        { question: 'Apakah sistem ini bisa memantau stok secara real-time?', answer: 'Ya! Setiap transaksi yang terjadi akan langsung memperbarui data stok di dalam sistem, sehingga Anda bisa memantaunya kapan saja.' },
        { question: 'Bagaimana sistem pembagian hasil (margin) bekerja?', answer: 'Sistem memungkinkan admin untuk mengatur persentase margin atau potongan tetap dari setiap produk titipan yang terjual, yang akan otomatis dihitung saat pembagian hasil.' },
    ];

    const features = [
        { num: '01', title: 'Transaksi Cepat', desc: 'Proses kasir yang sangat responsif dan efisien untuk menghindari antrean panjang saat jam istirahat.' },
        { num: '02', title: 'Sistem Titipan Aman', desc: 'Pencatatan barang titipan yang rapi dengan pembagian margin otomatis dan riwayat penjualan yang jelas.' },
        { num: '03', title: 'Laporan Lengkap', desc: 'Pantau omzet, keuntungan, dan performa setiap produk dengan laporan komprehensif yang mudah dipahami.' },
    ];

    const tickerItems = ['Manajemen Kasir', 'Sistem Titipan', 'Laporan Real-Time', 'Stok Otomatis', 'Multi-Penitip', 'Ekspor Data'];

    return (
        <>
            <Head title="Candaria — Sistem Kantin Modern">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
            </Head>

            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                :root {
                    --gold: #9c6f1c;
                    --gold-light: #c08f2c;
                    --gold-pale: rgba(176,125,30,0.12);
                    --bg: #f8f3ea;
                    --bg-s: #f1e8d8;
                    --bg-r: #e9dcc6;
                    --text: #2a2316;
                    --muted: #6f6552;
                    --border: rgba(156,111,28,0.30);
                    --border-s: rgba(40,30,10,0.10);
                }
                html { scroll-behavior: smooth; }
                body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
                ::selection { background: rgba(176,125,30,0.25); color: var(--text); }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: var(--bg); }
                ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 2px; }

                .d { font-family: 'Cormorant Garamond', serif; }

                /* grain */
                .grain::after {
                    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
                    opacity: 0.28; mix-blend-mode: multiply;
                }

                /* animations */
                @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
                @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
                @keyframes floatA { 0%,100% { transform:translate(0,0) scale(1); } 40% { transform:translate(24px,-18px) scale(1.04); } 70% { transform:translate(-16px,10px) scale(0.96); } }
                @keyframes floatB { 0%,100% { transform:translate(0,0) scale(1); } 35% { transform:translate(-20px,16px) scale(1.05); } 65% { transform:translate(18px,-12px) scale(0.97); } }
                @keyframes rotateSlow { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
                @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
                @keyframes ticker { from { transform:translateX(0); } to { transform:translateX(-50%); } }
                @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

                .fu { animation: fadeUp 0.85s cubic-bezier(0.22,1,0.36,1) both; }
                .fi { animation: fadeIn 1s ease both; }
                .d1 { animation-delay:.1s; } .d2 { animation-delay:.22s; } .d3 { animation-delay:.36s; }
                .d4 { animation-delay:.5s; } .d5 { animation-delay:.65s; } .d6 { animation-delay:.8s; }

                .orb { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; }
                .fa { animation: floatA 14s ease-in-out infinite; }
                .fb { animation: floatB 18s ease-in-out infinite; }
                .rs { animation: rotateSlow 28s linear infinite; }

                .gold-text {
                    background: linear-gradient(135deg, #b8861f 0%, #8a6314 45%, #a87a16 100%);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
                }
                .shimmer {
                    background: linear-gradient(90deg, #8a6314 0%, #c79a3e 35%, #8a6314 55%, #a87a16 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
                    animation: shimmer 4s linear infinite;
                }
                .hr { border:none; height:1px; background: linear-gradient(90deg, transparent 0%, var(--gold) 40%, var(--gold-light) 50%, var(--gold) 60%, transparent 100%); opacity:.3; }

                /* navbar */
                .nav { position:fixed; top:0; left:0; right:0; z-index:100; padding:20px 0; transition:all .4s ease; }
                .nav.sc { background:rgba(248,243,234,0.82); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); padding:14px 0; border-bottom:1px solid var(--border-s); }
                .nav-link { color:var(--muted); font-size:.875rem; font-weight:500; text-decoration:none; transition:color .2s; }
                .nav-link:hover { color:var(--text); }

                /* buttons */
                .btn-g {
                    display:inline-flex; align-items:center; gap:9px;
                    background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 55%, #8a6a29 100%);
                    color:#0c0a06; font-weight:600; font-family:'DM Sans',sans-serif;
                    border-radius:100px; padding:13px 28px; font-size:.9rem; letter-spacing:.01em;
                    transition:all .3s ease; text-decoration:none; border:none; cursor:pointer;
                }
                .btn-g:hover { box-shadow:0 8px 32px rgba(168,130,53,0.45); transform:translateY(-2px); filter:brightness(1.08); }
                .btn-o {
                    display:inline-flex; align-items:center; gap:9px;
                    background:transparent; color:var(--text); font-weight:500;
                    font-family:'DM Sans',sans-serif; border-radius:100px; padding:12px 24px;
                    font-size:.9rem; border:1px solid var(--border-s); transition:all .3s ease;
                    text-decoration:none; cursor:pointer;
                }
                .btn-o:hover { border-color:var(--gold); color:var(--gold-light); background:var(--gold-pale); }

                /* section label */
                .lbl {
                    display:inline-flex; align-items:center; gap:8px;
                    font-size:.72rem; font-weight:500; letter-spacing:.12em;
                    text-transform:uppercase; color:var(--gold); margin-bottom:20px;
                }
                .lbl::before { content:''; display:block; width:22px; height:1px; background:var(--gold); }

                /* product card */
                .pc { background:var(--bg-s); border:1px solid var(--border-s); border-radius:16px; overflow:hidden; transition:all .5s cubic-bezier(.4,0,.2,1); position:relative; }
                .pc::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(168,130,53,.07) 0%,transparent 60%); opacity:0; transition:opacity .4s; z-index:1; }
                .pc:hover { border-color:var(--border); transform:translateY(-6px); box-shadow:0 20px 50px rgba(80,60,20,.14), 0 0 30px rgba(176,125,30,.12); }
                .pc:hover::before { opacity:1; }

                /* feature row */
                .feat { border-top:1px solid var(--border-s); padding:40px 0; transition:border-color .3s; cursor:default; }
                .feat:hover { border-color:var(--border); }
                .feat-n { font-family:'Cormorant Garamond',serif; font-size:3.5rem; font-weight:700; color:rgba(199,154,68,.28); line-height:1; transition:color .35s; min-width:76px; }
                .feat:hover .feat-n { color:rgba(230,192,116,.7); }

                /* faq */
                .faq-i { border-bottom:1px solid var(--border-s); }
                .faq-btn { width:100%; background:none; border:none; color:var(--text); cursor:pointer; padding:26px 0; display:flex; align-items:center; justify-content:space-between; gap:24px; text-align:left; transition:color .2s; }
                .faq-btn:hover, .faq-btn.on { color:var(--gold-light); }
                .faq-ico { width:20px; height:20px; color:var(--gold); flex-shrink:0; transition:transform .35s cubic-bezier(.4,0,.2,1); }
                .faq-ico.open { transform:rotate(180deg); }
                .faq-body { overflow:hidden; transition:max-height .4s cubic-bezier(.4,0,.2,1), opacity .3s; }

                /* ticker */
                .ticker-wrap { overflow:hidden; white-space:nowrap; }
                .ticker-inner { display:inline-flex; gap:56px; animation:ticker 28s linear infinite; }

                /* social */
                .soc { width:34px; height:34px; border-radius:50%; border:1px solid var(--border-s); display:flex; align-items:center; justify-content:center; color:var(--muted); transition:all .3s; text-decoration:none; }
                .soc:hover { border-color:var(--gold); color:var(--gold); background:var(--gold-pale); }

                /* pos mock */
                .pos { background:#fffdf8; border:1px solid var(--border); border-radius:18px; padding:18px; box-shadow:0 40px 90px rgba(80,60,20,.18), 0 0 70px rgba(176,125,30,.10); }
                .pos-item { background:var(--bg-r); border-radius:9px; padding:11px 9px; border:1px solid var(--border-s); cursor:pointer; transition:all .25s; }
                .pos-item:hover { border-color:var(--border); }

                /* responsive */
                @media (max-width: 900px) {
                    .hero-grid { grid-template-columns: 1fr !important; }
                    .hero-right { display: none !important; }
                    .feat-grid { grid-template-columns: 1fr !important; }
                    .feat-left { margin-bottom: 0 !important; }
                    .ft-grid { grid-template-columns: 1fr 1fr !important; gap: 40px !important; }
                }
                @media (max-width: 600px) {
                    .nav-links { display: none !important; }
                    .ft-grid { grid-template-columns: 1fr !important; }
                    .hero-stats { gap: 24px !important; }
                }
            `}</style>

            <div className="grain" style={{ minHeight: '100vh', background: '#f8f3ea', position: 'relative' }}>

                {/* ── NAV ── */}
                <nav className={`nav ${scrolled ? 'sc' : ''}`}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src="/logo.jpeg" alt="Candaria" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }} />
                            <span className="d" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '-.01em' }}>Candaria</span>
                        </Link>
                        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                            <a href="#features" className="nav-link">Fitur</a>
                            <a href="#products" className="nav-link">Produk</a>
                            <a href="#faq" className="nav-link">FAQ</a>
                            {canLogin
                                ? <Link href={route('dashboard')} className="btn-g" style={{ padding: '9px 20px', fontSize: '.85rem' }}>Dashboard →</Link>
                                : <Link href={route('login')} className="btn-g" style={{ padding: '9px 20px', fontSize: '.85rem' }}>Masuk →</Link>
                            }
                        </div>
                    </div>
                </nav>

                {/* ── HERO ── */}
                <header style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
                    <div className="orb fa" style={{ width: 560, height: 560, background: 'radial-gradient(circle, rgba(168,130,53,.13) 0%, transparent 70%)', top: '-8%', left: '-8%' }} />
                    <div className="orb fb" style={{ width: 440, height: 440, background: 'radial-gradient(circle, rgba(168,130,53,.08) 0%, transparent 70%)', bottom: '0', right: '-4%' }} />

                    <div className="hero-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 32px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
                        {/* Left */}
                        <div>
                            <div className="lbl fu">Sistem Kantin #1</div>
                            <h1 className="d fu d1" style={{ fontSize: 'clamp(2.8rem, 5vw, 5.2rem)', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-.025em', marginBottom: 24 }}>
                                Kantin Anda,<br />
                                <em className="gold-text" style={{ fontStyle: 'italic' }}>Lebih Pintar.</em>
                            </h1>
                            <p className="fu d2" style={{ fontSize: '1.05rem', color: 'var(--muted)', lineHeight: 1.75, marginBottom: 40, maxWidth: 460 }}>
                                Platform Point of Sale modern untuk manajemen kantin sekolah — transaksi cepat, titipan transparan, laporan real-time.
                            </p>
                            <div className="fu d3" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                <a href="#products" className="btn-g">
                                    Jelajahi Produk
                                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </a>
                                <a href="https://wa.me/6281234567890?text=Halo%20Admin%20Candaria" target="_blank" rel="noopener noreferrer" className="btn-o">
                                    <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.573-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.205.534 1.292.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.082 21.166c-1.488 0-2.915-.369-4.175-1.06l-4.636 1.218 1.242-4.516c-.768-1.289-1.172-2.784-1.172-4.331 0-4.908 3.993-8.899 8.906-8.899 4.912 0 8.904 3.991 8.904 8.899 0 4.907-3.992 8.899-8.904 8.899z"/>
                                    </svg>
                                    WhatsApp
                                </a>
                            </div>
                            <div className="hero-stats fu d4" style={{ display: 'flex', gap: 40, marginTop: 52, paddingTop: 36, borderTop: '1px solid var(--border-s)' }}>
                                {[['99.9%','Uptime'], ['< 1s','Respons'], ['∞','Riwayat']].map(([v, l]) => (
                                    <div key={l}>
                                        <div className="d" style={{ fontSize: '1.7rem', fontWeight: 700, color: 'var(--gold-light)', marginBottom: 4 }}>{v}</div>
                                        <div style={{ fontSize: '.72rem', color: 'var(--muted)', letterSpacing: '.05em', textTransform: 'uppercase' }}>{l}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right — POS mockup */}
                        <div className="hero-right fi d5" style={{ position: 'relative' }}>
                            <div className="rs" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 460, height: 460, border: '1px solid rgba(168,130,53,.08)', borderRadius: '50%', borderTopColor: 'rgba(168,130,53,.35)' }} />
                            <div className="rs" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 380, height: 380, border: '1px dashed rgba(168,130,53,.06)', borderRadius: '50%', animationDirection: 'reverse', animationDuration: '40s' }} />
                            <div className="pos" style={{ position: 'relative', zIndex: 1 }}>
                                {/* Window chrome */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border-s)' }}>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {['#ff5f57','#ffbd2e','#28c840'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
                                    </div>
                                    <span style={{ fontSize: '.65rem', color: 'var(--muted)', fontFamily: 'monospace', letterSpacing: '.05em' }}>CANDARIA POS</span>
                                    <div style={{ width: 48, height: 5, borderRadius: 3, background: 'var(--bg-r)' }} />
                                </div>
                                {/* Product grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
                                    {[
                                        { n: 'Nasi Goreng', p: 'Rp 8.000', c: '#e8a44a' },
                                        { n: 'Mie Ayam',    p: 'Rp 7.000', c: '#7ec8a4' },
                                        { n: 'Es Teh',      p: 'Rp 3.000', c: '#6aabd6' },
                                        { n: 'Pisang Gr.',  p: 'Rp 5.000', c: '#d4a453' },
                                        { n: 'Bakso',       p: 'Rp 10.000', c: '#c47d7d' },
                                        { n: 'Jus Jeruk',   p: 'Rp 8.000', c: '#e8884a' },
                                    ].map((item, i) => (
                                        <div key={i} className="pos-item">
                                            <div style={{ width: '100%', height: 36, borderRadius: 6, background: `${item.c}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 7 }}>
                                                <div style={{ width: 20, height: 20, borderRadius: 5, background: `${item.c}50` }} />
                                            </div>
                                            <div style={{ fontSize: '.6rem', color: 'var(--text)', fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.n}</div>
                                            <div style={{ fontSize: '.58rem', color: 'var(--gold)', fontWeight: 600 }}>{item.p}</div>
                                        </div>
                                    ))}
                                </div>
                                {/* Cart */}
                                <div style={{ background: 'var(--bg-r)', borderRadius: 11, padding: 13, border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginBottom: 9, letterSpacing: '.07em', textTransform: 'uppercase' }}>Keranjang</div>
                                    {[{ n: 'Nasi Goreng', q: '×2', t: 'Rp 16.000' }, { n: 'Es Teh', q: '×1', t: 'Rp 3.000' }].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                                            <div>
                                                <div style={{ fontSize: '.68rem', color: 'var(--text)', fontWeight: 500 }}>{item.n}</div>
                                                <div style={{ fontSize: '.58rem', color: 'var(--muted)' }}>{item.q}</div>
                                            </div>
                                            <div style={{ fontSize: '.68rem', color: 'var(--gold-light)', fontWeight: 600 }}>{item.t}</div>
                                        </div>
                                    ))}
                                    <div style={{ borderTop: '1px solid var(--border-s)', marginTop: 9, paddingTop: 9, display: 'flex', justifyContent: 'space-between', marginBottom: 11 }}>
                                        <span style={{ fontSize: '.72rem', color: 'var(--text)', fontWeight: 600 }}>Total</span>
                                        <span className="d" style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--gold-light)' }}>Rp 19.000</span>
                                    </div>
                                    <div style={{ background: 'linear-gradient(135deg, var(--gold-light), var(--gold))', borderRadius: 7, padding: '9px', textAlign: 'center', color: '#0c0a06', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.05em', cursor: 'pointer' }}>
                                        BAYAR SEKARANG
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── TICKER ── */}
                <div style={{ borderTop: '1px solid var(--border-s)', borderBottom: '1px solid var(--border-s)', padding: '13px 0', background: 'rgba(168,130,53,.04)' }}>
                    <div className="ticker-wrap">
                        <div className="ticker-inner">
                            {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((t, i) => (
                                <span key={i} style={{ fontSize: '.75rem', letterSpacing: '.08em', color: i % tickerItems.length === 0 ? 'var(--gold)' : 'var(--muted)' }}>
                                    {i % tickerItems.length === 0 ? '◆' : '·'} {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── PRODUCTS ── */}
                <section id="products" style={{ padding: '110px 32px', maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 56, flexWrap: 'wrap' }}>
                        <div>
                            <div className="lbl">Produk Unggulan</div>
                            <h2 className="d" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-.02em' }}>
                                Terpopuler <em className="gold-text" style={{ fontStyle: 'italic' }}>Hari Ini</em>
                            </h2>
                        </div>
                        <p style={{ color: 'var(--muted)', maxWidth: 300, lineHeight: 1.65, fontSize: '.9rem' }}>
                            Jajanan paling dicari siswa, tersedia langsung di kantin Anda.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 18 }}>
                        {popularProducts && popularProducts.length > 0 ? (
                            popularProducts.map((product, index) => (
                                <div key={product.id} className="pc">
                                    <div style={{ aspectRatio: '4/3', background: 'var(--bg-r)', position: 'relative', overflow: 'hidden' }}>
                                        {index < 3 && (
                                            <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,253,248,.88)', backdropFilter: 'blur(8px)', border: '1px solid var(--border)', borderRadius: 100, padding: '3px 9px', fontSize: '.65rem', fontWeight: 700, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4, zIndex: 2 }}>
                                                    <svg width="9" height="9" fill="var(--gold)" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    Top {index + 1}
                                                </div>
                                        )}
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                                                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '14px 16px 16px', position: 'relative', zIndex: 2 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 9 }}>
                                            <h3 style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{product.name}</h3>
                                            <span className="d" style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--gold-light)', whiteSpace: 'nowrap' }}>{formatPrice(product.selling_price)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '.68rem', color: 'var(--muted)', padding: '2px 8px', border: '1px solid var(--border-s)', borderRadius: 100 }}>{product.category?.name || 'Umum'}</span>
                                            <span style={{ fontSize: '.68rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                                {product.transaction_items_sum_quantity || 0} terjual
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: 'var(--muted)', border: '1px dashed var(--border-s)', borderRadius: 14 }}>
                                Belum ada produk terlaris saat ini.
                            </div>
                        )}
                    </div>
                </section>

                <hr className="hr" style={{ maxWidth: 1200, margin: '0 auto 0' }} />

                {/* ── FEATURES ── */}
                <section id="features" style={{ padding: '110px 32px', maxWidth: 1200, margin: '0 auto' }}>
                    <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80, alignItems: 'flex-start' }}>
                        <div className="feat-left" style={{ position: 'sticky', top: 120 }}>
                            <div className="lbl">Keunggulan</div>
                            <h2 className="d" style={{ fontSize: 'clamp(1.8rem,3vw,3rem)', fontWeight: 600, lineHeight: 1.15, letterSpacing: '-.02em', marginBottom: 20 }}>
                                Kenapa<br /><em className="gold-text" style={{ fontStyle: 'italic' }}>Candaria?</em>
                            </h2>
                            <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: '.9rem' }}>
                                Dirancang khusus untuk ritme kantin sekolah yang padat dan dinamis.
                            </p>
                        </div>
                        <div>
                            {features.map((f, i) => (
                                <div key={i} className="feat" style={{ display: 'flex', gap: 36, alignItems: 'flex-start' }}>
                                    <span className="feat-n">{f.num}</span>
                                    <div style={{ paddingTop: 6 }}>
                                        <h3 className="d" style={{ fontSize: '1.55rem', fontWeight: 600, color: 'var(--text)', marginBottom: 10, letterSpacing: '-.01em' }}>{f.title}</h3>
                                        <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: '.9rem' }}>{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <hr className="hr" style={{ maxWidth: 1200, margin: '0 auto' }} />

                {/* ── FAQ ── */}
                <section id="faq" style={{ padding: '110px 32px', maxWidth: 760, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}><div className="lbl">FAQ</div></div>
                        <h2 className="d" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-.02em' }}>
                            Pertanyaan <em className="gold-text" style={{ fontStyle: 'italic' }}>Umum</em>
                        </h2>
                    </div>
                    {faqs.map((faq, i) => (
                        <div key={i} className="faq-i">
                            <button className={`faq-btn ${activeFaq === i ? 'on' : ''}`} onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                                <span className="d" style={{ fontSize: '1.15rem', fontWeight: 500, letterSpacing: '-.01em' }}>{faq.question}</span>
                                <svg className={`faq-ico ${activeFaq === i ? 'open' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className="faq-body" style={{ maxHeight: activeFaq === i ? 180 : 0, opacity: activeFaq === i ? 1 : 0 }}>
                                <p style={{ color: 'var(--muted)', lineHeight: 1.75, paddingBottom: 26, fontSize: '.9rem' }}>{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </section>

                {/* ── CTA ── */}
                <section style={{ position: 'relative', overflow: 'hidden', padding: '110px 32px', textAlign: 'center', background: 'var(--bg-s)', borderTop: '1px solid var(--border-s)' }}>
                    <div className="orb" style={{ width: 700, height: 700, background: 'radial-gradient(circle, rgba(168,130,53,.14) 0%, transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}><div className="lbl">Mulai Sekarang</div></div>
                        <h2 className="d" style={{ fontSize: 'clamp(2.4rem,5vw,4.8rem)', fontWeight: 600, lineHeight: 1.06, letterSpacing: '-.03em', marginBottom: 24 }}>
                            Siap Mengubah<br />
                            <em className="shimmer" style={{ fontStyle: 'italic' }}>Kantin Anda?</em>
                        </h2>
                        <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.75, marginBottom: 44, maxWidth: 460, margin: '0 auto 44px' }}>
                            Tingkatkan efisiensi, transparansi, dan kemudahan manajemen kantin sekolah Anda.
                        </p>
                        <a href="https://wa.me/6281234567890?text=Halo%20Admin%20Candaria" target="_blank" rel="noopener noreferrer" className="btn-g" style={{ fontSize: '.95rem', padding: '15px 36px' }}>
                            <svg width="19" height="19" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.573-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.205.534 1.292.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.082 21.166c-1.488 0-2.915-.369-4.175-1.06l-4.636 1.218 1.242-4.516c-.768-1.289-1.172-2.784-1.172-4.331 0-4.908 3.993-8.899 8.906-8.899 4.912 0 8.904 3.991 8.904 8.899 0 4.907-3.992 8.899-8.904 8.899z"/>
                            </svg>
                            Hubungi via WhatsApp
                        </a>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer style={{ background: 'var(--bg-s)', borderTop: '1px solid var(--border-s)', padding: '56px 32px 36px' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div className="ft-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 56, marginBottom: 52 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
                                    <img src="/logo.jpeg" alt="Candaria" style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover', border: '1px solid var(--border)' }} />
                                    <span className="d" style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)' }}>Candaria</span>
                                </div>
                                <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: '.85rem', maxWidth: 280, marginBottom: 22 }}>
                                    Platform inovatif untuk manajemen kantin sekolah yang menyederhanakan transaksi dan pengelolaan sistem titipan.
                                </p>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {[
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>,
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>,
                                    ].map((d, i) => (
                                        <a key={i} href="#" className="soc">
                                            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">{d}</svg>
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: 22 }}>Navigasi</h4>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 13 }}>
                                    {[['Produk Populer','#products'],['Fitur Kami','#features'],['FAQ','#faq'],['Masuk Sistem', route('login')]].map(([l, h]) => (
                                        <li key={l}><a href={h} style={{ color: 'var(--muted)', fontSize: '.85rem', textDecoration: 'none', transition: 'color .2s' }}
                                            onMouseOver={e => e.target.style.color = 'var(--gold-light)'}
                                            onMouseOut={e => e.target.style.color = 'var(--muted)'}>{l}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: 22 }}>Kontak</h4>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 13 }}>
                                    <li style={{ color: 'var(--muted)', fontSize: '.85rem', lineHeight: 1.55 }}>Jl. Pendidikan No. 123<br />Kota Pelajar, Indonesia</li>
                                    <li><a href="mailto:hello@candaria.com" style={{ color: 'var(--muted)', fontSize: '.85rem', textDecoration: 'none', transition: 'color .2s' }}
                                        onMouseOver={e => e.target.style.color = 'var(--gold-light)'}
                                        onMouseOut={e => e.target.style.color = 'var(--muted)'}>hello@candaria.com</a></li>
                                    <li style={{ color: 'var(--muted)', fontSize: '.85rem' }}>+62 812 3456 7890</li>
                                </ul>
                            </div>
                        </div>
                        <hr className="hr" />
                        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                            <p style={{ color: 'var(--muted)', fontSize: '.75rem' }}>&copy; {new Date().getFullYear()} Candaria POS System. All rights reserved.</p>
                            <div style={{ display: 'flex', gap: 20 }}>
                                {['Kebijakan Privasi','Syarat & Ketentuan'].map(t => (
                                    <a key={t} href="#" style={{ color: 'var(--muted)', fontSize: '.75rem', textDecoration: 'none', transition: 'color .2s' }}
                                        onMouseOver={e => e.target.style.color = 'var(--text)'}
                                        onMouseOut={e => e.target.style.color = 'var(--muted)'}>{t}</a>
                                ))}
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
