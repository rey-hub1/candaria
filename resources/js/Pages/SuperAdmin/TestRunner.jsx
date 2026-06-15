import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function TestRunner({ testOutput = null, testSuccess = null }) {
    const [processing, setProcessing] = useState(false);

    const runTests = () => {
        setProcessing(true);
        router.post(route('super-admin.test-runner.run'), {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setProcessing(false)
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold leading-tight text-gray-800">Test Runner (Pest)</h2>}>
            <Head title="Test Runner" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white p-6 sm:p-8 shadow sm:rounded-2xl">
                        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Jalankan Automated Tests</h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Tekan tombol di bawah untuk menjalankan keseluruhan suite tes secara langsung di background dan melihat hasilnya di layar.
                                </p>
                            </div>
                            <button
                                onClick={runTests}
                                disabled={processing}
                                className={`shrink-0 inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-500 active:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition ease-in-out duration-150 ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {processing ? 'Menjalankan...' : 'Run Pest Tests'}
                            </button>
                        </header>

                        <div className={`mt-4 p-4 rounded-xl shadow-inner font-mono text-xs overflow-x-auto whitespace-pre-wrap ${testSuccess === true ? 'bg-green-900 text-green-100' : testSuccess === false ? 'bg-red-900 text-red-100' : 'bg-slate-900 text-slate-300'}`} style={{ minHeight: '300px', maxHeight: '600px', overflowY: 'auto' }}>
                            {processing ? 'Menjalankan pest tests. Harap tunggu... Ini mungkin memakan waktu beberapa detik.' : (testOutput || 'Belum ada log tes. Klik tombol untuk memulai.')}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
