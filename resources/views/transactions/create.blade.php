@extends('layouts.app')

@section('title', 'Kasir (Checkout)')

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6" x-data="{ showCartDrawer: false, paidAmount: 0, totalAmount: {{ $totalAmount }} }">
    
    <!-- Left Column: Search & Products Grid (2/3 width) -->
    <div class="lg:col-span-2 flex flex-col gap-6">
        
        <!-- Search Card -->
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <form action="{{ route('transactions.create') }}" method="GET" class="flex gap-2">
                <div class="relative flex-1">
                    <input type="text" name="search" value="{{ $search }}" placeholder="Cari produk berdasarkan nama atau kode..."
                        class="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <div class="absolute left-3 top-3 text-slate-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path>
                        </svg>
                    </div>
                </div>
                <button type="submit" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm transition">
                    Cari
                </button>
                @if($search)
                    <a href="{{ route('transactions.create') }}" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition flex items-center justify-center">
                        Reset
                    </a>
                @endif
            </form>
        </div>

        <!-- Products Grid -->
        <div class="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm flex-1">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-sm md:text-base font-bold text-slate-900">Pilih Produk</h3>
                <span class="text-[10px] md:text-xs text-slate-400 font-semibold">{{ $products->count() }} Produk Tersedia</span>
            </div>
            
            @if($products->isEmpty())
                <div class="text-center py-16 text-slate-400 text-sm">
                    @if($search)
                        Produk dengan nama/kode "{{ $search }}" tidak ditemukan.
                    @else
                        Tidak ada produk yang tersedia (semua stok habis).
                    @endif
                </div>
            @else
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                    @foreach($products as $p)
                        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4 flex flex-col justify-between hover:shadow-md hover:border-emerald-300 transition duration-200">
                            <div>
                                <div class="flex justify-between items-start gap-1 flex-wrap">
                                    <span class="px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-bold uppercase {{ $p->type === 'kantin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-orange-50 text-orange-700 border border-orange-100' }}">
                                        {{ $p->type === 'kantin' ? 'Kantin' : 'Siswa' }}
                                    </span>
                                    <span class="text-[8px] md:text-[9px] text-slate-400 font-mono">{{ $p->code }}</span>
                                </div>
                                <h4 class="font-bold text-slate-900 text-xs md:text-sm mt-2 leading-snug">{{ $p->name }}</h4>
                                <p class="text-[10px] md:text-xs text-slate-400 mt-0.5">{{ $p->category->name }}</p>
                                @if($p->seller)
                                    <p class="text-[9px] md:text-[10px] text-slate-500 font-semibold mt-1">Siswa: {{ $p->seller->name }}</p>
                                @endif
                            </div>
                            
                            <div class="mt-3 md:mt-4">
                                <div class="flex justify-between items-baseline mb-2">
                                    <span class="text-[10px] md:text-xs text-slate-400 font-semibold">Stok: {{ $p->stock }}</span>
                                    <span class="font-extrabold text-slate-900 text-xs md:text-sm">Rp{{ number_format($p->selling_price, 0, ',', '.') }}</span>
                                </div>
                                
                                <form action="{{ route('cart.add') }}" method="POST">
                                    @csrf
                                    <input type="hidden" name="product_id" value="{{ $p->id }}">
                                    <input type="hidden" name="quantity" value="1">
                                    <button type="submit" class="w-full py-1.5 md:py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] md:text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-1">
                                        <svg class="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
                                        </svg>
                                        Tambah
                                    </button>
                                </form>
                            </div>
                        </div>
                    @endforeach
                </div>
            @endif
        </div>
    </div>

    <!-- Right Column: Desktop Sidebar Cart (Visible on desktop lg screens) -->
    <div class="hidden lg:flex lg:flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-10rem)] min-h-[500px]">
        <!-- Cart Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"></path>
                </svg>
                <h3 class="text-base font-bold text-slate-900">Keranjang Belanja</h3>
            </div>
            
            @if(!empty($cart))
                <form action="{{ route('cart.clear') }}" method="POST" onsubmit="return confirm('Kosongkan keranjang?')">
                    @csrf
                    <button type="submit" class="text-xs font-semibold text-rose-600 hover:underline">
                        Kosongkan
                    </button>
                </form>
            @endif
        </div>

        <!-- Cart Items List -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
            @if(empty($cart))
                <div class="h-full flex flex-col items-center justify-center text-center text-slate-400 text-sm">
                    <svg class="w-12 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"></path>
                    </svg>
                    <span>Keranjang kosong.<br>Pilih produk di sebelah kiri.</span>
                </div>
            @else
                @foreach($cart as $id => $item)
                    <div class="flex justify-between items-start gap-4 pb-4 border-b border-slate-100">
                        <div class="flex-1">
                            <div class="flex items-center gap-1.5">
                                <h4 class="font-bold text-slate-900 text-sm">{{ $item['name'] }}</h4>
                                <span class="px-1 py-0.5 rounded text-[8px] font-bold uppercase {{ $item['type'] === 'kantin' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700' }}">
                                    {{ $item['type'] === 'kantin' ? 'Kantin' : 'Siswa' }}
                                </span>
                            </div>
                            <p class="text-xs text-slate-500 mt-0.5">Rp{{ number_format($item['selling_price'], 0, ',', '.') }} / pcs</p>
                            
                            <!-- Qty Update Form -->
                            <form action="{{ route('cart.update') }}" method="POST" class="flex items-center gap-1 mt-2">
                                @csrf
                                <input type="hidden" name="product_id" value="{{ $id }}">
                                <button type="submit" name="quantity" value="{{ $item['quantity'] - 1 }}" 
                                    class="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center justify-center font-bold text-sm">-</button>
                                <input type="number" name="quantity" value="{{ $item['quantity'] }}" min="1" max="{{ $item['stock'] }}"
                                    class="w-12 h-6 text-center text-xs font-semibold border border-slate-200 rounded py-0 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                                <button type="submit" name="quantity" value="{{ $item['quantity'] + 1 }}"
                                    class="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center justify-center font-bold text-sm">+</button>
                            </form>
                        </div>
                        
                        <div class="text-right">
                            <span class="font-bold text-sm text-slate-950">Rp{{ number_format($item['selling_price'] * $item['quantity'], 0, ',', '.') }}</span>
                            <div class="mt-1">
                                <a href="{{ route('cart.remove', $id) }}" class="text-[10px] text-rose-500 hover:underline">Hapus</a>
                            </div>
                        </div>
                    </div>
                @endforeach
            @endif
        </div>

        <!-- Checkout Section -->
        @if(!empty($cart))
            <div class="bg-slate-50 border-t border-slate-100 p-6">
                <!-- Subtotal Row -->
                <div class="flex justify-between items-center mb-4">
                    <span class="text-sm font-semibold text-slate-500">Total Belanja</span>
                    <span class="text-xl font-extrabold text-slate-900">Rp{{ number_format($totalAmount, 0, ',', '.') }}</span>
                </div>
                
                <!-- Checkout Form -->
                <form action="{{ route('checkout') }}" method="POST" class="space-y-4">
                    @csrf
                    
                    <!-- Paid Amount Input -->
                    <div>
                        <label for="desktop_paid_amount" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Uang Bayar (Nominal)</label>
                        <div class="relative">
                            <span class="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">Rp</span>
                            <input type="number" name="paid_amount" id="desktop_paid_amount" required min="{{ $totalAmount }}" x-model.number="paidAmount" placeholder="Nominal bayar..."
                                class="w-full pl-9 pr-24 py-2 text-sm font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            <button type="button" @click="paidAmount = totalAmount" class="absolute right-2 top-1.5 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded border border-emerald-200">
                                Uang Pas
                            </button>
                        </div>
                        
                        <!-- Denominations shortcuts -->
                        <div class="grid grid-cols-4 gap-1.5 mt-2">
                            <button type="button" @click="paidAmount = 1000" class="py-0.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-200 transition">1.000</button>
                            <button type="button" @click="paidAmount = 2000" class="py-0.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-200 transition">2.000</button>
                            <button type="button" @click="paidAmount = 3000" class="py-0.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-200 transition">3.000</button>
                            <button type="button" @click="paidAmount = 5000" class="py-0.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-200 transition">5.000</button>
                            <button type="button" @click="paidAmount = 0" class="py-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded border border-rose-200 transition">Reset</button>
                            <button type="button" @click="paidAmount = paidAmount + 500" class="py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-200 transition">▲</button>
                            <button type="button" @click="paidAmount = Math.max(paidAmount - 500, 0)" class="py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-200 transition">▼</button>
                        </div>
                    </div>

                    <!-- Change Calculation Row -->
                    <div class="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 text-sm">
                        <span class="font-semibold text-slate-500">Uang Kembalian</span>
                        <span class="font-extrabold text-emerald-600" x-text="paidAmount >= totalAmount ? 'Rp' + new Intl.NumberFormat('id-ID').format(paidAmount - totalAmount) : 'Rp0'"></span>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" :disabled="paidAmount < totalAmount || !paidAmount" 
                        class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg shadow transition flex items-center justify-center gap-2">
                        Simpan Transaksi
                    </button>
                </form>
            </div>
        @endif
    </div>

    <!-- Floating bottom bar on mobile (if cart not empty) -->
    @if(!empty($cart))
        <div class="lg:hidden fixed bottom-16 left-0 right-0 bg-emerald-600 text-white px-5 py-3.5 flex justify-between items-center shadow-2xl z-20 transition border-t border-emerald-500">
            <div>
                <p class="text-[10px] font-bold uppercase tracking-wider text-emerald-100">Keranjang</p>
                <p class="text-sm font-extrabold">{{ count($cart) }} Item &bull; Rp{{ number_format($totalAmount, 0, ',', '.') }}</p>
            </div>
            <button @click="showCartDrawer = true" class="px-4 py-2 bg-white text-emerald-800 font-bold text-xs rounded-xl shadow-sm transition hover:bg-slate-100 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"></path>
                </svg>
                Buka Keranjang
            </button>
        </div>
    @endif

    <!-- Mobile Slide-Up Cart Drawer Sheet -->
    <div x-show="showCartDrawer" class="fixed inset-0 z-40 lg:hidden" x-cloak>
        <!-- Overlay -->
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="showCartDrawer = false"></div>
        
        <!-- Sheet Container -->
        <div x-show="showCartDrawer"
             x-transition:enter="transition ease-out duration-300 transform"
             x-transition:enter-start="translate-y-full"
             x-transition:enter-end="translate-y-0"
             x-transition:leave="transition ease-in duration-200 transform"
             x-transition:leave-start="translate-y-0"
             x-transition:leave-end="translate-y-full"
             class="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
             
             <!-- Drawer Header -->
             <div class="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                 <div class="flex items-center gap-2">
                     <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                         <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"></path>
                     </svg>
                     <h3 class="text-sm font-bold text-slate-900">Keranjang Belanja ({{ count($cart) }})</h3>
                 </div>
                 <button @click="showCartDrawer = false" class="text-slate-400 hover:text-slate-600 text-xs font-bold px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg">
                     Tutup
                 </button>
             </div>

             <!-- Drawer Items List -->
             <div class="flex-1 overflow-y-auto p-5 space-y-4">
                 @foreach($cart as $id => $item)
                     <div class="flex justify-between items-start gap-4 pb-4 border-b border-slate-100">
                         <div class="flex-1">
                             <div class="flex items-center gap-1.5">
                                 <h4 class="font-bold text-slate-900 text-xs md:text-sm">{{ $item['name'] }}</h4>
                                 <span class="px-1 py-0.5 rounded text-[8px] font-bold uppercase {{ $item['type'] === 'kantin' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700' }}">
                                     {{ $item['type'] === 'kantin' ? 'Kantin' : 'Siswa' }}
                                 </span>
                             </div>
                             <p class="text-[10px] md:text-xs text-slate-500 mt-0.5">Rp{{ number_format($item['selling_price'], 0, ',', '.') }}</p>
                             
                             <form action="{{ route('cart.update') }}" method="POST" class="flex items-center gap-1 mt-2">
                                 @csrf
                                 <input type="hidden" name="product_id" value="{{ $id }}">
                                 <button type="submit" name="quantity" value="{{ $item['quantity'] - 1 }}" 
                                     class="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center justify-center font-bold text-sm">-</button>
                                 <input type="number" name="quantity" value="{{ $item['quantity'] }}" min="1" max="{{ $item['stock'] }}"
                                      class="w-12 h-8 text-center text-lg font-semibold border border-slate-300 rounded bg-white focus:outline-none">
                                 <button type="submit" name="quantity" value="{{ $item['quantity'] + 1 }}"
                                     class="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center justify-center font-bold text-sm">+</button>
                             </form>
                         </div>
                         
                         <div class="text-right">
                             <span class="font-bold text-xs md:text-sm text-slate-950">Rp{{ number_format($item['selling_price'] * $item['quantity'], 0, ',', '.') }}</span>
                             <div class="mt-1">
                                 <a href="{{ route('cart.remove', $id) }}" class="text-[10px] text-rose-500 hover:underline">Hapus</a>
                             </div>
                         </div>
                     </div>
                 @endforeach
             </div>

             <!-- Drawer Checkout Payment Form -->
             <div class="bg-slate-50 border-t border-slate-100 p-5 pb-8 shrink-0">
                 <div class="flex justify-between items-center mb-3">
                     <span class="text-xs font-bold text-slate-500">Total Belanja</span>
                     <span class="text-lg font-extrabold text-slate-900">Rp{{ number_format($totalAmount, 0, ',', '.') }}</span>
                 </div>
                 
                 <form action="{{ route('checkout') }}" method="POST" class="space-y-3">
                     @csrf
                     
                     <div>
                         <label for="mobile_paid_amount" class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Uang Bayar</label>
                         <div class="relative">
                             <span class="absolute left-3 top-2.5 text-xs font-semibold text-slate-400">Rp</span>
                             <input type="number" name="paid_amount" id="mobile_paid_amount" required min="{{ $totalAmount }}" x-model.number="paidAmount" placeholder="Nominal bayar..."
                                 class="w-full pl-8 pr-24 py-2 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                             <button type="button" @click="paidAmount = totalAmount" class="absolute right-2 top-1.5 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded border border-emerald-200">
                                 Uang Pas
                             </button>
                         </div>
                         
                         <!-- Denominations shortcuts -->
                         <div class="grid grid-cols-4 gap-1.5 mt-2">
                            <button type="button" @click="paidAmount = 1000" class="py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-200 transition">1.000</button>
                            <button type="button" @click="paidAmount = 2000" class="py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-200 transition">2.000</button>
                            <button type="button" @click="paidAmount = 3000" class="py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-200 transition">3.000</button>
                            <button type="button" @click="paidAmount = 5000" class="py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-200 transition">5.000</button>
                            <button type="button" @click="paidAmount = 0" class="py-1 text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded border border-rose-200 transition">Reset</button>
                            <button type="button" @click="paidAmount = paidAmount + 500" class="py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-200 transition">▲</button>
                            <button type="button" @click="paidAmount = Math.max(paidAmount - 500, 0)" class="py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-200 transition">▼</button>
                        </div>
                     </div>

                     <div class="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                         <span class="font-semibold text-slate-500">Kembalian</span>
                         <span class="font-extrabold text-emerald-600" x-text="paidAmount >= totalAmount ? 'Rp' + new Intl.NumberFormat('id-ID').format(paidAmount - totalAmount) : 'Rp0'"></span>
                     </div>

                     <button type="submit" :disabled="paidAmount < totalAmount || !paidAmount" 
                         class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-1">
                         Simpan & Cetak Struk
                     </button>
                 </form>
             </div>
        </div>
    </div>

</div>
@endsection
