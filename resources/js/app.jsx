import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

import NetworkIndicator from './Components/NetworkIndicator';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Kantin Sekolah';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <>
                <NetworkIndicator />
                <App {...props} />
            </>
        );
    },
    progress: {
        color: '#10b981', // green / emerald matching the theme
    },
});
