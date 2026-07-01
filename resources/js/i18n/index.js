import { usePage } from '@inertiajs/react';
import id from './id';
import en from './en';

export const translations = { id, en };
export const SUPPORTED_LOCALES = ['id', 'en'];
export const DEFAULT_LOCALE = 'id';

// Resolve a dot-path key (e.g. "nav.dashboard") against a dictionary.
function lookup(dict, key) {
    return key.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), dict);
}

/**
 * Hook: returns the current locale and a `t(key, fallback?)` translator.
 * Reads the active locale from the Inertia-shared `locale` prop, so it stays
 * in sync with the backend after a language switch.
 *
 *   const { t, locale } = useTranslation();
 *   t('nav.dashboard');
 */
export function useTranslation() {
    const { locale } = usePage().props;
    const active = translations[locale] ? locale : DEFAULT_LOCALE;

    const t = (key, fallback) => {
        const value = lookup(translations[active], key);
        if (value != null) return value;
        // Fall back to Indonesian, then the provided fallback, then the key.
        const idValue = lookup(translations[DEFAULT_LOCALE], key);
        return idValue ?? fallback ?? key;
    };

    return { t, locale: active };
}
