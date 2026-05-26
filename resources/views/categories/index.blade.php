@extends('layouts.app')

@section('title', 'Kategori Produk')

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6" x-data="{ editModal: false, editId: '', editName: '' }">
    
    <!-- Add Category Form -->
    <div class="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <h3 class="text-sm md:text-base font-bold text-slate-900 mb-4">Tambah Kategori Baru</h3>
        
        <form action="{{ route('categories.store') }}" method="POST">
            @csrf
            <div class="mb-4">
                <label for="name" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Kategori</label>
                <input type="text" name="name" id="name" required placeholder="Contoh: Snack, Makanan Berat"
                    class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                @error('name')
                    <p class="text-rose-600 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>
            
            <button type="submit" class="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition">
                Simpan Kategori
            </button>
        </form>
    </div>

    <!-- Category List -->
    <div class="lg:col-span-2 flex flex-col gap-4">
        
        <!-- Header panel -->
        <div class="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <h3 class="text-sm md:text-base font-bold text-slate-900">Daftar Kategori</h3>
            <span class="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-full">{{ $categories->count() }} Kategori</span>
        </div>
        
        @if($categories->isEmpty())
            <div class="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                Belum ada kategori yang ditambahkan.
            </div>
        @else
            <!-- Mobile View: Card Stack (Visible on small screens) -->
            <div class="grid grid-cols-1 gap-3 md:hidden">
                @foreach($categories as $c)
                    <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                        <div class="flex justify-between items-center">
                            <h4 class="font-bold text-slate-950 text-sm">{{ $c->name }}</h4>
                            <span class="text-xs text-slate-500 font-mono">{{ $c->slug }}</span>
                        </div>

                        <div class="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                            <span class="text-slate-400 font-semibold">Jumlah Produk</span>
                            <span class="font-bold text-slate-900">{{ $c->products_count }} Produk</span>
                        </div>

                        <div class="flex justify-end gap-2 pt-1">
                            <button @click="editModal = true; editId = '{{ $c->id }}'; editName = '{{ addslashes($c->name) }}';" 
                                class="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs rounded-lg transition">
                                Ubah
                            </button>
                            <form action="{{ route('categories.destroy', $c->id) }}" method="POST" onsubmit="return confirm('Hapus kategori ini?')">
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
                                <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-16">No</th>
                                <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Kategori</th>
                                <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Slug</th>
                                <th class="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah Produk</th>
                                <th class="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 bg-white">
                            @foreach($categories as $index => $c)
                                <tr class="hover:bg-slate-50 transition">
                                    <td class="px-6 py-4 text-sm font-semibold text-slate-500">{{ $index + 1 }}</td>
                                    <td class="px-6 py-4 text-sm font-bold text-slate-950">{{ $c->name }}</td>
                                    <td class="px-6 py-4 text-sm text-slate-600 font-mono">{{ $c->slug }}</td>
                                    <td class="px-6 py-4 text-sm text-center font-semibold text-slate-600">{{ $c->products_count }}</td>
                                    <td class="px-6 py-4 text-sm text-center">
                                        <div class="inline-flex gap-2">
                                            <button @click="editModal = true; editId = '{{ $c->id }}'; editName = '{{ addslashes($c->name) }}';" 
                                                class="inline-flex items-center px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-xs rounded transition">
                                                Ubah
                                            </button>
                                            <form action="{{ route('categories.destroy', $c->id) }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus kategori ini?')">
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

    <!-- Edit Category Modal -->
    <div x-show="editModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4" x-cloak>
        <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100" @click.away="editModal = false">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-bold text-slate-900">Ubah Kategori</h3>
                <button @click="editModal = false" class="text-slate-400 hover:text-slate-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form :action="'{{ url('/categories') }}/' + editId" method="POST">
                @csrf
                @method('PUT')
                
                <div class="mb-5">
                    <label for="edit_name" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Kategori</label>
                    <input type="text" name="name" id="edit_name" required x-model="editName"
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
