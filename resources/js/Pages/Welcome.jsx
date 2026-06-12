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
        { question: 'Jam berapa kantin buka?', answer: 'Candaria buka setiap hari sekolah mulai pukul 07.30 sampai 12.30. Jam istirahat adalah waktu paling ramai — datang lebih awal biar nggak kehabisan favorit kamu.' },
        { question: 'Bisa pesan online dulu?', answer: 'Belum bisa, ya. Pemesanan hanya di tempat — datang langsung ke kantin, pilih menu di etalase, lalu bayar di kasir. Mampir pas awal istirahat biar nggak antri panjang.' },
        { question: 'Bayarnya pakai apa?', answer: 'Tunai dan QRIS, keduanya kami terima. Kasir cepat, kembalian pas, struk jelas — tinggal makan tanpa ribet.' },
        { question: 'Aku mau nitip jualan, gimana?', answer: 'Gampang. Datang langsung ke kantin dan ngobrol sama admin di tempat. Titip daganganmu, hasil penjualan dibagi transparan otomatis. Cocok buat kamu yang mau cari cuan dari jajanan buatan sendiri.' },
    ];

    const values = [
        { num: '01', title: 'Selalu Fresh', desc: 'Masakan dibuat tiap hari, nggak nginep. Nasi masih ngepul, gorengan masih garing pas sampai tanganmu.' },
        { num: '02', title: 'Harga Pelajar', desc: 'Dompet anak sekolah aman. Porsi mengenyangkan mulai ribuan rupiah — kenyang nggak harus mahal.' },
        { num: '03', title: 'Antri Cepat', desc: 'Kasir kilat bikin antrean jam istirahat jalan terus. Pesan, bayar, balik ke kelas tepat waktu.' },
    ];

    const tickerItems = ['Nasi Goreng', 'Mie Ayam', 'Bakso Kuah', 'Es Teh Manis', 'Gorengan Anget', 'Jus Segar', 'Pisang Goreng', 'Cireng'];

    return (
        <>
            <Head title="Candaria — Kantin Sekolah, Jajanan Favorit">
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
                    --saffron: #ffd60a;
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
                ::-webkit-scrollbar-track { background: var(--paper); }
                ::-webkit-scrollbar-thumb { background: var(--tomato); border-radius: 2px; }

                .d { font-family: 'Fraunces', serif; }

                /* grain */
                .grain::after {
                    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
                    opacity: 0.4; mix-blend-mode: multiply;
                }

                /* animations */
                @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
                @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
                @keyframes floatA { 0%,100% { transform:translate(0,0) rotate(-6deg); } 50% { transform:translate(0,-16px) rotate(-3deg); } }
                @keyframes floatB { 0%,100% { transform:translate(0,0) rotate(8deg); } 50% { transform:translate(0,14px) rotate(5deg); } }
                @keyframes spinPlate { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
                @keyframes ticker { from { transform:translateX(0); } to { transform:translateX(-50%); } }
                @keyframes steam { 0% { opacity:0; transform:translateY(0) scaleX(1); } 30% { opacity:.5; } 100% { opacity:0; transform:translateY(-26px) scaleX(1.6); } }
                @keyframes wiggle { 0%,100% { transform:rotate(-2.5deg); } 50% { transform:rotate(2.5deg); } }

                .fu { animation: fadeUp 0.85s cubic-bezier(0.22,1,0.36,1) both; }
                .fi { animation: fadeIn 1s ease both; }
                .d1 { animation-delay:.1s; } .d2 { animation-delay:.22s; } .d3 { animation-delay:.36s; }
                .d4 { animation-delay:.5s; } .d5 { animation-delay:.6s; } .d6 { animation-delay:.8s; }

                .ink-em { color: var(--tomato); font-style: italic; }
                .saffron-em { color: var(--saffron); font-style: italic; }

                .hr { border:none; height:1px; background: repeating-linear-gradient(90deg, var(--border) 0 8px, transparent 8px 16px); opacity:.8; }

                /* navbar */
                .nav { position:fixed; top:0; left:0; right:0; z-index:100; padding:20px 0; transition:all .4s ease; }
                .nav.sc { background:rgba(255,255,255,0.86); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); padding:13px 0; border-bottom:1px solid var(--border-s); }
                .nav-link { color:var(--ink-soft); font-size:.875rem; font-weight:500; text-decoration:none; transition:color .2s; }
                .nav-link:hover { color:var(--tomato); }

                /* buttons */
                .btn-g {
                    display:inline-flex; align-items:center; gap:9px;
                    background: var(--yellow);
                    color:var(--ink); font-weight:700; font-family:'DM Sans',sans-serif;
                    border-radius:100px; padding:13px 28px; font-size:.92rem; letter-spacing:.01em;
                    transition:all .25s ease; text-decoration:none; border:none; cursor:pointer;
                    box-shadow:0 6px 0 0 var(--yellow-d);
                }
                .btn-g:hover { transform:translateY(2px); box-shadow:0 3px 0 0 var(--yellow-d); background:#ffe04d; }
                .btn-g:active { transform:translateY(6px); box-shadow:0 0 0 0 var(--yellow-d); }
                .btn-o {
                    display:inline-flex; align-items:center; gap:9px;
                    background:transparent; color:var(--ink); font-weight:600;
                    font-family:'DM Sans',sans-serif; border-radius:100px; padding:12px 24px;
                    font-size:.92rem; border:1.5px solid var(--ink); transition:all .25s ease;
                    text-decoration:none; cursor:pointer;
                }
                .btn-o:hover { background:var(--ink); color:var(--paper); }

                /* section label */
                .lbl {
                    display:inline-flex; align-items:center; gap:8px;
                    font-size:.72rem; font-weight:600; letter-spacing:.14em;
                    text-transform:uppercase; color:var(--tomato); margin-bottom:20px;
                }
                .lbl::before { content:'●'; font-size:.6rem; line-height:1; }

                /* menu card */
                .pc { background:var(--paper); border:1.5px solid var(--ink); border-radius:18px; overflow:hidden; transition:all .35s cubic-bezier(.4,0,.2,1); position:relative; box-shadow:5px 5px 0 0 rgba(27,26,56,.16); }
                .pc:hover { transform:translate(-3px,-3px); box-shadow:9px 9px 0 0 var(--yellow); border-color:var(--tomato); }

                /* value row */
                .feat { border-top:1.5px solid var(--border); padding:40px 0; transition:all .3s; cursor:default; }
                .feat:hover { border-color:var(--tomato); padding-left:14px; }
                .feat-n { font-family:'Fraunces',serif; font-size:3.4rem; font-weight:600; font-style:italic; color:var(--paper-3); line-height:1; transition:color .35s; min-width:84px; }
                .feat:hover .feat-n { color:var(--tomato); }

                /* faq */
                .faq-i { border-bottom:1.5px solid var(--border); }
                .faq-btn { width:100%; background:none; border:none; color:var(--ink); cursor:pointer; padding:26px 0; display:flex; align-items:center; justify-content:space-between; gap:24px; text-align:left; transition:color .2s; }
                .faq-btn:hover, .faq-btn.on { color:var(--tomato); }
                .faq-ico { width:26px; height:26px; flex-shrink:0; transition:transform .35s cubic-bezier(.4,0,.2,1); color:var(--tomato); }
                .faq-ico.open { transform:rotate(45deg); }
                .faq-body { overflow:hidden; transition:max-height .4s cubic-bezier(.4,0,.2,1), opacity .3s; }

                /* ticker */
                .ticker-wrap { overflow:hidden; white-space:nowrap; }
                .ticker-inner { display:inline-flex; gap:0; animation:ticker 30s linear infinite; }
                .tick { font-family:'Fraunces',serif; font-style:italic; font-size:1.5rem; font-weight:500; padding:0 30px; display:inline-flex; align-items:center; gap:30px; }

                /* social */
                .soc { width:36px; height:36px; border-radius:50%; border:1.5px solid var(--ink); display:flex; align-items:center; justify-content:center; color:var(--ink); transition:all .25s; text-decoration:none; }
                .soc:hover { background:var(--tomato); border-color:var(--tomato); color:#ffffff; transform:translateY(-2px); }

                /* hero plate */
                .plate-ring { position:absolute; border-radius:50%; }
                .food-chip {
                    position:absolute; background:var(--paper); border:1.5px solid var(--ink);
                    border-radius:14px; padding:11px 16px; box-shadow:4px 4px 0 0 rgba(27,26,56,.18);
                    display:flex; align-items:center; gap:10px; white-space:nowrap;
                }
                .steam { position:absolute; width:6px; height:24px; border-radius:3px; background:rgba(255,255,255,.7); filter:blur(2px); }

                /* responsive */
                @media (max-width: 920px) {
                    .hero-grid { grid-template-columns: 1fr !important; gap:48px !important; }
                    .hero-right { display:none !important; }
                    .feat-grid { grid-template-columns: 1fr !important; }
                    .feat-left { position:static !important; margin-bottom:0 !important; }
                    .ft-grid { grid-template-columns: 1fr 1fr !important; gap:40px !important; }
                }
                @media (max-width: 600px) {
                    .nav-links { display:none !important; }
                    .ft-grid { grid-template-columns: 1fr !important; }
                    .hero-stats { gap:24px !important; }
                }
            `}</style>

            <div className="grain" style={{ minHeight: '100vh', background: 'var(--paper)', position: 'relative' }}>

                {/* ── NAV ── */}
                <nav className={`nav ${scrolled ? 'sc' : ''}`}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src="/img/logo-color.png" alt="Candaria" style={{ width: 66, height: 66, objectFit: 'contain', flexShrink: 0 }} />
                        </Link>
                        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                            <a href="#menu" className="nav-link">Menu</a>
                            <a href="#kenapa" className="nav-link">Kenapa Kami</a>
                            <a href="#faq" className="nav-link">FAQ</a>
                            <Link href={route('menu')} className="btn-g" style={{ padding: '9px 20px', fontSize: '.85rem' }}>Semua Menu</Link>
                            {canLogin
                                ? <Link href={route('dashboard')} className="nav-link" style={{ opacity: .7 }}>Dashboard</Link>
                                : <Link href={route('login')} className="nav-link" style={{ opacity: .7 }}>Masuk Staff</Link>
                            }
                        </div>
                    </div>
                </nav>

                {/* ── HERO ── */}
                <header style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
                    <div className="hero-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 32px', width: '100%', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 70, alignItems: 'center' }}>
                        {/* Left */}
                        <div>
                            <div className="lbl fu">Kantin Sekolah · Buka 07.30–12.30</div>
                            <h1 className="d fu d1" style={{ fontSize: 'clamp(3rem, 6vw, 6rem)', fontWeight: 600, lineHeight: 0.98, letterSpacing: '-.03em', marginBottom: 26 }}>
                                Lapar?<br />
                                Mampir ke <span className="ink-em">Candaria.</span>
                            </h1>
                            <p className="fu d2" style={{ fontSize: '1.12rem', color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 38, maxWidth: 470 }}>
                                Jajanan favorit anak sekolah — nasi goreng ngepul, mie ayam gurih, gorengan anget, sampai es segar. Datang langsung ke kantin, pilih di etalase, bayar di kasir.
                            </p>
                            <div className="fu d3" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                <a href="#menu" className="btn-g">
                                    Lihat Menu Favorit
                                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </a>
                                <a href="#faq" className="btn-o">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Jam Buka & Info
                                </a>
                            </div>
                            <p className="fu d3" style={{ marginTop: 16, fontSize: '.82rem', color: 'var(--ink-soft)', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--leaf)', display: 'inline-block' }} />
                                Belum melayani pesan online — datang langsung ya.
                            </p>
                            <div className="hero-stats fu d4" style={{ display: 'flex', gap: 44, marginTop: 52, paddingTop: 36, borderTop: '1.5px solid var(--border)' }}>
                                {[['Rp3rb', 'Mulai dari'], ['100%', 'Fresh harian'], ['< 2mnt', 'Antri kasir']].map(([v, l]) => (
                                    <div key={l}>
                                        <div className="d" style={{ fontSize: '1.9rem', fontWeight: 600, color: 'var(--tomato)', marginBottom: 4, fontStyle: 'italic' }}>{v}</div>
                                        <div style={{ fontSize: '.72rem', color: 'var(--ink-soft)', letterSpacing: '.05em', textTransform: 'uppercase' }}>{l}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right — hot plate visual */}
                        <div className="hero-right fi d5" style={{ position: 'relative', height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {/* dashed spinning ring */}
                            <div className="plate-ring" style={{ width: 380, height: 380, border: '2px dashed var(--border)', animation: 'spinPlate 50s linear infinite' }} />
                            {/* plate */}
                            <div style={{ position: 'absolute', width: 290, height: 290, borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%, #ffffff 0%, var(--paper-2) 55%, var(--paper-3) 100%)', border: '1.5px solid var(--ink)', boxShadow: '0 30px 60px rgba(27,26,56,.22), inset 0 0 0 14px rgba(27,26,56,.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: 210, height: 210, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'radial-gradient(circle at 50% 40%, rgba(44,42,156,.12), transparent 70%)' }}>
                                    {/* steam */}
                                    <div className="steam" style={{ top: 22, left: '42%', animation: 'steam 2.6s ease-in-out infinite' }} />
                                    <div className="steam" style={{ top: 18, left: '54%', animation: 'steam 2.6s ease-in-out .9s infinite' }} />
                                    <div className="steam" style={{ top: 26, left: '48%', animation: 'steam 2.6s ease-in-out 1.7s infinite' }} />
                                    <svg width="92" height="92" fill="none" stroke="var(--tomato)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 21a9 9 0 0 0 9-7H3a9 9 0 0 0 9 7Z" /><path d="M7 21h10" /><path d="M19.5 12 22 6" /><path d="M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62" /><path d="M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62" /><path d="M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62" /></svg>
                                    <span className="d" style={{ fontStyle: 'italic', fontSize: '.95rem', color: 'var(--ink-soft)', marginTop: 8 }}>menu hari ini</span>
                                </div>
                            </div>
                            {/* floating chips */}
                            <div className="food-chip" style={{ top: 34, right: 0, animation: 'floatA 5s ease-in-out infinite' }}>
                                <svg width="20" height="20" fill="none" stroke="var(--tomato)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 21a9 9 0 0 0 9-7H3a9 9 0 0 0 9 7Z" /><path d="M7 21h10" /><path d="M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62" /><path d="M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62" /><path d="M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62" /></svg>
                                <div>
                                    <div style={{ fontSize: '.74rem', fontWeight: 600 }}>Mie Ayam</div>
                                    <div className="d" style={{ fontSize: '.74rem', fontStyle: 'italic', color: 'var(--tomato)' }}>Rp7.000</div>
                                </div>
                            </div>
                            <div className="food-chip" style={{ bottom: 56, left: -6, animation: 'floatB 6s ease-in-out infinite' }}>
                                <svg width="20" height="20" fill="none" stroke="var(--tomato)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8" /><path d="M5 8h14" /><path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0" /><path d="m12 8 1-6h2" /></svg>
                                <div>
                                    <div style={{ fontSize: '.74rem', fontWeight: 600 }}>Es Teh</div>
                                    <div className="d" style={{ fontSize: '.74rem', fontStyle: 'italic', color: 'var(--tomato)' }}>Rp3.000</div>
                                </div>
                            </div>
                            <div className="food-chip" style={{ bottom: 8, right: 30, animation: 'floatA 5.5s ease-in-out .6s infinite' }}>
                                <svg width="20" height="20" fill="none" stroke="var(--tomato)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" /><path d="M8.5 8.5v.01" /><path d="M16 15.5v.01" /><path d="M12 12v.01" /><path d="M11 17v.01" /><path d="M7 14v.01" /></svg>
                                <div>
                                    <div style={{ fontSize: '.74rem', fontWeight: 600 }}>Pisang Gr.</div>
                                    <div className="d" style={{ fontSize: '.74rem', fontStyle: 'italic', color: 'var(--tomato)' }}>Rp5.000</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── TICKER ── */}
                <div style={{ borderTop: '1.5px solid var(--ink)', borderBottom: '1.5px solid var(--ink)', padding: '14px 0', background: 'var(--tomato)', color: '#ffffff', overflow: 'hidden' }}>
                    <div className="ticker-wrap">
                        <div className="ticker-inner">
                            {[...tickerItems, ...tickerItems, ...tickerItems].map((t, i) => (
                                <span key={i} className="tick">{t}<svg width="11" height="11" viewBox="0 0 24 24" fill="var(--yellow)" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" /></svg></span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── MENU ── */}
                <section id="menu" style={{ padding: '110px 32px', maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 56, flexWrap: 'wrap' }}>
                        <div>
                            <div className="lbl">Paling Laris</div>
                            <h2 className="d" style={{ fontSize: 'clamp(2.2rem,4.5vw,3.6rem)', fontWeight: 600, lineHeight: 1.04, letterSpacing: '-.02em' }}>
                                Menu Favorit <span className="ink-em">Hari Ini</span>
                            </h2>
                        </div>
                        <p style={{ color: 'var(--ink-soft)', maxWidth: 320, lineHeight: 1.65, fontSize: '.95rem' }}>
                            Yang paling diburu teman-temanmu pas bel istirahat. Stok terbatas — siapa cepat, dia kenyang.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 22 }}>
                        {popularProducts && popularProducts.length > 0 ? (
                            popularProducts.map((product, index) => (
                                <div key={product.id} className="pc">
                                    <div style={{ aspectRatio: '4/3', background: 'var(--paper-2)', position: 'relative', overflow: 'hidden', borderBottom: '1.5px solid var(--ink)' }}>
                                        {index < 3 && (
                                            <div style={{ position: 'absolute', top: 11, left: 11, background: 'var(--yellow)', borderRadius: 100, padding: '4px 11px', fontSize: '.66rem', fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 4, zIndex: 2, letterSpacing: '.04em', textTransform: 'uppercase', boxShadow: '2px 2px 0 0 rgba(27,26,56,.28)' }}>
                                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
                                                Top {index + 1}
                                            </div>
                                        )}
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: .5 }}>
                                                <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ color: 'var(--ink-soft)' }}><path d="M12 21a9 9 0 0 0 9-7H3a9 9 0 0 0 9 7Z" /><path d="M7 21h10" /><path d="M19.5 12 22 6" /><path d="M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62" /><path d="M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62" /><path d="M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '16px 18px 18px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 11 }}>
                                            <h3 className="d" style={{ fontSize: '1.18rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2, letterSpacing: '-.01em' }}>{product.name}</h3>
                                            <span className="d" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--tomato)', whiteSpace: 'nowrap', fontStyle: 'italic' }}>{formatPrice(product.selling_price)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '.7rem', color: 'var(--ink-soft)', padding: '3px 10px', border: '1px solid var(--border)', borderRadius: 100 }}>{product.category?.name || 'Jajanan'}</span>
                                            <span style={{ fontSize: '.7rem', color: 'var(--leaf)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                                                {product.transaction_items_sum_quantity || 0} terjual
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: 'var(--ink-soft)', border: '1.5px dashed var(--border)', borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" /><line x1="6" y1="17" x2="18" y2="17" /></svg>
                                Dapur lagi siap-siap — menu favorit segera tersaji.
                            </div>
                        )}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 48 }}>
                        <div style={{ marginBottom: 20 }}>
                            <Link href={route('menu')} className="btn-g">
                                Lihat Semua Menu
                                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                        <p style={{ color: 'var(--ink-soft)', fontSize: '.95rem', marginTop: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <span>Mau yang ini? <span style={{ color: 'var(--tomato)', fontWeight: 600 }}>Datang langsung ke kantin</span> dan pilih di etalase.</span>
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 21a9 9 0 0 0 9-7H3a9 9 0 0 0 9 7Z" /><path d="M7 21h10" /><path d="M19.5 12 22 6" /><path d="M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62" /><path d="M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62" /><path d="M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62" /></svg>
                        </p>
                    </div>
                </section>

                <hr className="hr" style={{ maxWidth: 1200, margin: '0 auto' }} />

                {/* ── KENAPA / VALUES ── */}
                <section id="kenapa" style={{ padding: '110px 32px', maxWidth: 1200, margin: '0 auto' }}>
                    <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.7fr', gap: 80, alignItems: 'flex-start' }}>
                        <div className="feat-left" style={{ position: 'sticky', top: 120 }}>
                            <div className="lbl">Kenapa Di Sini</div>
                            <h2 className="d" style={{ fontSize: 'clamp(2rem,3.5vw,3.2rem)', fontWeight: 600, lineHeight: 1.08, letterSpacing: '-.02em', marginBottom: 20 }}>
                                Bukan cuma<br />kenyang, tapi <span className="ink-em">enak.</span>
                            </h2>
                            <p style={{ color: 'var(--ink-soft)', lineHeight: 1.7, fontSize: '.95rem' }}>
                                Candaria masak buat teman sekolahmu tiap hari — bahan dipilih, porsi pas, harga jujur.
                            </p>
                        </div>
                        <div>
                            {values.map((f, i) => (
                                <div key={i} className="feat" style={{ display: 'flex', gap: 36, alignItems: 'flex-start' }}>
                                    <span className="feat-n">{f.num}</span>
                                    <div style={{ paddingTop: 6 }}>
                                        <h3 className="d" style={{ fontSize: '1.7rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 10, letterSpacing: '-.01em' }}>{f.title}</h3>
                                        <p style={{ color: 'var(--ink-soft)', lineHeight: 1.7, fontSize: '.95rem', maxWidth: 460 }}>{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <hr className="hr" style={{ maxWidth: 1200, margin: '0 auto' }} />

                {/* ── FAQ ── */}
                <section id="faq" style={{ padding: '110px 32px', maxWidth: 760, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}><div className="lbl">Sebelum Mampir</div></div>
                        <h2 className="d" style={{ fontSize: 'clamp(2.2rem,4.5vw,3.6rem)', fontWeight: 600, lineHeight: 1.04, letterSpacing: '-.02em' }}>
                            Yang Sering <span className="ink-em">Ditanya</span>
                        </h2>
                    </div>
                    {faqs.map((faq, i) => (
                        <div key={i} className="faq-i">
                            <button className={`faq-btn ${activeFaq === i ? 'on' : ''}`} onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                                <span className="d" style={{ fontSize: '1.3rem', fontWeight: 500, letterSpacing: '-.01em' }}>{faq.question}</span>
                                <svg className={`faq-ico ${activeFaq === i ? 'open' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                            <div className="faq-body" style={{ maxHeight: activeFaq === i ? 220 : 0, opacity: activeFaq === i ? 1 : 0 }}>
                                <p style={{ color: 'var(--ink-soft)', lineHeight: 1.75, paddingBottom: 26, fontSize: '.96rem' }}>{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </section>

                {/* ── CTA ── */}
                <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 32px', textAlign: 'center', background: 'var(--ink)', color: 'var(--paper)' }}>
                    <div className="d" style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', fontSize: 'clamp(6rem,16vw,15rem)', opacity: .06, fontStyle: 'italic', whiteSpace: 'nowrap', pointerEvents: 'none' }}>makan yuk</div>
                    <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
                        <div style={{ marginBottom: 20, animation: 'wiggle 1.4s ease-in-out infinite', display: 'inline-block' }}>
                            <svg width="40" height="40" fill="none" stroke="var(--yellow)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2" /><path d="M5 11v11" /><path d="M9 2v20" /><path d="M21 15V2a5 5 0 0 0-3 5v6c0 1.1.9 2 2 2h1Zm0 0v7" /></svg>
                        </div>
                        <h2 className="d" style={{ fontSize: 'clamp(2.6rem,5.5vw,5rem)', fontWeight: 600, lineHeight: 1.02, letterSpacing: '-.03em', marginBottom: 24, color: 'var(--paper)' }}>
                            Perut keroncongan?<br />
                            <span className="saffron-em">Mampir aja langsung.</span>
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,.72)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
                            Nggak perlu pesan online — cukup datang ke kantin, pilih menu di etalase, bayar di kasir, langsung makan. Datang awal istirahat biar nggak kehabisan.
                        </p>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'var(--yellow)', color: 'var(--ink)', borderRadius: 100, padding: '14px 30px', fontWeight: 700, fontSize: '1rem', boxShadow: '0 6px 0 0 var(--yellow-d)' }}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Buka 07.30 – 12.30 · tiap hari sekolah
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer style={{ background: 'var(--paper-2)', borderTop: '1.5px solid var(--ink)', padding: '56px 32px 36px' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div className="ft-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 56, marginBottom: 52 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
                                    <img src="/img/logo-color.png" alt="Candaria" style={{ width: 30, height: 30, objectFit: 'contain' }} />
                                    <span className="d" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)' }}>Candaria</span>
                                </div>
                                <p style={{ color: 'var(--ink-soft)', lineHeight: 1.7, fontSize: '.88rem', maxWidth: 290, marginBottom: 22 }}>
                                    Kantin sekolah yang masak fresh tiap hari. Jajanan favorit, harga pelajar, antri cepat. Mampir, kenyang, balik ke kelas senyum.
                                </p>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {[
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>,
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>,
                                    ].map((dp, i) => (
                                        <a key={i} href="#" className="soc">
                                            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">{dp}</svg>
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--ink)', letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: 22 }}>Jelajah</h4>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 13 }}>
                                    {[['Menu Favorit', '#menu'], ['Kenapa Kami', '#kenapa'], ['FAQ', '#faq'], ['Masuk Staff', canLogin ? route('dashboard') : route('login')]].map(([l, h]) => (
                                        <li key={l}><a href={h} style={{ color: 'var(--ink-soft)', fontSize: '.88rem', textDecoration: 'none', transition: 'color .2s' }}
                                            onMouseOver={e => e.target.style.color = 'var(--tomato)'}
                                            onMouseOut={e => e.target.style.color = 'var(--ink-soft)'}>{l}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--ink)', letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: 22 }}>Mampir</h4>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 13 }}>
                                    <li style={{ color: 'var(--ink-soft)', fontSize: '.88rem', lineHeight: 1.55 }}>Kantin Candaria<br />Lingkungan Sekolah</li>
                                    <li style={{ color: 'var(--ink-soft)', fontSize: '.88rem' }}>Buka 07.30 – 12.30</li>
                                    <li style={{ color: 'var(--ink-soft)', fontSize: '.88rem' }}>Pesan langsung di tempat</li>
                                </ul>
                            </div>
                        </div>
                        <hr className="hr" />
                        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                            <p style={{ color: 'var(--ink-soft)', fontSize: '.78rem' }}>&copy; {new Date().getFullYear()} Kantin Candaria. Masak dari hati.</p>
                            <div style={{ display: 'flex', gap: 20 }}>
                                {['Kebersihan Terjaga', 'Bahan Halal'].map(t => (
                                    <span key={t} style={{ color: 'var(--ink-soft)', fontSize: '.78rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <svg width="13" height="13" fill="none" stroke="var(--leaf)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
