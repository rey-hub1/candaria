import React, { useEffect, useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Login({ status }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans overflow-x-hidden">
            <Head title="Log In" />

            {/* Left Side: Brand Showcase Panel (hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-tr from-emerald-950 via-emerald-800 to-teal-700 overflow-hidden items-center justify-center p-12">
                {/* Decorative glowing blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/20 blur-[100px] pointer-events-none animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-teal-400/20 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>
                
                {/* Grid Overlay pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

                <div className="relative z-10 max-w-lg text-white flex flex-col items-start space-y-8 opacity-0 animate-fade-in-left" style={{ animationDelay: '0.2s' }}>
                    {/* Logo/Identity */}
                    <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-lg">
                        <ApplicationLogo className="w-10 h-10 fill-current text-emerald-300" />
                        <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">CANDARIA</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
                            Manajemen Kantin <br/>
                            <span className="text-emerald-400">Jauh Lebih Praktis.</span>
                        </h1>
                        <p className="text-emerald-100/80 text-lg leading-relaxed font-light">
                            Sistem kasir cerdas dan pengelolaan produk titipan siswa terintegrasi. Pantau penjualan, kelola stok, dan lakukan rekonsiliasi dana secara akurat dalam satu tempat.
                        </p>
                    </div>

                    {/* Features checklist or badges */}
                    <div className="grid grid-cols-2 gap-4 w-full pt-4">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex items-center space-x-3 hover:bg-white/10 transition duration-300">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h.007m-.007 3h.007m-.007 3h.007m0 2.25H21a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75H3.75a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3ZM13.5 9h.008v.008H13.5V9Zm2.25 0h.008v.008H15.75V9Z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-white">Kasir Cerdas</h4>
                                <p className="text-xs text-emerald-200/60">Pencarian & Scan Instan</p>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex items-center space-x-3 hover:bg-white/10 transition duration-300">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-white">Bagi Hasil Siswa</h4>
                                <p className="text-xs text-emerald-200/60">Rekonsiliasi Otomatis</p>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex items-center space-x-3 hover:bg-white/10 transition duration-300">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-white">Laporan Real-time</h4>
                                <p className="text-xs text-emerald-200/60">Ekspor PDF & Excel</p>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex items-center space-x-3 hover:bg-white/10 transition duration-300">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-white">Stok Terkontrol</h4>
                                <p className="text-xs text-emerald-200/60">Notifikasi Stok Menipis</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 w-full text-emerald-200/50 text-xs">
                        &copy; 2026 Candaria Canteen System. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 sm:px-12 lg:px-20 bg-slate-50 relative">
                {/* Small background ambient decoration on mobile */}
                <div className="lg:hidden absolute top-[-50px] left-[-50px] w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
                <div className="lg:hidden absolute bottom-[-50px] right-[-50px] w-48 h-48 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

                <div className="w-full max-w-md space-y-8 bg-white border border-slate-200/60 p-8 rounded-2xl shadow-xl shadow-slate-100/50 relative z-10 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="lg:hidden flex items-center justify-center p-3 bg-emerald-50 rounded-2xl border border-emerald-100 mb-2">
                            <ApplicationLogo className="w-12 h-12 fill-current text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">
                            Selamat Datang <svg className="w-8 h-8 inline-block ml-1 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>
                        </h2>
                        <p className="text-sm text-slate-500 max-w-sm">
                            Silakan masuk menggunakan akun kasir atau administrator untuk mengakses sistem Candaria.
                        </p>
                    </div>

                    {status && (
                        <div className="text-sm font-medium text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-200 animate-fadeIn">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-1">
                            <InputLabel htmlFor="login" value="Email / Nomor Telepon" className="text-slate-700 font-semibold text-xs uppercase tracking-wider" />
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition duration-150">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0l-7.5-4.615a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                    </svg>
                                </div>
                                <TextInput
                                    id="login"
                                    type="text"
                                    name="login"
                                    value={data.login}
                                    className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 transition duration-150"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => setData('login', e.target.value)}
                                    placeholder="nama@email.com / 081234..."
                                    required
                                />
                            </div>
                            <InputError message={errors.login} className="mt-1" />
                        </div>

                        <div className="space-y-1">
                            <InputLabel htmlFor="password" value="Kata Sandi" className="text-slate-700 font-semibold text-xs uppercase tracking-wider" />
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition duration-150">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                    </svg>
                                </div>
                                <TextInput
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    className="block w-full pl-11 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 transition duration-150"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Masukkan password Anda"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-emerald-500 transition duration-150"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer select-none">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="ms-2 text-sm text-slate-500 font-medium hover:text-slate-700 transition">Ingat saya</span>
                            </label>

                            <Link
                                href={route('password.request')}
                                className="text-sm text-emerald-600 hover:text-emerald-500 font-semibold focus:outline-none transition duration-150 hover:underline"
                            >
                                Lupa sandi?
                            </Link>
                        </div>

                        <div className="pt-2">
                            <PrimaryButton 
                                className="w-full justify-center py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-bold transition duration-150 focus:ring-2 focus:ring-emerald-500/50" 
                                disabled={processing}
                            >
                                {processing ? (
                                    <div className="flex items-center space-x-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Masuk...</span>
                                    </div>
                                ) : (
                                    "Masuk Ke Sistem"
                                )}
                            </PrimaryButton>
                        </div>
                    </form>
                    
                    <div className="pt-4 border-t border-slate-100 flex flex-col items-center justify-center space-y-2">
                        <span className="text-xs text-slate-400">Akun Pengujian Cepat:</span>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <button 
                                type="button"
                                onClick={() => setData(d => ({ ...d, login: 'admin@canteen.com', password: 'password' }))}
                                className="px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 rounded-lg transition"
                            >
                                Admin
                            </button>
                            <button 
                                type="button"
                                onClick={() => setData(d => ({ ...d, login: 'cashier@canteen.com', password: 'password' }))}
                                className="px-2.5 py-1 text-[11px] font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/50 rounded-lg transition"
                            >
                                Kasir
                            </button>
                            <button 
                                type="button"
                                onClick={() => setData(d => ({ ...d, login: '081234567890', password: 'candaria123' }))}
                                className="px-2.5 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 rounded-lg transition"
                            >
                                Penitip
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Footer on mobile */}
                <div className="lg:hidden mt-8 text-center text-xs text-slate-400">
                    &copy; 2026 Candaria Canteen System.
                </div>
            </div>
        </div>
    );
}
