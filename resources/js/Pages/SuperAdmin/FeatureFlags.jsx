import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const GROUP_LABELS = {
    general: 'Umum',
    marketplace: 'Marketplace Mitra',
};

function Toggle({ checked, onChange }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                checked ? 'bg-primary-500' : 'bg-slate-300'
            }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    );
}

const TEMPLATES = [
    {
        id: 'v1',
        name: 'Template V1',
        tag: 'Hanya umum nyala',
        description: 'Nyalakan fitur umum, matikan sisanya. Mode dasar / produksi minimal.',
    },
    {
        id: 'v2',
        name: 'Template V2',
        tag: 'Semua nyala',
        description: 'Nyalakan semua fitur. Mode lengkap / demo penuh.',
    },
];

export default function FeatureFlags({ flags = {} }) {
    const allFlags = Object.values(flags).flat();
    const total = allFlags.length;
    const onCount = allFlags.filter((f) => f.is_enabled).length;

    // Active template derived from current flag state — manual toggle jatuh ke "custom".
    // V1 = grup umum nyala semua & non-umum mati semua. V2 = semua nyala.
    const generalOn = allFlags.filter((f) => f.group === 'general').every((f) => f.is_enabled);
    const nonGeneralOff = allFlags.filter((f) => f.group !== 'general').every((f) => !f.is_enabled);
    const activeTemplate = total === 0 ? null : onCount === total ? 'v2' : generalOn && nonGeneralOff ? 'v1' : 'custom';

    const toggle = (flag) => {
        router.put(route('super-admin.feature-flags.update', flag.id), {
            is_enabled: !flag.is_enabled,
        }, { preserveScroll: true });
    };

    const applyTemplate = (id) => {
        router.post(route('super-admin.feature-flags.template'), { template: id }, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Feature Flags" />

            <div className="max-w-3xl mx-auto py-6 px-4">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-900">Feature Flags</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Nyalakan atau matikan fitur aplikasi secara global, tanpa perlu deploy ulang.
                    </p>
                </div>

                {/* Template presets */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-semibold text-slate-700">Template</h2>
                        {activeTemplate === 'custom' && (
                            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                                Custom · {onCount}/{total} nyala
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {TEMPLATES.map((t) => {
                            const active = activeTemplate === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => applyTemplate(t.id)}
                                    className={`text-left rounded-xl border p-4 transition-colors ${
                                        active
                                            ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                                        <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${
                                            t.id === 'v2' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {t.tag}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{t.description}</p>
                                    {active && (
                                        <p className="text-[11px] font-semibold text-primary-600 mt-2">✓ Aktif</p>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {Object.entries(flags).map(([group, items]) => (
                    <div key={group} className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                            <h2 className="text-sm font-semibold text-slate-700">
                                {GROUP_LABELS[group] || group}
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {items.map((flag) => (
                                <div key={flag.id} className="flex items-center justify-between gap-4 px-5 py-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{flag.label}</p>
                                        {flag.description && (
                                            <p className="text-xs text-slate-500 mt-0.5">{flag.description}</p>
                                        )}
                                        <p className="text-[11px] text-slate-400 mt-1 font-mono">{flag.key}</p>
                                    </div>
                                    <Toggle checked={flag.is_enabled} onChange={() => toggle(flag)} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {Object.keys(flags).length === 0 && (
                    <p className="text-sm text-slate-500">Belum ada feature flag.</p>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
