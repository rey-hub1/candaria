import React from 'react';
import { router } from '@inertiajs/react';
import { useTranslation, SUPPORTED_LOCALES } from '@/i18n';

/**
 * Compact ID / EN toggle. POSTs to `locale.update`, which stores the choice
 * in the session; the reload re-shares the new `locale` prop so the whole UI
 * re-renders in the chosen language.
 *
 * `variant="dark"` for the dark sidebar, `variant="light"` (default) for
 * light surfaces (header, guest pages).
 */
export default function LanguageSwitcher({ variant = 'light', className = '' }) {
    const { locale } = useTranslation();

    const switchTo = (next) => {
        if (next === locale) return;
        router.post(route('locale.update'), { locale: next }, {
            preserveScroll: true,
            preserveState: false,
        });
    };

    const isDark = variant === 'dark';
    const base = 'px-2 py-0.5 text-xs font-bold rounded-md transition';
    const activeCls = isDark
        ? 'bg-primary-500 text-white'
        : 'bg-primary-600 text-white';
    const idleCls = isDark
        ? 'text-slate-400 hover:text-white'
        : 'text-slate-500 hover:text-slate-800';
    const wrapCls = isDark
        ? 'inline-flex items-center gap-0.5 rounded-lg bg-slate-800 p-0.5'
        : 'inline-flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5';

    return (
        <div className={`${wrapCls} ${className}`} role="group" aria-label="Language">
            {SUPPORTED_LOCALES.map((code) => (
                <button
                    key={code}
                    type="button"
                    onClick={() => switchTo(code)}
                    aria-pressed={locale === code}
                    className={`${base} ${locale === code ? activeCls : idleCls}`}
                >
                    {code.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
