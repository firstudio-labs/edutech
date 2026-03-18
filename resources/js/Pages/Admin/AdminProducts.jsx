import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { products as initialProducts } from '../../Data/products';
import { formatPrice, getCategoryLabel, getStorageUrl } from '../../Utils/helpers';
import AdminLayout from '../../Layouts/AdminLayout';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminProducts({ dbProducts = [] }) {
    const [search, setSearch] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const items = dbProducts.map(dbP => ({
        id: dbP.id,
        slug: dbP.slug,
        title: dbP.name,
        category: dbP.category?.name || 'Tidak Ada',
        price: dbP.price,
        sold: dbP.sold_count,
        thumbnail: getStorageUrl(dbP.image)
    }));

    const filtered = items.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

    const openAdd = () => router.get(route('admin.products.create'));
    const openEdit = (p) => router.get(route('admin.products.edit', p.slug || p.id));

    const confirmDelete = (slug) => setDeleteConfirm(slug);
    const handleDelete = () => {
        router.delete(route('admin.products.destroy', deleteConfirm), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteConfirm(null);
                toast.success('Produk dihapus');
            },
            onError: () => toast.error('Gagal menghapus produk')
        });
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Produk - SAGA Academy" />
            <div className="admin-page">
                <div className="admin-page-header">
                    <h1>Manajemen Produk</h1>
                    <p className="admin-page-subtitle">Kelola semua produk yang tersedia di platform</p>
                </div>

                <div className="admin-controls">
                    <div className="admin-search-wrap">
                        <Search size={15} className="admin-search-icon" />
                        <input placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button className="btn-admin-primary" onClick={openAdd}><Plus size={16} /> Tambah Produk</button>
                </div>

                <div className="admin-table-card">
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr><th>Produk</th><th>Kategori</th><th>Harga</th><th>Terjual</th><th>Aksi</th></tr>
                            </thead>
                            <tbody>
                                {filtered.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 48, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--color-bg-secondary)' }}>
                                                    <img src={p.thumbnail} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{p.title}</span>
                                            </div>
                                        </td>
                                        <td><span className="badge-cat">{p.category}</span></td>
                                        <td>{formatPrice(p.price)}</td>
                                        <td>{p.sold}</td>
                                        <td>
                                            <div className="actions-col">
                                                <button className="btn-icon edit" onClick={() => openEdit(p)} title="Edit"><Pencil size={15} /></button>
                                                <button className="btn-icon delete" onClick={() => confirmDelete(p.slug || p.id)} title="Hapus"><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--color-border)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {filtered.length} produk ditampilkan
                    </div>
                </div>

                {/* Delete Confirm */}
                {deleteConfirm && (
                    <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                        <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                            <div className="delete-confirm-icon">🗑️</div>
                            <h3 className="modal-title" style={{ textAlign: 'center' }}>Hapus Produk?</h3>
                            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
                                Tindakan ini tidak dapat dibatalkan. Produk akan dihapus permanen.
                            </p>
                            <div className="modal-actions" style={{ justifyContent: 'center', marginTop: 'var(--space-4)' }}>
                                <button className="btn-modal-cancel" onClick={() => setDeleteConfirm(null)}>Batal</button>
                                <button className="btn-modal-save" style={{ background: 'var(--color-error)' }} onClick={handleDelete}>Ya, Hapus</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
