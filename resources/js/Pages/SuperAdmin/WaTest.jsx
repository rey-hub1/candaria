import React, { useState, useEffect, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const TypeLabel = { text: 'Teks', image: 'Foto', document: 'Dokumen', phone: 'Nomor Default' };

function StatusBadge({ ok }) {
    return ok
        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">✓ OK</span>
        : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">✗ Error</span>;
}

function ConfigRow({ label, value }) {
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
            <span className="text-sm text-slate-500">{label}</span>
            <span className="text-sm font-mono text-slate-800">{value}</span>
        </div>
    );
}

export default function WaTest({ config, defaultPhone, result, status }) {
    const [phone, setPhone] = useState(defaultPhone ?? '');
    const [pingResult, setPingResult] = useState(null);
    const [pinging, setPinging] = useState(false);
    const [processing, setProcessing] = useState(null);
    const phoneRef = useRef(phone);

    useEffect(() => { phoneRef.current = phone; }, [phone]);

    const submit = (routeName) => {
        setProcessing(routeName);
        router.post(route(routeName), { phone }, {
            preserveScroll: true,
            onFinish: () => setProcessing(null),
        });
    };

    const savePhone = () => {
        setProcessing('phone');
        router.post(route('super-admin.wa-test.phone'), { phone }, {
            preserveScroll: true,
            onFinish: () => setProcessing(null),
        });
    };

    const ping = async () => {
        setPinging(true);
        setPingResult(null);
        try {
            const res = await fetch(route('super-admin.wa-test.ping'));
            const data = await res.json();
            setPingResult(data);
        } catch (e) {
            setPingResult({ ok: false, error: e.message });
        } finally {
            setPinging(false);
        }
    };

    const isProc = (name) => processing === name;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold leading-tight text-gray-800">WA Test (Waha)</h2>}>
            <Head title="WA Test" />

            <div className="py-8">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8 space-y-5">

                    {/* Config card */}
                    <div className="bg-white p-6 shadow sm:rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Konfigurasi Waha</h3>
                            <button
                                onClick={ping}
                                disabled={pinging}
                                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition disabled:opacity-50"
                            >
                                {pinging ? 'Checking...' : '🔌 Ping Waha'}
                            </button>
                        </div>

                        <div className="divide-y divide-slate-100">
                            <ConfigRow label="WA_ENABLED" value={config.enabled ? '✅ true' : '❌ false'} />
                            <ConfigRow label="WA_BASE_URL" value={config.base_url} />
                            <ConfigRow label="WA_SESSION" value={config.session} />
                            <ConfigRow label="WA_API_KEY" value={config.has_key ? '✅ ada' : '⚠️ kosong'} />
                        </div>

                        {pingResult && (
                            <div className={`mt-4 p-3 rounded-xl text-sm font-mono ${pingResult.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                {pingResult.ok
                                    ? `✓ Waha reachable${pingResult.version ? ` — v${pingResult.version}` : ''}`
                                    : `✗ ${pingResult.error}`}
                            </div>
                        )}
                    </div>

                    {/* Phone card */}
                    <div className="bg-white p-6 shadow sm:rounded-2xl">
                        <h3 className="font-semibold text-gray-900 mb-4">Nomor Tujuan Test</h3>
                        <div className="flex gap-2">
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="08xxxxxxxxxx"
                                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                                onClick={savePhone}
                                disabled={isProc('phone')}
                                className="px-4 py-2 rounded-xl bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 disabled:opacity-50 transition"
                            >
                                {isProc('phone') ? 'Menyimpan...' : 'Simpan Default'}
                            </button>
                        </div>

                        {status?.type === 'phone' && (
                            <div className={`mt-3 p-3 rounded-xl text-sm ${status.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                {status.ok ? `✓ ${status.message}` : `✗ ${status.message}`}
                            </div>
                        )}
                    </div>

                    {/* Test buttons card */}
                    <div className="bg-white p-6 shadow sm:rounded-2xl">
                        <h3 className="font-semibold text-gray-900 mb-1">Kirim Test</h3>
                        <p className="text-sm text-slate-500 mb-5">Semua dikirim ke nomor di atas. Tiap tombol langsung kirim — tidak ada konfirmasi.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <TestButton
                                label="💬 Teks"
                                sub="Pesan teks biasa"
                                loading={isProc('super-admin.wa-test.text')}
                                onClick={() => submit('super-admin.wa-test.text')}
                                disabled={processing !== null}
                            />
                            <TestButton
                                label="📸 Foto"
                                sub="Gambar + caption"
                                loading={isProc('super-admin.wa-test.image')}
                                onClick={() => submit('super-admin.wa-test.image')}
                                disabled={processing !== null}
                            />
                            <TestButton
                                label="📄 Dokumen"
                                sub="PDF + caption"
                                loading={isProc('super-admin.wa-test.document')}
                                onClick={() => submit('super-admin.wa-test.document')}
                                disabled={processing !== null}
                            />
                        </div>
                    </div>

                    {/* Result card */}
                    {result && (
                        <div className={`p-5 shadow sm:rounded-2xl ${result.ok ? 'bg-green-50' : 'bg-red-50'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <StatusBadge ok={result.ok} />
                                <span className="text-sm font-semibold text-slate-700">
                                    Test {TypeLabel[result.type] ?? result.type}
                                </span>
                            </div>
                            {result.ok
                                ? <p className="text-sm text-green-700">Pesan berhasil dikirim ke <span className="font-mono">{phone}</span>.</p>
                                : (
                                    <div>
                                        <p className="text-sm text-red-700 mb-2">Pengiriman gagal:</p>
                                        <pre className="text-xs bg-red-100 text-red-900 rounded-lg p-3 whitespace-pre-wrap break-all font-mono">{result.error}</pre>
                                    </div>
                                )
                            }
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function TestButton({ label, sub, onClick, loading, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl border-2 border-slate-200 hover:border-primary-400 hover:bg-primary-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-center"
        >
            <span className="text-2xl">{loading ? '⏳' : label.split(' ')[0]}</span>
            <span className="text-sm font-semibold text-slate-800">{loading ? 'Mengirim...' : label.split(' ').slice(1).join(' ')}</span>
            <span className="text-xs text-slate-500">{sub}</span>
        </button>
    );
}
