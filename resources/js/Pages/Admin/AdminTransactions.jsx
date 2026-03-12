import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, Eye, CheckCircle, XCircle, Clock, Calendar, Download, Filter, User, Package, CreditCard, ChevronRight, ChevronDown } from 'lucide-react';
import { formatPrice, getStorageUrl } from '../../Utils/helpers';
import AdminLayout from '../../Layouts/AdminLayout';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminTransactions({ dbTransactions }) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('Semua');
    const [selectedTrx, setSelectedTrx] = useState(null);

    const rawTransactions = dbTransactions?.data || [];
    
    const transactions = rawTransactions.map(dbT => ({
        id: dbT.transaction_code,
        dbId: dbT.id,
        customer: dbT.user?.name || 'Hapus',
        email: dbT.user?.email || '',
        product: dbT.items?.map(i => i.product?.name).join(', ') || 'Produk',
        amount: dbT.total_amount,
        status: dbT.status === 'success' ? 'Berhasil' : (dbT.status === 'failed' ? 'Gagal' : 'Pending'),
        rawStatus: dbT.status,
        date: new Date(dbT.created_at).toLocaleDateString('id-ID'),
        payment: dbT.payment?.payment_method?.bank_name || 'Pindah Saldo/Gateway',
        proof: getStorageUrl(dbT.payment?.proof_image)
    }));

    const filtered = transactions.filter(t => {
        const matchSearch = t.customer.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'Semua' || t.status === filter;
        return matchSearch && matchFilter;
    });

    const handleConfirm = (dbId) => {
        router.patch(route('admin.transactions.approve', dbId), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Transaksi berhasil dikonfirmasi`);
                setSelectedTrx(null);
            }
        });
    };

    const handleReject = (dbId) => {
        router.patch(route('admin.transactions.reject', dbId), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.error(`Transaksi ditolak`);
                setSelectedTrx(null);
            }
        });
    };

    const countBerhasil = transactions.filter(t => t.status === 'Berhasil').length;
    const countPending = transactions.filter(t => t.status === 'Pending').length;
    const countGagal = transactions.filter(t => t.status === 'Gagal').length;

    return (
        <AdminLayout>
            <Head title="Riwayat Transaksi - SAGA Academy" />
            <div className="admin-page">
                <div className="admin-page-header">
                    <h1>Manajemen Transaksi</h1>
                    <p className="admin-page-subtitle">Monitor semua transaksi yang terjadi di platform</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px 16px', borderRadius: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'var(--color-text-muted)' }}>
                        <strong style={{ color: '#ef4444' }}>{transactions.length}</strong> Total
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '6px 16px', borderRadius: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(16, 185, 129, 0.1)', color: 'var(--color-text-muted)' }}>
                        <strong style={{ color: '#10b981' }}>{countBerhasil}</strong> Berhasil
                    </div>
                    <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '6px 16px', borderRadius: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(245, 158, 11, 0.1)', color: 'var(--color-text-muted)' }}>
                        <strong style={{ color: '#f59e0b' }}>{countPending}</strong> Pending
                    </div>
                    <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '6px 16px', borderRadius: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(239, 68, 68, 0.1)', color: 'var(--color-text-muted)' }}>
                        <strong style={{ color: '#ef4444' }}>{countGagal}</strong> Gagal
                    </div>
                </div>

                <div className="admin-controls">
                    <div className="admin-search-wrap">
                        <Search size={15} className="admin-search-icon" />
                        <input placeholder="Cari ID atau nama pelanggan..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: 150 }}>
                            <select 
                                className="form-input" 
                                style={{ width: '100%', padding: '8px 32px 8px 16px', fontSize: 13, appearance: 'none', borderRadius: '24px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text)', cursor: 'pointer' }} 
                                value={filter} 
                                onChange={e => setFilter(e.target.value)}
                            >
                                <option value="Semua">Semua Status</option>
                                <option value="Berhasil">Berhasil</option>
                                <option value="Pending">Pending</option>
                                <option value="Gagal">Gagal</option>
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-muted)' }} />
                        </div>
                        <button 
                            className="pulse-anim" 
                            style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}
                            onClick={() => window.location.href = route('admin.transactions.export')}
                        >
                            <Download size={15} /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="admin-table-card">
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr><th>ID</th><th>Pelanggan</th><th>Produk</th><th>Total</th><th>Status</th><th>Aksi</th></tr>
                            </thead>
                            <tbody>
                                {filtered.map(t => (
                                    <tr key={t.id}>
                                        <td className="trx-id">{t.id}</td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{t.customer}</div>
                                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{t.date}</div>
                                        </td>
                                        <td>{t.product}</td>
                                        <td>{formatPrice(t.amount)}</td>
                                        <td>
                                            <span className={`status-badge ${t.status === 'Berhasil' ? 'success' : t.status === 'Pending' ? 'warning' : 'error'}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-col">
                                                <button className="btn-show" onClick={() => setSelectedTrx(t)}>Detail <Eye size={12} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Transaction Detail Modal */}
                {selectedTrx && (
                    <div className="modal-overlay" onClick={() => setSelectedTrx(null)}>
                        <div className="modal modal-detail" onClick={e => e.stopPropagation()}>
                            <div className="modal-detail-header">
                                <div className={`modal-detail-status-icon ${selectedTrx.status === 'Berhasil' ? 'success' : selectedTrx.status === 'Pending' ? 'warning' : 'error'}`} style={{
                                    background: selectedTrx.status === 'Berhasil' ? 'rgba(16, 185, 129, 0.1)' : selectedTrx.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: selectedTrx.status === 'Berhasil' ? 'var(--color-success)' : selectedTrx.status === 'Pending' ? 'var(--color-warning)' : 'var(--color-error)'
                                }}>
                                    {selectedTrx.status === 'Berhasil' ? <CheckCircle size={24} /> : selectedTrx.status === 'Pending' ? <Clock size={24} /> : <XCircle size={24} />}
                                </div>
                                <div>
                                    <div className="modal-detail-id">{selectedTrx.id}</div>
                                    <div className="modal-detail-date">{selectedTrx.date} • {selectedTrx.status}</div>
                                </div>
                                <button className="btn-icon" style={{ marginLeft: 'auto' }} onClick={() => setSelectedTrx(null)}><XCircle size={20} /></button>
                            </div>

                            <div className="modal-detail-body">
                                <div className="detail-section-block">
                                    <div className="detail-section-label"><User size={13} /> Informasi Pelanggan</div>
                                    <div className="detail-grid">
                                        <div><span>Nama Lengkap</span><strong>{selectedTrx.customer}</strong></div>
                                        <div><span>Email</span><strong>{selectedTrx.email}</strong></div>
                                    </div>
                                </div>

                                <div className="detail-section-block">
                                    <div className="detail-section-label"><Package size={13} /> Item Pembelian</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <strong>{selectedTrx.product}</strong>
                                        <strong style={{ color: 'var(--color-accent-light)' }}>{formatPrice(selectedTrx.amount)}</strong>
                                    </div>
                                </div>

                                <div className="detail-section-block">
                                    <div className="detail-section-label"><CreditCard size={13} /> Pembayaran</div>
                                    <div className="detail-grid">
                                        <div><span>Metode</span><strong>{selectedTrx.payment}</strong></div>
                                        <div><span>Jumlah Bayar</span><strong>{formatPrice(selectedTrx.amount)}</strong></div>
                                    </div>

                                    {selectedTrx.proof ? (
                                        <div style={{ marginTop: 'var(--space-2)' }}>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-2)' }}>Bukti Pembayaran:</span>
                                            <div style={{ background: '#000', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(220, 38, 38, 0.05) 0%, transparent 70%)' }}>
                                                    <img src={selectedTrx.proof} alt="Proof" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                </div>
                                                <div style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                                    <a href={selectedTrx.proof} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--color-accent-light)', textDecoration: 'none', fontWeight: 600 }}>Klik untuk Lihat Gambar Penuh</a>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: 'var(--space-2)' }}>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-2)' }}>Bukti Pembayaran:</span>
                                            <div style={{ padding: 'var(--space-3)', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '4px', color: 'var(--color-error)', fontSize: 12, textAlign: 'center' }}>
                                                Bukti belum diunggah atau tidak diperlukan
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedTrx.status === 'Pending' && (
                                <div className="modal-actions" style={{ padding: 'var(--space-5) var(--space-6)', background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)' }}>
                                    <button className="btn-modal-cancel" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)', background: 'transparent' }} onClick={() => handleReject(selectedTrx.dbId)}>Tolak Transaksi</button>
                                    <button className="btn-modal-save" style={{ background: 'var(--color-success)' }} onClick={() => handleConfirm(selectedTrx.dbId)}>Konfirmasi Pembayaran</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
