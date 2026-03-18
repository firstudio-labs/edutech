import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Search, Pencil, Trash2, X, FolderMinus, Upload, Image as ImageIcon } from 'lucide-react';
import { getStorageUrl } from '../../Utils/helpers';
import AdminLayout from '../../Layouts/AdminLayout';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminCategories({ dbCategories = [] }) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    
    const { data: form, setData: setForm, post, processing, reset, errors } = useForm({
        _method: 'POST',
        id: '',
        label: '',
        imageFile: null,
        imagePreview: ''
    });

    const items = dbCategories.map(db => ({
        dbId: db.id,
        id: db.slug,
        label: db.name,
        count: db.products_count || 0,
        image: db.image
    }));

    const filtered = items.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));

    const openAdd = () => {
        setEditingItem(null);
        reset();
        setForm(prev => ({ ...prev, _method: 'POST' }));
        setIsModalOpen(true);
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setForm({
            _method: 'PUT',
            id: item.id,
            label: item.label,
            imageFile: null,
            imagePreview: getStorageUrl(item.image)
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!form.id || !form.label) return toast.error('Lengkapi semua data');

        if (editingItem) {
            post(route('admin.categories.update', editingItem.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Kategori diperbarui');
                    setIsModalOpen(false);
                },
                onError: (e) => toast.error(Object.values(e)[0] || 'Gagal memperbarui kategori')
            });
        } else {
            post(route('admin.categories.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Kategori baru ditambahkan');
                    setIsModalOpen(false);
                },
                onError: (e) => toast.error(Object.values(e)[0] || 'Gagal menambahkan kategori')
            });
        }
    };

    const handleDelete = (slug) => {
        if (confirm('Yakin ingin menghapus kategori ini?')) {
            router.delete(route('admin.categories.destroy', slug), {
                preserveScroll: true,
                onSuccess: () => toast.success('Kategori dihapus'),
                onError: (e) => toast.error(e.message || 'Gagal menghapus kategori')
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Kategori Produk - SAGA Academy" />
            <div className="admin-page">
                <div className="admin-page-header">
                    <h1>Kategori Produk</h1>
                    <p className="admin-page-subtitle">Kelola kategori untuk mengelompokkan produk Anda</p>
                </div>

                <div className="admin-controls">
                    <div className="admin-search-wrap">
                        <Search size={15} className="admin-search-icon" />
                        <input placeholder="Cari kategori..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button className="btn-admin-primary" onClick={openAdd}><Plus size={16} /> Tambah Kategori</button>
                </div>

                <div className="admin-table-card">
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr><th>ID Kategori</th><th>Nama Kategori</th><th>Jumlah Produk</th><th>Aksi</th></tr>
                            </thead>
                            <tbody>
                                {filtered.length > 0 ? filtered.map(c => (
                                    <tr key={c.id}>
                                        <td className="trx-id">{c.id}</td>
                                        <td style={{ fontWeight: 500 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 40, height: 30, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--color-bg-secondary)' }}>
                                                    {c.image ? <img src={getStorageUrl(c.image)} alt={c.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}><ImageIcon size={14} /></div>}
                                                </div>
                                                {c.label}
                                            </div>
                                        </td>
                                        <td>{c.count}</td>
                                        <td>
                                            <div className="actions-col">
                                                <button className="btn-icon edit" onClick={() => openEdit(c)}><Pencil size={15} /></button>
                                                <button className="btn-icon delete" onClick={() => handleDelete(c.id)}><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>
                                            <FolderMinus size={40} style={{ margin: '0 auto var(--space-3)', opacity: 0.2 }} />
                                            <p>Tidak ada kategori ditemukan</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{editingItem ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
                                <button className="btn-icon" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                            </div>
                            <div className="modal-form">
                                <div className="form-group">
                                    <label>ID Kategori (Slug)</label>
                                    <input
                                        value={form.id}
                                        onChange={e => setForm({ ...form, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        placeholder="contoh: ebook-ads"
                                        disabled={!!editingItem}
                                    />
                                    <small style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>ID digunakan dalam URL dan tidak bisa diubah setelah dibuat.</small>
                                </div>
                                <div className="form-group">
                                    <label>Nama Tampilan</label>
                                    <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Masukkan nama kategori" />
                                </div>

                                <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                                    <label>Gambar Ikon / Cover</label>
                                    <div 
                                        className="image-upload-zone small" 
                                        onClick={() => document.getElementById('cat-image-file').click()}
                                    >
                                        {form.imagePreview ? (
                                            <div className="image-preview-wrap">
                                                <img src={form.imagePreview} alt="Preview" className="image-preview" />
                                                <button type="button" className="image-remove-btn" onClick={e => { e.stopPropagation(); setForm(prev => ({ ...prev, imageFile: null, imagePreview: '' })); }}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="upload-placeholder">
                                                <Upload size={20} />
                                                <p style={{ fontSize: '11px' }}>Klik untuk upload gambar</p>
                                            </div>
                                        )}
                                        <input 
                                            id="cat-image-file"
                                            type="file" 
                                            accept="image/*" 
                                            style={{ display: 'none' }} 
                                            onChange={e => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setForm(prev => ({ 
                                                        ...prev, 
                                                        imageFile: file, 
                                                        imagePreview: URL.createObjectURL(file) 
                                                    }));
                                                }
                                            }} 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-modal-cancel" onClick={() => setIsModalOpen(false)}>Batal</button>
                                <button className="btn-modal-save" onClick={handleSave}>Simpan Kategori</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
