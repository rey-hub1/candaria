import React, { useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function StudentLogin({ status, testAccounts = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nisn: '',
        password: '',
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('student.login'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans px-6 py-12">
            <Head title="Login Siswa" />

            <div className="w-full max-w-md bg-white border border-slate-200 p-8 sm:p-10 rounded-2xl shadow-sm">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="flex items-center justify-center p-3 bg-primary-50 rounded-xl border border-primary-100">
                        <ApplicationLogo className="w-11 h-11 fill-current text-primary-600" />
                    </div>
                    <div className="w-10 h-1 bg-secondary-500 rounded-full mt-5 mb-4" />
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Login Siswa</h2>
                    <p className="text-sm text-slate-500 max-w-sm mt-2">
                        Masuk menggunakan NISN dan password untuk memesan jajanan dari kantin & mitra sekolah.
                    </p>
                </div>

                {status && (
                    <div className="mb-6 text-sm font-medium text-primary-700 bg-primary-50 px-4 py-3 rounded-lg border border-primary-100">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-1">
                        <InputLabel htmlFor="nisn" value="NISN" className="text-slate-700 font-semibold text-xs uppercase tracking-wider" />
                        <TextInput
                            id="nisn"
                            type="text"
                            name="nisn"
                            value={data.nisn}
                            className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/15 focus:border-primary-500 text-slate-800 transition"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('nisn', e.target.value)}
                            placeholder="Nomor Induk Siswa Nasional"
                            required
                        />
                        <InputError message={errors.nisn} className="mt-1" />
                    </div>

                    <div className="space-y-1">
                        <InputLabel htmlFor="password" value="Password" className="text-slate-700 font-semibold text-xs uppercase tracking-wider" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/15 focus:border-primary-500 text-slate-800 transition"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Default: tanggal lahir (ddmmyyyy)"
                            required
                        />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div className="pt-2">
                        <PrimaryButton
                            className="w-full justify-center py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold tracking-wide transition focus:ring-2 focus:ring-primary-500/40"
                            disabled={processing}
                        >
                            {processing ? 'Masuk...' : 'Masuk'}
                        </PrimaryButton>
                    </div>
                </form>

                {testAccounts.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center justify-center space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Akun Pengujian Cepat</span>
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                            {testAccounts.map((acc) => (
                                <button
                                    key={acc.nisn}
                                    type="button"
                                    onClick={() => setData({ nisn: acc.nisn, password: acc.password })}
                                    className="px-2.5 py-1 text-[11px] font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200/50 rounded-lg transition"
                                >
                                    {acc.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                    <Link href={route('login')} className="text-sm text-primary-600 hover:text-primary-700 font-semibold transition hover:underline">
                        Login sebagai Admin / Kasir / Mitra
                    </Link>
                </div>
            </div>
        </div>
    );
}
