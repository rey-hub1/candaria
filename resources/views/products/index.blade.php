@extends('layouts.app')

@section('title', 'Kelola Produk')

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6" 
     x-data="{ 
        addType: '{{ request('seller_id') ? "siswa" : "kantin" }}',
        editModal: false, 
        editId: '', 
        editName: '', 
        editCode: '', 
        editCategory: '', 
        editType: 'kantin', 
        editCostPrice: 0, 
        editSellingPrice: 0, 
        editSellerId: '', 
        editStock: 0 
     }">
    
    <!-- Add Product Form -->
    <div class="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <h3 class="text-sm md:text-base font-bold text-slate-900 mb-4">Tambah Produk Baru</h3>
        
        <form action="{{ route('products.store') }}" method="POST">
            @csrf
            
            <div class="mb-4">
                <label for="name" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Produk</label>
                <input type="text" name="name" id="name" required placeholder="Contoh: Roti Cokelat"
                    class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>

            <div class="mb-4">
                <label for="code" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kode Produk</label>
                <input type="text" name="code" id="code" placeholder="Kosongkan untuk buat otomatis..."
                    class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <p class="text-[10px] text-slate-400 mt-1">Kode bersifat unik. Jika kosong, akan otomatis dibuat (contoh: KDE-0001).</p>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label for="category_id" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                    <select name="category_id" id="category_id" required
                        class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <option value="">Pilih...</option>
                        @foreach($categories as $cat)
                            <option value="{{ $cat->id }}">{{ $cat->name }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label for="type" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Jenis Produk</label>
                    <select name="type" id="type" required x-model="addType"
                        class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <option value="kantin">Produk Kantin</option>
                        <option value="siswa">Produk Siswa (Titipan)</option>
                    </select>
                </div>
            </div>

            <!-- Dynamic field for Siswa: Seller selection -->
            <div class="mb-4" x-show="addType === 'siswa'" x-transition x-cloak>
                <label for="seller_id" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Siswa Penitip</label>
                <select name="seller_id" id="seller_id" :required="addType === 'siswa'"
                    class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="">Pilih Siswa...</option>
                    @foreach($sellers as $sel)
                        <option value="{{ $sel->id }}" {{ $sel->id == request('seller_id') ? 'selected' : '' }}>{{ $sel->name }} ({{ $sel->class }})</option>
                    @endforeach
                </select>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label for="cost_price" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2" x-text="addType === 'siswa' ? 'Harga Siswa (Modal)' : 'Harga Modal'"></label>
                    <input type="number" name="cost_price" id="cost_price" required min="0" placeholder="Contoh: 1500"
                        class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                </div>
                
                <!-- If type is kantin, show custom selling price. If siswa, show auto +500 helper -->
                <div x-show="addType === 'kantin'">
                    <label for="selling_price" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Harga Jual</label>
                    <input type="number" name="selling_price" id="selling_price" :required="addType === 'kantin'" min="0" placeholder="Contoh: 2000"
                        class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                </div>
                <div x-show="addType === 'siswa'" x-cloak class="flex flex-col justify-end pb-1.5">
                    <div class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 font-semibold leading-normal">
                        Harga jual otomatis diset <span class="text-emerald-600">Siswa + Rp500</span>
                    </div>
                </div>
            </div>

            <div class="mb-5">
                <label for="stock" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stok Awal</label>
                <input type="number" name="stock" id="stock" required min="0" placeholder="Contoh: 50"
                    class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            
            <button type="submit" class="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition">
                Simpan Produk
            </button>
        </form>
    </div>

    <!-- Product List -->
    <div class="lg:col-span-2 flex flex-col gap-4">
        
        <!-- Header Panel -->
        <div class="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <h3 class="text-sm md:text-base font-bold text-slate-900">Daftar Produk</h3>
            <span class="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-full">{{ $products->count() }} Produk</span>
        </div>

        @if($products->isEmpty())
            <div class="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                Belum ada produk yang ditambahkan.
            </div>
        @else
            <!-- Mobile View: Card Stack (Visible on small screens) -->
            <div class="grid grid-cols-1 gap-3 md:hidden">
                @foreach($products as $p)
                    <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-bold text-slate-900 text-sm">{{ $p->name }}</h4>
                                <span class="text-[10px] text-slate-400 font-mono">{{ $p->code }}</span>
                            </div>
                            <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase {{ $p->type === 'kantin' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700' }}">
                                {{ $p->type === 'kantin' ? 'Kantin' : 'Siswa' }}
                            </span>
                        </div>

                        <div class="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                            <div>
                                <p class="text-slate-400 font-medium">Kategori</p>
                                <p class="font-bold text-slate-700">{{ $p->category->name }}</p>
                            </div>
                            <div>
                                <p class="text-slate-400 font-medium">Stok Sisa</p>
                                <p class="font-extrabold {{ $p->stock <= 5 ? 'text-rose-600' : 'text-slate-700' }}">{{ $p->stock }} pcs</p>
                            </div>
                            <div class="mt-1">
                                <p class="text-slate-400 font-medium">Harga Modal</p>
                                <p class="font-bold text-slate-700">Rp{{ number_format($p->cost_price, 0, ',', '.') }}</p>
                            </div>
                            <div class="mt-1">
                                <p class="text-slate-400 font-medium">Harga Jual</p>
                                <p class="font-extrabold text-slate-900">Rp{{ number_format($p->selling_price, 0, ',', '.') }}</p>
                            </div>
                        </div>

                        @if($p->seller)
                            <div class="text-[11px] text-slate-500 font-semibold">
                                Siswa Penitip: <span class="text-slate-700 font-bold">{{ $p->seller->name }} ({{ $p->seller->class }})</span>
                            </div>
                        @endif

                        <div class="flex justify-end gap-2 pt-1">
                            <button @click="
                                editModal = true; 
                                editId = '{{ $p->id }}'; 
                                editName = '{{ addslashes($p->name) }}'; 
                                editCode = '{{ $p->code }}'; 
                                editCategory = '{{ $p->category_id }}'; 
                                editType = '{{ $p->type }}'; 
                                editCostPrice = '{{ (int)$p->cost_price }}'; 
                                editSellingPrice = '{{ (int)$p->selling_price }}'; 
                                editSellerId = '{{ $p->seller_id }}'; 
                                editStock = '{{ $p->stock }}';
                            " class="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs rounded-lg transition">
                                Ubah
                            </button>
                            <form action="{{ route('products.destroy', $p->id) }}" method="POST" onsubmit="return confirm('Hapus produk ini?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-lg transition">
                                    Hapus
                                </button>
                            </form>
                        </div>
                    </div>
                @endforeach
            </div>

            <!-- Desktop View: Table (Visible on medium/large screens) -->
            <div class="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-100">
                        <thead>
                            <tr class="bg-slate-50">
                                <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Info Produk</th>
                                <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori & Jenis</th>
                                <th class="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Harga Modal</th>
                                <th class="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Harga Jual</th>
                                <th class="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Stok</th>
                                <th class="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 bg-white">
                            @foreach($products as $p)
                                <tr class="hover:bg-slate-50 transition">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-bold text-slate-950">{{ $p->name }}</div>
                                        <div class="text-xs text-slate-500 font-mono">{{ $p->code }}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-xs font-semibold text-slate-700">{{ $p->category->name }}</div>
                                        <div class="mt-1 flex flex-wrap gap-1 items-center">
                                            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold {{ $p->type === 'kantin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-orange-50 text-orange-700 border border-orange-200' }} capitalize">
                                                {{ $p->type === 'kantin' ? 'Produk Kantin' : 'Produk Siswa' }}
                                            </span>
                                            @if($p->seller)
                                                <span class="text-[10px] text-slate-500 font-medium">oleh {{ $p->seller->name }}</span>
                                            @endif
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600">
                                        Rp{{ number_format($p->cost_price, 0, ',', '.') }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-slate-950">
                                        Rp{{ number_format($p->selling_price, 0, ',', '.') }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <span class="px-2.5 py-1 rounded-lg text-xs font-bold {{ $p->stock <= 5 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700' }}">
                                            {{ $p->stock }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <div class="inline-flex gap-2">
                                            <button @click="
                                                editModal = true; 
                                                editId = '{{ $p->id }}'; 
                                                editName = '{{ addslashes($p->name) }}'; 
                                                editCode = '{{ $p->code }}'; 
                                                editCategory = '{{ $p->category_id }}'; 
                                                editType = '{{ $p->type }}'; 
                                                editCostPrice = '{{ (int)$p->cost_price }}'; 
                                                editSellingPrice = '{{ (int)$p->selling_price }}'; 
                                                editSellerId = '{{ $p->seller_id }}'; 
                                                editStock = '{{ $p->stock }}';
                                            " class="inline-flex items-center px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-xs rounded transition">
                                                Ubah
                                            </button>
                                            <form action="{{ route('products.destroy', $p->id) }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus produk ini?')">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="inline-flex items-center px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold text-xs rounded transition">
                                                    Hapus
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        @endif
    </div>

    <!-- Edit Product Modal -->
    <div x-show="editModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4" x-cloak>
        <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100" @click.away="editModal = false">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-bold text-slate-900">Ubah Data Produk</h3>
                <button @click="editModal = false" class="text-slate-400 hover:text-slate-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form :action="'{{ url('/products') }}/' + editId" method="POST">
                @csrf
                @method('PUT')
                
                <div class="mb-4">
                    <label for="edit_name" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Produk</label>
                    <input type="text" name="name" id="edit_name" required x-model="editName"
                        class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                </div>

                <div class="mb-4">
                    <label for="edit_code" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kode Produk</label>
                    <input type="text" name="code" id="edit_code" x-model="editCode" placeholder="Biarkan terisi atau ubah..."
                        class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label for="edit_category" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                        <select name="category_id" id="edit_category" required x-model="editCategory"
                            class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            @foreach($categories as $cat)
                                <option value="{{ $cat->id }}">{{ $cat->name }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label for="edit_type" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Jenis Produk</label>
                        <select name="type" id="edit_type" required x-model="editType"
                            class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            <option value="kantin">Produk Kantin</option>
                            <option value="siswa">Produk Siswa (Titipan)</option>
                        </select>
                    </div>
                </div>

                <!-- Dynamic field for Siswa: Seller selection -->
                <div class="mb-4" x-show="editType === 'siswa'" x-transition x-cloak>
                    <label for="edit_seller_id" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Siswa Penitip</label>
                    <select name="seller_id" id="edit_seller_id" :required="editType === 'siswa'" x-model="editSellerId"
                        class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <option value="">Pilih Siswa...</option>
                        @foreach($sellers as $sel)
                            <option value="{{ $sel->id }}">{{ $sel->name }} ({{ $sel->class }})</option>
                        @endforeach
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label for="edit_cost_price" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2" x-text="editType === 'siswa' ? 'Harga Siswa (Modal)' : 'Harga Modal'"></label>
                        <input type="number" name="cost_price" id="edit_cost_price" required min="0" x-model="editCostPrice"
                            class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    </div>
                    
                    <div x-show="editType === 'kantin'">
                        <label for="edit_selling_price" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Harga Jual</label>
                        <input type="number" name="selling_price" id="edit_selling_price" :required="editType === 'kantin'" min="0" x-model="editSellingPrice"
                            class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    </div>
                    <div x-show="editType === 'siswa'" x-cloak class="flex flex-col justify-end pb-1.5">
                        <div class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 font-semibold leading-normal">
                            Harga jual otomatis diset <span class="text-emerald-600">Siswa + Rp500</span>
                        </div>
                    </div>
                </div>

                <div class="mb-5">
                    <label for="edit_stock" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stok</label>
                    <input type="number" name="stock" id="edit_stock" required min="0" x-model="editStock"
                        class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                </div>
                
                <div class="flex justify-end gap-2">
                    <button type="button" @click="editModal = false" 
                        class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition">
                        Batal
                    </button>
                    <button type="submit" 
                        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition">
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    </div>

</div>
@endsection
