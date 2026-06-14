import React, { useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function StudentLogin({ status }) {
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

            <div className="w-full max-w-md space-y-8 bg-white border border-slate-200/60 p-8 rounded-2xl shadow-xl shadow-slate-100/50">
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="flex items-center justify-center p-3 bg-primary-50 rounded-2xl border border-primary-100">
                        <ApplicationLogo className="w-12 h-12 fill-current text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Login Siswa</h2>
                    <p className="text-sm text-slate-500 max-w-sm">
                        Masuk menggunakan NISN dan password untuk memesan jajanan dari kantin & mitra sekolah.
                    </p>
                </div>

                {status && (
                    <div className="text-sm font-medium text-primary-600 bg-primary-50 p-4 rounded-xl border border-primary-200">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-1">
                        <InputLabel htmlFor="nisn" value="NISN" className="text-slate-700 font-semibold text-xs uppercase tracking-wider" />
                        <TextInput
                            id="nisn"
                            type="text"
                            name="nisn"
                            value={data.nisn}
                            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-800 transition duration-150"
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
                            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-800 transition duration-150"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Default: tanggal lahir (ddmmyyyy)"
                            required
                        />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div className="pt-2">
                        <PrimaryButton
                            className="w-full justify-center py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-xl shadow-lg shadow-primary-500/20 font-bold transition duration-150 focus:ring-2 focus:ring-primary-500/50"
                            disabled={processing}
                        >
                            {processing ? 'Masuk...' : 'Masuk'}
                        </PrimaryButton>
                    </div>
                </form>

                <div className="pt-4 border-t border-slate-100 flex flex-col items-center justify-center space-y-2">
                    <span className="text-xs text-slate-400">Akun Pengujian Cepat:</span>
                    <button
                        type="button"
                        onClick={() => setData({ nisn: '0011223344', password: '12052009' })}
                        className="px-2.5 py-1 text-[11px] font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200/50 rounded-lg transition"
                    >
                        Siswa Uji Coba 1
                    </button>
                </div>

                <div className="pt-4 border-t border-slate-100 text-center">
                    <Link href={route('login')} className="text-sm text-primary-600 hover:text-primary-500 font-semibold transition hover:underline">
                        Login sebagai Admin / Kasir / Mitra
                    </Link>
                </div>
            </div>
        </div>
    );
}
