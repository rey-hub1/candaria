import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Password" />

            <div className="mb-6 text-sm text-slate-600 leading-relaxed">
                Lupa password Anda? Tidak masalah. Beritahu kami alamat email Anda dan kami akan mengirimkan email berisi link reset password agar Anda dapat memilih password baru.
            </div>

            {status && (
                <div className="mb-6 text-sm font-medium text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="flex items-center justify-end">
                    <PrimaryButton className="w-full justify-center py-2.5" disabled={processing}>
                        Kirim Link Reset Password
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
