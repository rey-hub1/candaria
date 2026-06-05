<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full bg-slate-50">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

        <title inertia>{{ config('app.name', 'Kantin Sekolah') }}</title>

        <!-- PWA Meta Tags -->
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#282888">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="Kantin Smekda">
        <link rel="apple-touch-icon" href="/icon-192x192.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png">

        <!-- SEO / Social Share (Open Graph + Twitter) -->
        <meta name="description" content="Candaria - Sistem Informasi Manajemen Kantin Smekda">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="Candaria">
        <meta property="og:title" content="Candaria - Kantin Smekda">
        <meta property="og:description" content="Sistem Informasi Manajemen Kantin Smekda">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:image" content="{{ url('/og-image.png') }}">
        <meta property="og:image:secure_url" content="{{ url('/og-image.png') }}">
        <meta property="og:image:type" content="image/png">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="Logo Candaria SPW Smekda">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="Candaria - Kantin Smekda">
        <meta name="twitter:description" content="Sistem Informasi Manajemen Kantin Smekda">
        <meta name="twitter:image" content="{{ url('/og-image.png') }}">

        <!-- Scripts & Styles -->
        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="h-full antialiased text-slate-800 pb-16 md:pb-0">
        @inertia
        
        @production
            <!-- PWA Service Worker Registration -->
            <script>
                if ('serviceWorker' in navigator) {
                    window.addEventListener('load', () => {
                        navigator.serviceWorker.register('/sw.js').then(registration => {
                            console.log('SW registered: ', registration);
                        }).catch(registrationError => {
                            console.log('SW registration failed: ', registrationError);
                        });
                    });
                }
            </script>
        @endproduction
    </body>
</html>
