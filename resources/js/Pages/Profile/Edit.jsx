import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import { Head, useForm, usePage } from '@inertiajs/react';

// Form 1: Update Profile Info
function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                    Informasi Profil
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                    Perbarui informasi profil dan alamat email akun Anda.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                        <p className="text-sm text-amber-800">
                            Alamat email Anda belum diverifikasi.
                            <button
                                type="button"
                                className="ml-1 underline text-sm text-slate-600 hover:text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 font-semibold"
                                onClick={() => route('verification.send')}
                            >
                                Klik di sini untuk mengirim ulang email verifikasi.
                            </button>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 font-medium text-sm text-green-600">
                                Link verifikasi baru telah dikirim ke alamat email Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Simpan Perubahan</PrimaryButton>

                    {recentlySuccessful && (
                        <p className="text-sm text-emerald-600 font-medium">Berhasil disimpan.</p>
                    )}
                </div>
            </form>
        </section>
    );
}

// Form 2: Update Password
function UpdatePassword({ className = '' }) {
    const { data, setData, put, errors, processing, reset, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <section className={className}>
            <header className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                    Perbarui Password
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                    Pastikan akun Anda menggunakan password acak yang panjang untuk menjaga keamanan.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="current_password" value="Password Saat Ini" />

                    <TextInput
                        id="current_password"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                    />

                    <InputError message={errors.current_password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password Baru" />

                    <TextInput
                        id="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password Baru" />

                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />

                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Simpan Password</PrimaryButton>

                    {recentlySuccessful && (
                        <p className="text-sm text-emerald-600 font-medium">Password berhasil diperbarui.</p>
                    )}
                </div>
            </form>
        </section>
    );
}

// Form 3: Delete Account
function DeleteUser({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        reset();
    };

    return (
        <section className={className}>
            <header className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                    Hapus Akun
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                    Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen. Sebelum menghapus akun Anda, harap unduh data atau informasi apa pun yang ingin Anda simpan.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion}>Hapus Akun</DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal} maxWidth="md">
                <form onSubmit={deleteUser} className="p-6">
                    <h3 className="text-lg font-bold text-slate-900">
                        Apakah Anda yakin ingin menghapus akun Anda?
                    </h3>

                    <p className="mt-2 text-sm text-slate-600">
                        Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen. Silakan masukkan password Anda untuk mengonfirmasi bahwa Anda ingin menghapus akun Anda secara permanen.
                    </p>

                    <div className="mt-6">
                        <InputLabel htmlFor="confirm_password" value="Password Anda" className="sr-only" />

                        <TextInput
                            id="confirm_password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-full"
                            isFocused
                            placeholder="Masukkan Password Anda"
                            required
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>Batal</SecondaryButton>
                        <DangerButton disabled={processing}>Hapus Akun</DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}

// Edit Page main component
export default function Edit({ mustVerifyEmail = false, status }) {
    return (
        <AuthenticatedLayout title="Profil Pengguna">
            <Head title="Profil" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="p-6 sm:p-8 bg-white border border-slate-200/60 shadow-sm rounded-2xl">
                    <UpdateProfileInformation
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="p-6 sm:p-8 bg-white border border-slate-200/60 shadow-sm rounded-2xl">
                    <UpdatePassword className="max-w-xl" />
                </div>

                <div className="p-6 sm:p-8 bg-white border border-slate-200/60 shadow-sm rounded-2xl">
                    <DeleteUser className="max-w-xl" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
