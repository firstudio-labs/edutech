import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, Eye, CheckCircle, XCircle, Clock, Calendar, Download, Filter, User, Package, CreditCard, ChevronRight, ChevronDown } from 'lucide-react';
import { formatPrice, getStorageUrl } from '../../Utils/helpers';
import AdminLayout from '../../Layouts/AdminLayout';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminTransactions({ dbTransactions }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua');
    const [selectedTrx, setSelectedTrx] = useState(null);
    const [showStatusFilter, setShowStatusFilter] = useState(false);
    const statusOptions = ['Semua', 'Berhasil', 'Pending', 'Gagal'];

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
        payment: dbT.payment_type ? dbT.payment_type.toUpperCase() : (dbT.payment?.payment_method?.bank_name || 'Gateway Pembayaran'),
        proof: getStorageUrl(dbT.payment?.proof_image),
        payload: dbT.payment_payload ? JSON.parse(dbT.payment_payload) : null
    }));

    const filtered = transactions.filter(t => {
        const matchSearch = t.customer.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
        const matchFilter = statusFilter === 'Semua' || t.status === statusFilter;
        return matchSearch && matchFilter;
    });

    const handleConfirm = (code) => {
        router.patch(route('admin.transactions.approve', code), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Transaksi berhasil dikonfirmasi`);
                setSelectedTrx(null);
            }
        });
    };

    const handleReject = (code) => {
        router.patch(route('admin.transactions.reject', code), {}, {
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
            <Head title="Riwayat Transaksi - JAGGAD ACADEMY" />
            <div className="admin-page">
                <div className="admin-page-header">
                    <h1>Manajemen Transaksi</h1>
                    <p className="admin-page-subtitle">Monitor semua transaksi yang terjadi di platform</p>
                </div>

                <div className="trx-stats-grid">
                    <div className={`trx-stat-card ${statusFilter === 'Semua' ? 'active' : ''}`} onClick={() => setStatusFilter('Semua')}>
                        <div className="trx-stat-icon total">
                            <CreditCard size={22} />
                        </div>
                        <div className="trx-stat-info">
                            <span className="trx-stat-value">{transactions.length}</span>
                            <span className="trx-stat-label">Total Transaksi</span>
                        </div>
                    </div>
                    
                    <div className={`trx-stat-card ${statusFilter === 'Berhasil' ? 'active' : ''}`} onClick={() => setStatusFilter('Berhasil')}>
                        <div className="trx-stat-icon success">
                            <CheckCircle size={22} />
                        </div>
                        <div className="trx-stat-info">
                            <span className="trx-stat-value">{countBerhasil}</span>
                            <span className="trx-stat-label">Terverifikasi</span>
                        </div>
                    </div>

                    <div className={`trx-stat-card ${statusFilter === 'Pending' ? 'active' : ''}`} onClick={() => setStatusFilter('Pending')}>
                        <div className="trx-stat-icon pending">
                            <Clock size={22} />
                        </div>
                        <div className="trx-stat-info">
                            <span className="trx-stat-value">{countPending}</span>
                            <span className="trx-stat-label">Menunggu</span>
                        </div>
                    </div>

                    <div className={`trx-stat-card ${statusFilter === 'Gagal' ? 'active' : ''}`} onClick={() => setStatusFilter('Gagal')}>
                        <div className="trx-stat-icon failed">
                            <XCircle size={22} />
                        </div>
                        <div className="trx-stat-info">
                            <span className="trx-stat-value">{countGagal}</span>
                            <span className="trx-stat-label">Gagal / Batal</span>
                        </div>
                    </div>
                </div>

                <div className="admin-controls">
                    <div className="admin-search-wrap">
                        <Search size={15} className="admin-search-icon" />
                        <input placeholder="Cari ID atau nama pelanggan..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div className={`custom-dropdown ${showStatusFilter ? 'open' : ''}`}>
                            <div 
                                className="custom-dropdown-trigger" 
                                onClick={() => setShowStatusFilter(!showStatusFilter)}
                            >
                                <span>{statusFilter === 'Semua' ? 'Semua Status' : statusFilter}</span>
                                <ChevronDown size={16} className="custom-dropdown-chevron" />
                            </div>
                            
                            {showStatusFilter && (
                                <div className="custom-dropdown-menu">
                                    {statusOptions.map(opt => (
                                        <div 
                                            key={opt}
                                            className={`custom-dropdown-item ${statusFilter === opt ? 'active' : ''}`}
                                            onClick={() => {
                                                setStatusFilter(opt);
                                                setShowStatusFilter(false);
                                            }}
                                        >
                                            {opt === 'Semua' ? 'Semua Status' : opt}
                                            {statusFilter === opt && <CheckCircle size={14} />}
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                    background: selectedTrx.status === 'Berhasil' ? 'rgba(16, 185, 129, 0.1)' : selectedTrx.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 77, 48, 0.1)',
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

                                    {selectedTrx.payload ? (
                                        <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Midtrans Gateway Info</span>
                                            <div className="detail-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                <div><span style={{ fontSize: '11px' }}>Payment Type</span><strong style={{ fontSize: '12px' }}>{selectedTrx.payload.payment_type?.toUpperCase() || '-'}</strong></div>
                                                <div><span style={{ fontSize: '11px' }}>Midtrans Trx ID</span><strong style={{ fontSize: '10px', fontFamily: 'monospace' }}>{selectedTrx.payload.transaction_id || '-'}</strong></div>
                                                <div><span style={{ fontSize: '11px' }}>Status</span><strong style={{ fontSize: '12px', color: 'var(--color-success)' }}>{selectedTrx.payload.transaction_status?.toUpperCase() || '-'}</strong></div>
                                                <div><span style={{ fontSize: '11px' }}>Waktu Bayar</span><strong style={{ fontSize: '12px' }}>{selectedTrx.payload.settlement_time || selectedTrx.payload.transaction_time || '-'}</strong></div>
                                            </div>
                                            {selectedTrx.payload.va_numbers && (
                                                <div style={{ marginTop: 8, borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                                                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Bank VA</span>
                                                    <div style={{ fontWeight: 600, fontSize: 12 }}>{selectedTrx.payload.va_numbers[0]?.bank?.toUpperCase()}: {selectedTrx.payload.va_numbers[0]?.va_number}</div>
                                                </div>
                                            )}
                                        </div>
                                    ) : selectedTrx.proof ? (
                                        <div style={{ marginTop: 'var(--space-2)' }}>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-2)' }}>Bukti Pembayaran Manual:</span>
                                            <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(255, 77, 48, 0.05) 0%, transparent 70%)' }}>
                                                    <img src={selectedTrx.proof} alt="Proof" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                </div>
                                                <div style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.02)', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
                                                    <a href={selectedTrx.proof} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>Lihat Gambar Penuh</a>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: 'var(--space-2)' }}>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-2)' }}>Bukti Pembayaran:</span>
                                            <div style={{ padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', borderRadius: '4px', color: 'var(--color-text-muted)', fontSize: 12, textAlign: 'center', border: '1px dashed var(--color-border)' }}>
                                                Menunggu pembayaran otomatis via Midtrans
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedTrx.status === 'Pending' && (
                                <div className="modal-actions" style={{ padding: 'var(--space-5) var(--space-6)', background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)' }}>
                                    <button className="btn-modal-cancel" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)', background: 'transparent' }} onClick={() => handleReject(selectedTrx.id)}>Tolak Transaksi</button>
                                    <button className="btn-modal-save" style={{ background: 'var(--color-success)' }} onClick={() => handleConfirm(selectedTrx.id)}>Konfirmasi Pembayaran</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
