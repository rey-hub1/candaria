import React from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-slate-50/50">
            <div className="absolute top-4 right-4">
                <LanguageSwitcher variant="light" />
            </div>

            <div>
                <Link href="/">
                    <ApplicationLogo className="w-20 h-20 fill-current text-slate-800 hover:scale-105 transition duration-200" />
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-8 py-8 bg-white border border-slate-200/60 shadow-xl overflow-hidden rounded-2xl">
                {children}
            </div>
        </div>
    );
}
