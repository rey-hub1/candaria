import React, { useState } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FilterBar from '@/Components/FilterBar';
import SortableHeader from '@/Components/SortableHeader';

export default function Index({ users = { data: [], links: [], total: 0 }, filters = {} }) {
    const { auth } = usePage().props;
    const [editModal, setEditModal] = useState(false);
    const [editId, setEditId] = useState('');

    // Add Form
    const { data: addData, setData: setAddData, post: postAdd, processing: addProcessing, errors: addErrors, reset: addReset } = useForm({
        name: '',
        email: '',
        role: 'cashier',
        password: '',
        password_confirmation: '',
    });

    // Edit Form
    const { data: editData, setData: setEditData, put: putEdit, processing: editProcessing, errors: editErrors, reset: editReset } = useForm({
        name: '',
        email: '',
        role: 'cashier',
        password: '',
        password_confirmation: '',
    });

    const handleAddSubmit = (e) => {
        e.preventDefault();
        postAdd(route('users.store'), {
            onSuccess: () => addReset(),
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        putEdit(route('users.update', editId), {
            onSuccess: () => {
                setEditModal(false);
                editReset();
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
            router.delete(route('users.destroy', id));
        }
    };

    const openEditModal = (user) => {
        setEditId(user.id);
        setEditData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
            password_confirmation: '',
        });
        setEditModal(true);
    };

    const Pagination = ({ links = [] }) => {
        if (links.length <= 3) return null;
        return (
            <div className="flex flex-wrap gap-1 justify-center mt-4">
                {links.map((link, key) => (
                    link.url === null ? (
                        <div
                            key={key}
                            className="px-3 py-1.5 text-xs text-slate-400 border border-slate-200 rounded-lg bg-slate-50"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <Link
                            key={key}
                            href={link.url}
                            className={`px-3 py-1.5 text-xs border rounded-lg transition ${
                                link.active
                                    ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )
                ))}
            </div>
        );
    };

    return (
        <AuthenticatedLayout title="User Management">
            <Head title="User Management" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Add User Form */}
                <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                    <h3 className="text-sm md:text-base font-bold text-slate-900 mb-4">Tambah User Baru</h3>
                    
                    <form onSubmit={handleAddSubmit}>
                        <div className="mb-4">
                            <label htmlFor="add_name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                            <input
                                type="text"
                                name="name"
                                id="add_name"
                                required
                                placeholder="Contoh: Ahmad Kasir"
                                value={addData.name}
                                onChange={(e) => setAddData('name', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {addErrors.name && <p className="text-rose-600 text-xs mt-1">{addErrors.name}</p>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="add_email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Alamat Email</label>
                            <input
                                type="email"
                                name="email"
                                id="add_email"
                                required
                                placeholder="Contoh: ahmad@canteen.com"
                                value={addData.email}
                                onChange={(e) => setAddData('email', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {addErrors.email && <p className="text-rose-600 text-xs mt-1">{addErrors.email}</p>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="add_role" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Hak Akses / Role</label>
                            <select
                                name="role"
                                id="add_role"
                                required
                                value={addData.role}
                                onChange={(e) => setAddData('role', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="cashier">Kasir (Petugas Canteen)</option>
                                <option value="admin">Admin (Pengelola)</option>
                            </select>
                            {addErrors.role && <p className="text-rose-600 text-xs mt-1">{addErrors.role}</p>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="add_password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                id="add_password"
                                required
                                placeholder="Minimal 8 karakter..."
                                value={addData.password}
                                onChange={(e) => setAddData('password', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {addErrors.password && <p className="text-rose-600 text-xs mt-1">{addErrors.password}</p>}
                        </div>

                        <div className="mb-5">
                            <label htmlFor="add_password_confirmation" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Konfirmasi Password</label>
                            <input
                                type="password"
                                name="password_confirmation"
                                id="add_password_confirmation"
                                required
                                placeholder="Ulangi password..."
                                value={addData.password_confirmation}
                                onChange={(e) => setAddData('password_confirmation', e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={addProcessing}
                            className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
                        >
                            {addProcessing ? 'Menyimpan...' : 'Simpan User'}
                        </button>
                    </form>
                </div>

                {/* User List */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <FilterBar filters={filters} searchPlaceholder="Cari nama/email..." />
                    
                    {/* Header panel */}
                    <div className="bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <h3 className="text-sm md:text-base font-bold text-slate-900">Daftar Pengguna</h3>
                        <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-full">{users.total} Pengguna</span>
                    </div>
                    
                    {users.data.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                            Belum ada pengguna.
                        </div>
                    ) : (
                        <>
                            {/* Mobile View: Card Stack */}
                            <div className="grid grid-cols-1 gap-3 md:hidden">
                                {users.data.map((u) => (
                                    <div key={u.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-slate-955 text-sm">{u.name}</h4>
                                                <span className="text-xs text-slate-500">{u.email}</span>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                u.role === 'admin' 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                            } capitalize`}>
                                                {u.role}
                                            </span>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                                            <button
                                                onClick={() => openEditModal(u)}
                                                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs rounded-lg transition"
                                            >
                                                Ubah
                                            </button>
                                            
                                            {u.id !== auth.user.id && users.total > 1 && (
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-lg transition"
                                                >
                                                    Hapus
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop View: Table */}
                            <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-100">
                                        <thead>
                                        <tr className="bg-slate-50">
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-16">No</th>
                                            <SortableHeader column="name" label="Informasi User" filters={filters} />
                                            <SortableHeader column="role" label="Role / Hak Akses" filters={filters} />
                                            <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {users.data.map((u, index) => (
                                                <tr key={u.id} className="hover:bg-slate-50 transition">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{(users.current_page - 1) * users.per_page + index + 1}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-slate-950">{u.name}</div>
                                                        <div className="text-xs text-slate-500">{u.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                                                            u.role === 'admin' 
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                        } capitalize`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                        <div className="inline-flex gap-2">
                                                            <button
                                                                onClick={() => openEditModal(u)}
                                                                className="inline-flex items-center px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-xs rounded transition"
                                                            >
                                                                Ubah
                                                            </button>
                                                            
                                                            {u.id !== auth.user.id && users.total > 1 && (
                                                                <button
                                                                    onClick={() => handleDelete(u.id)}
                                                                    className="inline-flex items-center px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold text-xs rounded transition"
                                                                >
                                                                    Hapus
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <Pagination links={users.links} />
                        </>
                    )}
                </div>
            </div>

            {/* Edit User Modal */}
            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-slate-900">Ubah Data Pengguna</h3>
                            <button onClick={() => setEditModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label htmlFor="edit_name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="edit_name"
                                    required
                                    value={editData.name}
                                    onChange={(e) => setEditData('name', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                {editErrors.name && <p className="text-rose-600 text-xs mt-1">{editErrors.name}</p>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="edit_email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Alamat Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="edit_email"
                                    required
                                    value={editData.email}
                                    onChange={(e) => setEditData('email', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                {editErrors.email && <p className="text-rose-600 text-xs mt-1">{editErrors.email}</p>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="edit_role" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Role</label>
                                <select
                                    name="role"
                                    id="edit_role"
                                    required
                                    value={editData.role}
                                    onChange={(e) => setEditData('role', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="cashier">Kasir (Petugas Canteen)</option>
                                    <option value="admin">Admin (Pengelola)</option>
                                </select>
                                {editErrors.role && <p className="text-rose-600 text-xs mt-1">{editErrors.role}</p>}
                            </div>

                            <div className="bg-slate-50 p-3 border border-slate-200 rounded-lg mb-4 text-slate-500 text-xs">
                                Isi field password di bawah hanya jika ingin mengganti password user ini.
                            </div>

                            <div className="mb-4">
                                <label htmlFor="edit_password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Password Baru</label>
                                <input
                                    type="password"
                                    name="password"
                                    id="edit_password"
                                    placeholder="Kosongkan jika tidak diubah..."
                                    value={editData.password}
                                    onChange={(e) => setEditData('password', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                {editErrors.password && <p className="text-rose-600 text-xs mt-1">{editErrors.password}</p>}
                            </div>

                            <div className="mb-5">
                                <label htmlFor="edit_password_confirmation" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Konfirmasi Password</label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    id="edit_password_confirmation"
                                    placeholder="Kosongkan jika tidak diubah..."
                                    value={editData.password_confirmation}
                                    onChange={(e) => setEditData('password_confirmation', e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditModal(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
                                >
                                    {editProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
