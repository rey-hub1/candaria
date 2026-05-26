<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full bg-slate-50">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>Kantin Sekolah</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

        <style>
            body {
                font-family: 'Plus Jakarta Sans', sans-serif;
            }
            [x-cloak] { display: none !important; }
        </style>

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="h-full antialiased text-slate-800 pb-16 md:pb-0">
        <div class="flex h-full min-h-screen" x-data="{ sidebarOpen: false }">
            
            <!-- Sidebar for Desktop -->
            <aside class="hidden md:flex md:flex-col md:w-64 bg-slate-900 text-white shrink-0 border-r border-slate-800">
                <!-- Brand / Logo -->
                <div class="flex items-center gap-2 h-16 px-6 bg-slate-950 border-b border-slate-800">
                    <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"></path>
                    </svg>
                    <span class="text-base font-bold tracking-wider uppercase text-emerald-400">Kantin Smekda</span>
                </div>
                
                <!-- Nav Items -->
                <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    @include('layouts.sidebar-links')
                </nav>

                <!-- User Footer Info -->
                <div class="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                    <div class="truncate">
                        <p class="text-sm font-semibold text-white truncate">{{ Auth::user()->name }}</p>
                        <p class="text-xs text-slate-400 capitalize">{{ Auth::user()->role }}</p>
                    </div>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="text-slate-400 hover:text-rose-400 transition" title="Log Out">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"></path>
                            </svg>
                        </button>
                    </form>
                </div>
            </aside>

            <!-- Mobile Sidebar Overlay -->
            <div x-show="sidebarOpen" class="fixed inset-0 z-40 flex md:hidden bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="sidebarOpen = false" x-cloak></div>

            <!-- Mobile Sidebar Drawer -->
            <div x-show="sidebarOpen" 
                 x-transition:enter="transition ease-out duration-300 transform"
                 x-transition:enter-start="-translate-x-full"
                 x-transition:enter-end="translate-x-0"
                 x-transition:leave="transition ease-in duration-200 transform"
                 x-transition:leave-start="translate-x-0"
                 x-transition:leave-end="-translate-x-full"
                 class="fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-white md:hidden"
                 x-cloak>
                <!-- Brand / Logo -->
                <div class="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-800">
                    <span class="text-base font-bold tracking-wider uppercase text-emerald-400">Menu Navigasi</span>
                    <button @click="sidebarOpen = false" class="text-slate-400 hover:text-white">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <!-- Nav Items -->
                <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    @include('layouts.sidebar-links')
                </nav>
                <!-- User Footer Info -->
                <div class="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                    <div>
                        <p class="text-sm font-semibold text-white">{{ Auth::user()->name }}</p>
                        <p class="text-xs text-slate-400 capitalize">{{ Auth::user()->role }}</p>
                    </div>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="text-slate-400 hover:text-rose-400 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"></path>
                            </svg>
                        </button>
                    </form>
                </div>
            </div>

            <!-- Page Container -->
            <div class="flex flex-col flex-1 overflow-hidden">
                
                <!-- Top Header -->
                <header class="flex items-center justify-between h-14 md:h-16 px-4 md:px-6 bg-white border-b border-slate-200 shrink-0">
                    <div class="flex items-center gap-3">
                        <span class="text-base md:text-lg font-bold text-slate-900">
                            @yield('title', 'Kantin Smekda')
                        </span>
                    </div>

                    <!-- Right Header Info -->
                    <div class="flex items-center gap-3">
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-semibold {{ Auth::user()->role === 'admin' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100' }} capitalize">
                            {{ Auth::user()->role }}
                        </span>
                        
                        <div class="h-5 w-px bg-slate-200 hidden sm:block"></div>
                        <span class="text-xs md:text-sm font-semibold text-slate-600 hidden sm:inline">{{ Auth::user()->name }}</span>
                    </div>
                </header>

                <!-- Page Content -->
                <main class="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 pb-20 md:pb-6">
                    <!-- Session Status Alerts -->
                    @if (session('success'))
                        <div class="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs md:text-sm flex items-center gap-2">
                            <svg class="w-4 h-4 md:w-5 md:h-5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
                            </svg>
                            <div>{{ session('success') }}</div>
                        </div>
                    @endif

                    @if (session('error'))
                        <div class="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs md:text-sm flex items-center gap-2">
                            <svg class="w-4 h-4 md:w-5 md:h-5 shrink-0 text-rose-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
                            </svg>
                            <div>{{ session('error') }}</div>
                        </div>
                    @endif

                    @yield('content')
                </main>
            </div>

            <!-- Bottom Navigation Bar for Mobile -->
            <nav class="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center z-30 shadow-lg px-2">
                <!-- Dashboard Button -->
                <a href="{{ route('dashboard') }}" class="flex flex-col items-center justify-center flex-1 text-center py-2 transition {{ request()->routeIs('dashboard') ? 'text-emerald-600' : 'text-slate-400' }}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"></path>
                    </svg>
                    <span class="text-[10px] font-semibold mt-1">Dashboard</span>
                </a>

                <!-- Kasir Button -->
                <a href="{{ route('transactions.create') }}" class="flex flex-col items-center justify-center flex-1 text-center py-2 transition {{ request()->routeIs('transactions.create') ? 'text-emerald-600' : 'text-slate-400' }}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"></path>
                    </svg>
                    <span class="text-[10px] font-semibold mt-1">Kasir</span>
                </a>

                <!-- Riwayat Button -->
                <a href="{{ route('transactions.index') }}" class="flex flex-col items-center justify-center flex-1 text-center py-2 transition {{ request()->routeIs('transactions.index') || request()->routeIs('transactions.show') ? 'text-emerald-600' : 'text-slate-400' }}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0 1 12 3c.08 0 .16.002.24.005M9 10.5h.008v.008H9V10.5Zm0 3h.008v.008H9v-.008Zm0 3h.008v.008H9v-.008Z"></path>
                    </svg>
                    <span class="text-[10px] font-semibold mt-1">Riwayat</span>
                </a>

                <!-- More / Menu Button (Drawer Trigger) -->
                <button @click="sidebarOpen = true" class="flex flex-col items-center justify-center flex-1 text-center py-2 text-slate-400 hover:text-slate-600 focus:outline-none">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path>
                    </svg>
                    <span class="text-[10px] font-semibold mt-1">Menu</span>
                </button>
            </nav>

        </div>
    </body>
</html>
