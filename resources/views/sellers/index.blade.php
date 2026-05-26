@extends('layouts.app')

@section('title', 'Siswa Penitip')

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6" x-data="{ editModal: false, editId: '', editName: '', editClass: '', editPhone: '', editActive: '1' }">
    
    <!-- Add Seller Form -->
    <div class="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <h3 class="text-sm md:text-base font-bold text-slate-900 mb-4">Daftar Penitip Baru (Siswa)</h3>
        
        <form action="{{ route('sellers.store') }}" method="POST">
            @csrf
            
            <div class="mb-4">
                <label for="name" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                <input type="text" name="name" id="name" required placeholder="Contoh: Budi Setiawan"
                    class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                @error('name')
                    <p class="text-rose-600 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-4">
                <label for="class" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kelas</label>
                <input type="text" name="class" id="class" placeholder="Contoh: XII RPL 1"
                    class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                @error('class')
                    <p class="text-rose-600 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-4">
                <label for="phone" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">No. HP / WA</label>
                <input type="text" name="phone" id="phone" placeholder="Contoh: 08123456xxx"
                    class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                @error('phone')
                    <p class="text-rose-600 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>
            
            <button type="submit" class="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition">
                Simpan Penitip
            </button>
        </form>
    </div>

    <!-- Seller List -->
    <div class="lg:col-span-2 flex flex-col gap-4">
        
        <!-- Header panel -->
        <div class="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <h3 class="text-sm md:text-base font-bold text-slate-900">Daftar Siswa Penitip</h3>
            <span class="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-full">{{ $sellers->count() }} Orang</span>
        </div>
        
        @if($sellers->isEmpty())
            <div class="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                Belum ada data siswa penitip.
            </div>
        @else
            <!-- Mobile View: Card Stack (Visible on small screens) -->
            <div class="grid grid-cols-1 gap-3 md:hidden">
                @foreach($sellers as $s)
                    <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-bold text-slate-950 text-sm">{{ $s->name }}</h4>
                                <span class="text-xs text-slate-500">Kelas: {{ $s->class ?? '-' }}</span>
                            </div>
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold {{ $s->is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200' }}">
                                {{ $s->is_active ? 'Aktif' : 'Non-Aktif' }}
                            </span>
                        </div>

                        <div class="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                            <div>
                                <p class="text-slate-400 font-semibold">No. HP</p>
                                <p class="font-bold text-slate-700">{{ $s->phone ?? '-' }}</p>
                            </div>
                            <div>
                                <p class="text-slate-400 font-semibold">Jumlah Produk</p>
                                <p class="font-extrabold text-slate-900">{{ $s->products_count }} Produk</p>
                            </div>
                        </div>

                        <div class="flex justify-end gap-2 pt-1">
                            <button @click="editModal = true; editId = '{{ $s->id }}'; editName = '{{ addslashes($s->name) }}'; editClass = '{{ addslashes($s->class) }}'; editPhone = '{{ $s->phone }}'; editActive = '{{ $s->is_active ? '1' : '0' }}';" 
                                class="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs rounded-lg transition">
                                Ubah
                            </button>
                            <form action="{{ route('sellers.destroy', $s->id) }}" method="POST" onsubmit="return confirm('Hapus penitip ini?')">
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
                                <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nama</th>
                                <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Kelas</th>
                                <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">No. HP</th>
                                <th class="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th class="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Produk</th>
                                <th class="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 bg-white">
                            @foreach($sellers as $index => $s)
                                <tr class="hover:bg-slate-50 transition">
                                    <td class="px-6 py-4 text-sm font-semibold text-slate-500">{{ $index + 1 }}</td>
                                    <td class="px-6 py-4 text-sm font-bold text-slate-950">{{ $s->name }}</td>
                                    <td class="px-6 py-4 text-sm text-slate-600">{{ $s->class ?? '-' }}</td>
                                    <td class="px-6 py-4 text-sm text-slate-600">{{ $s->phone ?? '-' }}</td>
                                    <td class="px-6 py-4 text-sm text-center">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold {{ $s->is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200' }}">
                                            {{ $s->is_active ? 'Aktif' : 'Non-Aktif' }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-center font-semibold text-slate-600">{{ $s->products_count }}</td>
                                    <td class="px-6 py-4 text-sm text-center">
                                        <div class="inline-flex gap-2">
                                            <button @click="editModal = true; editId = '{{ $s->id }}'; editName = '{{ addslashes($s->name) }}'; editClass = '{{ addslashes($s->class) }}'; editPhone = '{{ $s->phone }}'; editActive = '{{ $s->is_active ? '1' : '0' }}';" 
                                                class="inline-flex items-center px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-xs rounded transition">
                                                Ubah
                                            </button>
                                            <form action="{{ route('sellers.destroy', $s->id) }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus data penitip ini?')">
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

    <!-- Edit Seller Modal -->
    <div x-show="editModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4" x-cloak>
        <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100" @click.away="editModal = false">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-bold text-slate-900">Ubah Data Penitip</h3>
                <button @click="editModal = false" class="text-slate-400 hover:text-slate-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form :action="'{{ url('/sellers') }}/' + editId" method="POST">
                @csrf
                @method('PUT')
                
                <div class="mb-4">
                    <label for="edit_name" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                    <input type="text" name="name" id="edit_name" required x-model="editName"
                        class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                </div>

                <div class="mb-4">
                    <label for="edit_class" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kelas</label>
                    <input type="text" name="class" id="edit_class" x-model="editClass"
                        class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                </div>

                <div class="mb-4">
                    <label for="edit_phone" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">No. HP / WA</label>
                    <input type="text" name="phone" id="edit_phone" x-model="editPhone"
                        class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                </div>

                <div class="mb-5">
                    <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status Aktif</label>
                    <div class="flex items-center gap-4">
                        <label class="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <input type="radio" name="is_active" value="1" x-model="editActive" class="text-emerald-600 focus:ring-emerald-500">
                            Aktif
                        </label>
                        <label class="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <input type="radio" name="is_active" value="0" x-model="editActive" class="text-emerald-600 focus:ring-emerald-500">
                            Non-Aktif
                        </label>
                    </div>
                </div>
                
                <div class="flex justify-end gap-2">
                    <button type="button" @click="editModal = false" 
                        class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition">
                        Batal
                    </button>
                    <button type="submit" 
                        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition">
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    </div>

</div>
@endsection
