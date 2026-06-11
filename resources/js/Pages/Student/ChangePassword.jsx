import React, { useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, useForm } from '@inertiajs/react';

export default function ChangePassword() {
    const { data, setData, put, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset();
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        put(route('student.password.update'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans px-6 py-12">
            <Head title="Ganti Password" />

            <div className="w-full max-w-md space-y-8 bg-white border border-slate-200/60 p-8 rounded-2xl shadow-xl shadow-slate-100/50">
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="flex items-center justify-center p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <ApplicationLogo className="w-12 h-12 fill-current text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Ganti Password</h2>
                    <p className="text-sm text-slate-500 max-w-sm">
                        Ini login pertamamu. Buat password baru sebelum melanjutkan.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-1">
                        <InputLabel htmlFor="password" value="Password Baru" className="text-slate-700 font-semibold text-xs uppercase tracking-wider" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 transition duration-150"
                            autoComplete="new-password"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div className="space-y-1">
                        <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" className="text-slate-700 font-semibold text-xs uppercase tracking-wider" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 transition duration-150"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>

                    <div className="pt-2">
                        <PrimaryButton
                            className="w-full justify-center py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-bold transition duration-150 focus:ring-2 focus:ring-emerald-500/50"
                            disabled={processing}
                        >
                            {processing ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
