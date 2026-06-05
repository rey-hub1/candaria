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
