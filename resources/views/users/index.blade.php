@extends('layouts.app')

@section('title', 'User Management')

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6" x-data="{ editModal: false, editId: '', editName: '', editEmail: '', editRole: 'cashier' }">
    
    <!-- Add User Form -->
    <div class="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <h3 class="text-sm md:text-base font-bold text-slate-900 mb-4">Tambah User Baru</h3>
        
        <form action="{{ route('users.store') }}" method="POST">
            @csrf
            
            <div class="mb-4">
                <label for="name" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                <input type="text" name="name" id="name" required placeholder="Contoh: Ahmad Kasir"
                    class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                @error('name')
                    <p class="text-rose-600 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-4">
                <label for="email" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Alamat Email</label>
                <input type="email" name="email" id="email" required placeholder="Contoh: ahmad@canteen.com"
                    class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                @error('email')
                    <p class="text-rose-600 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-4">
                <label for="role" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Hak Akses / Role</label>
                <select name="role" id="role" required
                    class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="cashier">Kasir (Petugas Canteen)</option>
                    <option value="admin">Admin (Pengelola)</option>
                </select>
                @error('role')
                    <p class="text-rose-600 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-4">
                <label for="password" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                <input type="password" name="password" id="password" required placeholder="Minimal 8 karakter..."
                    class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                @error('password')
                    <p class="text-rose-600 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-5">
                <label for="password_confirmation" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Konfirmasi Password</label>
                <input type="password" name="password_confirmation" id="password_confirmation" required placeholder="Ulangi password..."
                    class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            
            <button type="submit" class="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition">
                Simpan User
            </button>
        </form>
    </div>

    <!-- User List -->
    <div class="lg:col-span-2 flex flex-col gap-4">
        
        <!-- Header panel -->
        <div class="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <h3 class="text-sm md:text-base font-bold text-slate-900">Daftar Pengguna</h3>
            <span class="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-full">{{ $users->total() }} Pengguna</span>
        </div>
        
        <!-- Mobile View: Card Stack (Visible on small screens) -->
        <div class="grid grid-cols-1 gap-3 md:hidden">
            @foreach($users as $u)
                <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-bold text-slate-950 text-sm">{{ $u->name }}</h4>
                            <span class="text-xs text-slate-500">{{ $u->email }}</span>
                        </div>
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold {{ $u->role === 'admin' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200' }} capitalize">
                            {{ $u->role }}
                        </span>
                    </div>

                    <div class="flex justify-end gap-2 pt-1 border-t border-slate-100">
                        <button @click="
                            editModal = true; 
                            editId = '{{ $u->id }}'; 
                            editName = '{{ addslashes($u->name) }}'; 
                            editEmail = '{{ $u->email }}'; 
                            editRole = '{{ $u->role }}';
                        " class="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs rounded-lg transition">
                            Ubah
                        </button>
                        
                        @if($u->id !== auth()->id() && $users->total() > 1)
                            <form action="{{ route('users.destroy', $u->id) }}" method="POST" onsubmit="return confirm('Hapus user ini?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-lg transition">
                                    Hapus
                                </button>
                            </form>
                        @endif
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
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nama</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                            <th class="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                            <th class="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 bg-white">
                        @foreach($users as $u)
                            <tr class="hover:bg-slate-50 transition">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-950">{{ $u->name }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ $u->email }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold {{ $u->role === 'admin' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200' }} capitalize">
                                        {{ $u->role }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <div class="inline-flex gap-2">
                                        <button @click="
                                            editModal = true; 
                                            editId = '{{ $u->id }}'; 
                                            editName = '{{ addslashes($u->name) }}'; 
                                            editEmail = '{{ $u->email }}'; 
                                            editRole = '{{ $u->role }}';
                                        " class="inline-flex items-center px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-xs rounded transition">
                                            Ubah
                                        </button>
                                        
                                        @if($u->id !== auth()->id() && $users->total() > 1)
                                            <form action="{{ route('users.destroy', $u->id) }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus user ini?')">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="inline-flex items-center px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold text-xs rounded transition">
                                                    Hapus
                                                </button>
                                            </form>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>

        <div class="px-5 py-4 border-t border-slate-100 bg-slate-50">
            {{ $users->links() }}
        </div>
    </div>

    <!-- Edit User Modal -->
    <div x-show="editModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4" x-cloak>
        <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100" @click.away="editModal = false">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-bold text-slate-900">Ubah Data Pengguna</h3>
                <button @click="editModal = false" class="text-slate-400 hover:text-slate-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form :action="'{{ url('/users') }}/' + editId" method="POST">
                @csrf
                @method('PUT')
                
                <div class="mb-4">
                    <label for="edit_name" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                    <input type="text" name="name" id="edit_name" required x-model="editName"
                        class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                </div>

                <div class="mb-4">
                    <label for="edit_email" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Alamat Email</label>
                    <input type="email" name="email" id="edit_email" required x-model="editEmail"
                        class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                </div>

                <div class="mb-4">
                    <label for="edit_role" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Role</label>
                    <select name="role" id="edit_role" required x-model="editRole"
                        class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <option value="cashier">Kasir (Petugas Canteen)</option>
                        <option value="admin">Admin (Pengelola)</option>
                    </select>
                </div>

                <div class="bg-slate-50 p-3 border border-slate-200 rounded-lg mb-4 text-slate-500 text-xs">
                    Isi field password di bawah hanya jika ingin mengganti password user ini.
                </div>

                <div class="mb-4">
                    <label for="edit_password" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Password Baru</label>
                    <input type="password" name="password" id="edit_password" placeholder="Kosongkan jika tidak diubah..."
                        class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                </div>

                <div class="mb-5">
                    <label for="edit_password_confirmation" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Konfirmasi Password</label>
                    <input type="password" name="password_confirmation" id="edit_password_confirmation" placeholder="Kosongkan jika tidak diubah..."
                        class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
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
