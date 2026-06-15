import React, { useEffect, useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

const STUDENT_PERKS = [
    { title: 'Jajan tanpa antre', desc: 'Pesan dari kantin & mitra sekolah' },
    { title: 'Cukup pakai NISN', desc: 'Login dengan Nomor Induk Siswa' },
    { title: 'Pantau pesanan', desc: 'Lacak status pesananmu real-time' },
];

const STAFF_ACCOUNTS = [
    { label: 'Admin', login: 'admin@canteen.com', password: 'password' },
    { label: 'Kasir', login: 'cashier@canteen.com', password: 'password' },
    { label: 'Penitip', login: '081234567890', password: 'candaria123' },
    { label: 'Mitra', login: 'mitra@candaria.com', password: 'password' },
    { label: 'Super Admin', login: 'superadmin@candaria.com', password: 'password' },
];

function EyeToggle({ show, onClick }) {
    return (
        <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-primary-600 transition"
            onClick={onClick}
            aria-label={show ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
        >
            {show ? (
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
    );
}

export default function Login({ status, studentLoginEnabled = true }) {
    const [mode, setMode] = useState(studentLoginEnabled ? 'student' : 'staff');
    const [showPassword, setShowPassword] = useState(false);

    const studentForm = useForm({ nisn: '', password: '' });
    const staffForm = useForm({ login: '', password: '', remember: false });

    useEffect(() => {
        return () => {
            studentForm.reset('password');
            staffForm.reset('password');
        };
    }, []);

    const switchMode = (next) => {
        setMode(next);
        setShowPassword(false);
    };

    const submitStudent = (e) => {
        e.preventDefault();
        studentForm.post(route('student.login'));
    };

    const submitStaff = (e) => {
        e.preventDefault();
        staffForm.post(route('login'));
    };

    return (
        <div className="min-h-screen flex bg-white font-sans text-slate-900 overflow-x-hidden">
            <Head title="Masuk" />

            {/* Left: brand panel — student-first, flat indigo, gold accents */}
            <div className="hidden lg:flex lg:w-[44%] relative bg-primary-950 text-white flex-col justify-between p-14 xl:p-16">
                <div
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                        backgroundSize: '56px 56px',
                    }}
                />
                <div className="absolute top-0 right-0 h-full w-px bg-secondary-500/40" />

                <div className="relative z-10 flex items-center gap-3 opacity-0 animate-fade-in-left" style={{ animationDelay: '0.1s' }}>
                    <img src="/img/logo-white.png" alt="Candaria" className="h-9 w-auto" />
                </div>

                <div className="relative z-10 max-w-md opacity-0 animate-fade-in-left" style={{ animationDelay: '0.2s' }}>
                    <div className="w-12 h-1 bg-secondary-500 mb-8" />
                    <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.1] tracking-tight">
                        Pesan jajananmu,
                        <br />
                        <span className="text-secondary-400">tanpa antre.</span>
                    </h1>
                    <p className="mt-6 text-primary-200/70 text-base leading-relaxed">
                        Masuk dengan akun siswa untuk memesan makanan dari kantin dan mitra sekolah. Pegawai kantin juga bisa masuk di halaman ini.
                    </p>

                    <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
                        {STUDENT_PERKS.map((p, i) => (
                            <li
                                key={p.title}
                                className="flex items-center gap-4 py-4 opacity-0 animate-fade-in-left"
                                style={{ animationDelay: `${0.35 + i * 0.08}s` }}
                            >
                                <svg className="w-5 h-5 shrink-0 text-secondary-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-sm text-white leading-snug">{p.title}</h4>
                                    <p className="text-xs text-primary-200/60 mt-0.5">{p.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative z-10 text-primary-200/40 text-xs tracking-wide opacity-0 animate-fade-in-left" style={{ animationDelay: '0.7s' }}>
                    &copy; 2026 Candaria Canteen System
                </div>
            </div>

            {/* Right: forms */}
            <div className="w-full lg:w-[56%] flex flex-col justify-center items-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
                <div className="w-full max-w-sm opacity-0 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                    <div className="lg:hidden flex justify-center mb-8">
                        <img src="/img/logo-color.png" alt="Candaria" className="h-20 w-auto" />
                    </div>

                    {/* Mode toggle — student vs staff, separate forms */}
                    {studentLoginEnabled && (
                        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-8">
                            <button
                                type="button"
                                onClick={() => switchMode('student')}
                                className={`py-2 text-sm font-semibold rounded-lg transition ${
                                    mode === 'student' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Siswa
                            </button>
                            <button
                                type="button"
                                onClick={() => switchMode('staff')}
                                className={`py-2 text-sm font-semibold rounded-lg transition ${
                                    mode === 'staff' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Pegawai
                            </button>
                        </div>
                    )}

                    <div className="mb-8">
                        <div className="w-12 h-1 bg-secondary-500 mb-6" />
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            {mode === 'student' ? 'Masuk akun siswa' : 'Masuk akun pegawai'}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            {mode === 'student'
                                ? 'Gunakan NISN dan password untuk memesan jajanan.'
                                : 'Akun kasir, penitip, mitra, atau administrator.'}
                        </p>
                    </div>

                    {status && (
                        <div className="mb-6 text-sm font-medium text-primary-700 bg-primary-50 px-4 py-3 rounded-lg border border-primary-100">
                            {status}
                        </div>
                    )}

                    {/* STUDENT FORM */}
                    {mode === 'student' && (
                        <form onSubmit={submitStudent} className="space-y-5">
                            <div className="space-y-1.5">
                                <InputLabel htmlFor="nisn" value="NISN" className="text-slate-600 font-semibold text-xs uppercase tracking-wider" />
                                <TextInput
                                    id="nisn"
                                    type="text"
                                    name="nisn"
                                    value={studentForm.data.nisn}
                                    className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/15 focus:border-primary-500 text-slate-800 transition"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => studentForm.setData('nisn', e.target.value)}
                                    placeholder="Nomor Induk Siswa Nasional"
                                    required
                                />
                                <InputError message={studentForm.errors.nisn} className="mt-1" />
                            </div>

                            <div className="space-y-1.5">
                                <InputLabel htmlFor="student-password" value="Password" className="text-slate-600 font-semibold text-xs uppercase tracking-wider" />
                                <div className="relative">
                                    <TextInput
                                        id="student-password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={studentForm.data.password}
                                        className="block w-full px-4 pr-11 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/15 focus:border-primary-500 text-slate-800 transition"
                                        autoComplete="current-password"
                                        onChange={(e) => studentForm.setData('password', e.target.value)}
                                        placeholder="Default: tanggal lahir (ddmmyyyy)"
                                        required
                                    />
                                    <EyeToggle show={showPassword} onClick={() => setShowPassword(!showPassword)} />
                                </div>
                                <InputError message={studentForm.errors.password} className="mt-1" />
                            </div>

                            <PrimaryButton
                                className="w-full justify-center py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold tracking-wide transition focus:ring-2 focus:ring-primary-500/40"
                                disabled={studentForm.processing}
                            >
                                {studentForm.processing ? 'Masuk...' : 'Masuk'}
                            </PrimaryButton>
                        </form>
                    )}

                    {/* STAFF FORM */}
                    {mode === 'staff' && (
                        <form onSubmit={submitStaff} className="space-y-5">
                            <div className="space-y-1.5">
                                <InputLabel htmlFor="login" value="Email / Nomor Telepon" className="text-slate-600 font-semibold text-xs uppercase tracking-wider" />
                                <TextInput
                                    id="login"
                                    type="text"
                                    name="login"
                                    value={staffForm.data.login}
                                    className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/15 focus:border-primary-500 text-slate-800 transition"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => staffForm.setData('login', e.target.value)}
                                    placeholder="nama@email.com / 081234..."
                                    required
                                />
                                <InputError message={staffForm.errors.login} className="mt-1" />
                            </div>

                            <div className="space-y-1.5">
                                <InputLabel htmlFor="staff-password" value="Kata Sandi" className="text-slate-600 font-semibold text-xs uppercase tracking-wider" />
                                <div className="relative">
                                    <TextInput
                                        id="staff-password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={staffForm.data.password}
                                        className="block w-full px-4 pr-11 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/15 focus:border-primary-500 text-slate-800 transition"
                                        autoComplete="current-password"
                                        onChange={(e) => staffForm.setData('password', e.target.value)}
                                        placeholder="Masukkan password Anda"
                                        required
                                    />
                                    <EyeToggle show={showPassword} onClick={() => setShowPassword(!showPassword)} />
                                </div>
                                <InputError message={staffForm.errors.password} className="mt-1" />
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center cursor-pointer select-none">
                                    <Checkbox
                                        name="remember"
                                        checked={staffForm.data.remember}
                                        onChange={(e) => staffForm.setData('remember', e.target.checked)}
                                    />
                                    <span className="ms-2 text-sm text-slate-500 font-medium">Ingat saya</span>
                                </label>
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-primary-600 hover:text-primary-700 font-semibold transition hover:underline"
                                >
                                    Lupa sandi?
                                </Link>
                            </div>

                            <PrimaryButton
                                className="w-full justify-center py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold tracking-wide transition focus:ring-2 focus:ring-primary-500/40"
                                disabled={staffForm.processing}
                            >
                                {staffForm.processing ? 'Masuk...' : 'Masuk Ke Sistem'}
                            </PrimaryButton>
                        </form>
                    )}

                    {/* Quick accounts per mode */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Akun pengujian cepat</span>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {mode === 'student' ? (
                                <button
                                    type="button"
                                    onClick={() => studentForm.setData({ nisn: '0011223344', password: '12052009' })}
                                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-primary-700 border border-slate-200 rounded-md transition"
                                >
                                    Siswa Uji Coba
                                </button>
                            ) : (
                                STAFF_ACCOUNTS.map((acc) => (
                                    <button
                                        key={acc.label}
                                        type="button"
                                        onClick={() => staffForm.setData(d => ({ ...d, login: acc.login, password: acc.password }))}
                                        className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-primary-700 border border-slate-200 rounded-md transition"
                                    >
                                        {acc.label}
                                    </button>
                                ))
                            )}
                    </div>
                    </div>

                    <div className="lg:hidden mt-10 text-center text-xs text-slate-400">
                        &copy; 2026 Candaria Canteen System
                    </div>
                </div>
            </div>
        </div>
    );
}
