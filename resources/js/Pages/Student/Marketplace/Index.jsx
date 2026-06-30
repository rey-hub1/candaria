import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Utensils } from 'lucide-react';

export default function Index({ vendors, categories }) {
    const [category, setCategory] = useState('');

    const filtered = category ? vendors.filter((v) => v.category === category) : vendors;

    return (
        <AuthenticatedLayout title="Jajan">
            <Head title="Jajan" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Jajan di Mitra Sekolah</h1>
                <p className="text-sm text-slate-500 mt-1">Pilih mitra, lalu pesan menu favoritmu.</p>
            </div>

            {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={() => setCategory('')}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${category === '' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'}`}
                    >
                        Semua
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize transition ${category === cat ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center text-sm text-slate-500">
                    Belum ada mitra tersedia.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((vendor) => (
                        <Link
                            key={vendor.id}
                            href={route('student.marketplace.show', vendor.slug)}
                            className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-primary-300 hover:shadow-md transition flex gap-3"
                        >
                            <div className="w-16 h-16 rounded-lg bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                                {vendor.logo_url ? (
                                    <img src={vendor.logo_url} alt={vendor.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Utensils className="w-7 h-7 text-slate-400" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-slate-900 truncate">{vendor.name}</p>
                                <p className="text-xs text-slate-500 capitalize">{vendor.category}</p>
                                <p className="text-xs mt-1">
                                    <span className={`font-semibold ${vendor.is_open ? 'text-primary-600' : 'text-rose-600'}`}>
                                        {vendor.is_open ? 'Buka' : 'Tutup'}
                                    </span>
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
