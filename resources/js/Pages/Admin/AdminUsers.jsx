import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Search, Eye, Ban, X, Mail, Phone, Calendar, Shield, ShoppingBag, Trash2, Plus, Pencil, Lock } from 'lucide-react';
import { formatCurrency } from '../../Utils/helpers';
import AdminLayout from '../../Layouts/AdminLayout';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminUsers({ dbUsers = [] }) {
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'customer',
        status: 'Aktif',
    });

    const users = dbUsers.map(u => ({
        id: u.id,
        slug: u.slug,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        joined: new Date(u.created_at).toLocaleDateString('id-ID'),
        purchases: u.purchase_count || 0,
        totalSpent: u.total_spent || 0,
        role: u.role || 'user',
        status: u.status || 'Aktif'
    }));

    const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

    const openAddModal = () => {
        setEditingUser(null);
        reset();
        clearErrors();
        setIsFormModalOpen(true);
    };

    const openEditModal = (u) => {
        setEditingUser(u);
        setData({
            name: u.name,
            email: u.email,
            password: '', // Kept empty unless changing
            phone: u.phone,
            role: u.role,
            status: u.status,
        });
        clearErrors();
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            put(route('admin.users.update', editingUser.slug), {
                onSuccess: () => {
                    closeFormModal();
                    toast.success('Pengguna berhasil diperbarui');
                },
            });
        } else {
            post(route('admin.users.store'), {
                onSuccess: () => {
                    closeFormModal();
                    toast.success('Pengguna berhasil ditambahkan');
                },
            });
        }
    };

    const handleToggleStatus = (slug) => {
        router.patch(route('admin.users.toggle', slug), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Status pengguna diperbarui');
                if (selectedUser && (selectedUser.slug === slug || selectedUser.id === slug)) {
                    setSelectedUser(prev => ({ ...prev, status: prev.status === 'Aktif' ? 'Nonaktif' : 'Aktif' }));
                }
            }
        });
    };

    const handleDelete = (slug) => {
        if (confirm('Yakin ingin menghapus pengguna secara permanen?')) {
            router.delete(route('admin.users.destroy', slug), {
                preserveScroll: true,
                onSuccess: () => toast.success('Pengguna berhasil dihapus')
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Pengguna - JAGGAD ACADEMY" />
            <div className="admin-page">
                <div className="admin-page-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1>Manajemen Pengguna</h1>
                            <p className="admin-page-subtitle">Kelola semua pengguna yang terdaftar di platform</p>
                        </div>
                        <button className="btn-admin-primary" onClick={openAddModal}>
                            <Plus size={18} /> Tambah Pengguna
                        </button>
                    </div>
                </div>

                <div className="admin-controls">
                    <div className="admin-search-wrap">
                        <Search size={15} className="admin-search-icon" />
                        <input placeholder="Cari nama / email..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                <div className="admin-table-card">
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr><th>Pengguna</th><th>Role</th><th>Bergabung</th><th>Pembelian</th><th>Total Belanja</th><th>Status</th><th>Aksi</th></tr>
                            </thead>
                            <tbody>
                                {filtered.map(u => (
                                <tr key={u.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', flexShrink: 0 }}>{u.name[0]}</div>
                                                <div>
                                                    <p style={{ fontWeight: 500 }}>{u.name}</p>
                                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge-cat`} style={{ background: u.role === 'admin' ? 'var(--color-accent-dim)' : 'var(--color-bg-secondary)', color: u.role === 'admin' ? 'var(--color-accent-light)' : 'var(--color-text-muted)' }}>{u.role.toUpperCase()}</span>
                                        </td>
                                        <td className="text-muted">{u.joined}</td>
                                        <td>{u.purchases} produk</td>
                                        <td style={{ fontWeight: 600 }}>{formatCurrency(u.totalSpent)}</td>
                                        <td><span className={`status-badge ${u.status === 'Aktif' ? 'success' : 'error'}`}>{u.status}</span></td>
                                        <td>
                                            <div className="actions-col">
                                                <button className="btn-icon" onClick={() => setSelectedUser(u)} title="Lihat Detail"><Eye size={15} /></button>
                                                <button className="btn-icon" onClick={() => openEditModal(u)} title="Edit Pengguna"><Pencil size={15} /></button>
                                                <button className={`btn-icon ${u.status === 'Aktif' ? 'delete' : ''}`} onClick={() => handleToggleStatus(u.slug)} title={u.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}><Ban size={15} /></button>
                                                <button className="btn-icon delete" onClick={() => handleDelete(u.slug)} title="Hapus Permanen"><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create/Edit User Modal */}
                {isFormModalOpen && (
                    <div className="modal-overlay" onClick={closeFormModal}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
                                <button className="btn-icon" onClick={closeFormModal}><X size={20} /></button>
                            </div>
                            <form className="modal-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Nama Lengkap</label>
                                    <input 
                                        type="text" 
                                        value={data.name} 
                                        onChange={e => setData('name', e.target.value)} 
                                        placeholder="Masukkan nama lengkap"
                                        required
                                    />
                                    {errors.name && <span className="text-error" style={{ fontSize: 11 }}>{errors.name}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input 
                                        type="email" 
                                        value={data.email} 
                                        onChange={e => setData('email', e.target.value)} 
                                        placeholder="nama@email.com"
                                        required
                                    />
                                    {errors.email && <span className="text-error" style={{ fontSize: 11 }}>{errors.email}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Password {editingUser && '(Kosongkan jika tidak ingin diubah)'}</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type="password" 
                                            value={data.password} 
                                            onChange={e => setData('password', e.target.value)} 
                                            placeholder="Min. 8 karakter"
                                            required={!editingUser}
                                        />
                                        <Lock size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                    </div>
                                    {errors.password && <span className="text-error" style={{ fontSize: 11 }}>{errors.password}</span>}
                                </div>
                                <div className="form-group">
                                    <label>No. WhatsApp / HP</label>
                                    <input 
                                        type="text" 
                                        value={data.phone} 
                                        onChange={e => setData('phone', e.target.value)} 
                                        placeholder="0812xxxxxxxx"
                                    />
                                    {errors.phone && <span className="text-error" style={{ fontSize: 11 }}>{errors.phone}</span>}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                    <div className="form-group">
                                        <label>Role</label>
                                        <select value={data.role} onChange={e => setData('role', e.target.value)}>
                                            <option value="customer">Customer / Pembeli</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select value={data.status} onChange={e => setData('status', e.target.value)}>
                                            <option value="Aktif">Aktif</option>
                                            <option value="Nonaktif">Nonaktif</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-actions" style={{ marginTop: 'var(--space-4)' }}>
                                    <button type="button" className="btn-modal-cancel" onClick={closeFormModal}>Batal</button>
                                    <button type="submit" className="btn-modal-save" disabled={processing}>
                                        {processing ? 'Menyimpan...' : (editingUser ? 'Simpan Perubahan' : 'Tambahkan Pengguna')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* User Detail Modal */}
                {selectedUser && (
                    <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                        <div className="modal modal-detail" onClick={e => e.stopPropagation()}>
                            <div className="modal-detail-header" style={{ borderColor: 'var(--color-border)' }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '1.5rem', flexShrink: 0 }}>
                                    {selectedUser.name[0]}
                                </div>
                                <div style={{ marginLeft: 'var(--space-4)' }}>
                                    <p className="modal-detail-id">USER-ID: #{selectedUser.id.toString().padStart(4, '0')}</p>
                                    <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{selectedUser.name}</h3>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 4 }}>
                                        <span className={`status-badge ${selectedUser.status === 'Aktif' ? 'success' : 'error'}`} style={{ fontSize: 'var(--text-xs)' }}>
                                            {selectedUser.status}
                                        </span>
                                        <span className="status-badge" style={{ fontSize: 'var(--text-xs)', background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>{selectedUser.role.toUpperCase()}</span>
                                    </div>
                                </div>
                                <button className="btn-icon" onClick={() => setSelectedUser(null)} style={{ marginLeft: 'auto' }}><X size={20} /></button>
                            </div>

                            <div className="modal-detail-body">
                                <div className="detail-section-block">
                                    <div className="detail-section-label"><Mail size={14} /> Informasi Kontak</div>
                                    <div className="detail-grid">
                                        <div style={{ gridColumn: '1 / -1' }}><span>Email</span><strong>{selectedUser.email}</strong></div>
                                        <div><span>No. HP</span><strong>{selectedUser.phone || '-'}</strong></div>
                                        <div><span>Joined</span><strong>{selectedUser.joined}</strong></div>
                                    </div>
                                </div>

                                <div className="detail-section-block">
                                    <div className="detail-section-label"><ShoppingBag size={14} /> Aktivitas Pembelian</div>
                                    <div className="detail-grid">
                                        <div><span>Total Transaksi</span><strong>{selectedUser.purchases} Produk</strong></div>
                                        <div><span>Total Belanja</span><strong style={{ color: 'var(--color-accent-light)' }}>{formatCurrency(selectedUser.totalSpent)}</strong></div>
                                    </div>
                                </div>

                                <div className="detail-section-block">
                                    <div className="detail-section-label"><Shield size={14} /> Keamanan & Akun</div>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                                        Akun ini dalam status <strong>{selectedUser.status}</strong> sebagai peran <strong>{selectedUser.role}</strong>. Terakhir diperbarui pada sistem sinkronisasi.
                                    </p>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button className="btn-modal-cancel" style={{ flex: 1 }} onClick={() => setSelectedUser(null)}>Tutup</button>
                                <button className="btn-modal-save" style={{ flex: 1, background: selectedUser.status === 'Aktif' ? 'var(--color-error)' : 'var(--color-success)' }} onClick={() => handleToggleStatus(selectedUser.slug)}>
                                    {selectedUser.status === 'Aktif' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
