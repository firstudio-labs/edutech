import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Video, Receipt, User, Download, ExternalLink, Plus, Eye, XCircle, CheckCircle, Clock, Package, CreditCard } from 'lucide-react';
import { products } from '../../Data/products';
import { packages } from '../../Data/packages';
import { formatCurrency, getCategoryLabel, getStorageUrl } from '../../Utils/helpers';
import MainLayout from '../../Layouts/MainLayout';
import './User.css';

const transactions = [
    { id: 'TRX-001', date: '2025-01-15', products: 'Ebook: Strategi Bisnis Digital 2024', amount: 149000, status: 'Berhasil' },
    { id: 'TRX-002', date: '2025-01-22', products: 'Video Kelas: Instagram Marketing Mastery', amount: 299000, status: 'Berhasil' },
    { id: 'TRX-003', date: '2025-02-05', products: 'Growth Pack', amount: 799000, status: 'Berhasil' },
    { id: 'TRX-087', date: '2025-02-27', products: 'Ebook: SEO Mastery 2024', amount: 129000, status: 'Pending' },
    { id: 'TRX-085', date: '2025-02-26', products: 'Webinar: Financial Planning', amount: 99000, status: 'Gagal' },
];

export default function UserDashboard({ auth, purchasedProducts = [], transactions = [] }) {
    const user = auth.user;
    const [selectedTrx, setSelectedTrx] = useState(null);

    const myProducts = purchasedProducts.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.name,
        category: p.category?.name || 'Tidak Ada',
        thumbnail: getStorageUrl(p.image),
    }));

    const myTransactions = transactions.map(t => ({
        id: t.transaction_code,
        date: new Date(t.created_at).toLocaleDateString('id-ID'),
        products: t.items?.map(i => i.product?.name).join(', ') || 'Produk',
        amount: t.total_amount,
        status: t.status === 'success' ? 'Berhasil' : t.status === 'pending' ? 'Pending' : 'Gagal',
        proof: getStorageUrl(t.payment?.proof_image),
        bank: t.payment?.payment_method?.bank_name || 'Transfer Bank',
    }));

    return (
        <MainLayout>
            <Head title="Dashboard - SAGA Academy" />
            <div className="user-dashboard">
                {/* Header */}
                <div className="dashboard-header">
                    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="dashboard-welcome">
                            <div className="welcome-avatar">{user?.name?.[0] || 'U'}</div>
                            <div>
                                <h1>Selamat Datang, <span className="text-gradient">{user?.name}</span>!</h1>
                                <p>Lanjutkan perjalanan belajar Anda hari ini.</p>
                            </div>
                        </div>
                        <Link href={route('profile.edit')} className="btn-edit-profile" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600 }}>
                            <User size={16} /> Edit Profil
                        </Link>
                    </div>
                </div>

                <div className="container dashboard-main">
                    {/* Stats */}
                    <div className="dashboard-stats">
                        {[
                            { icon: BookOpen, label: 'Produk Dibeli', value: myProducts.length },
                            { icon: Receipt, label: 'Total Transaksi', value: myTransactions.length },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="stat-card">
                                <div className="stat-icon"><Icon size={20} /></div>
                                <div>
                                    <p className="stat-value">{value}</p>
                                    <p className="stat-label">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* My Products */}
                    <div className="dashboard-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                            <h2 className="section-heading" style={{ margin: 0 }}>Produk Saya</h2>
                            <Link href={route('products')} className="btn-explore-products">
                                <Plus size={16} /> Tambah Produk
                            </Link>
                        </div>
                        <div className="my-products-grid">
                            {myProducts.length > 0 ? myProducts.map(product => (
                                <div key={product.id} className="my-product-card">
                                    <img src={product.thumbnail} alt={product.title} />
                                    <div className="my-product-info">
                                        <p className="my-product-cat">{product.category}</p>
                                        <h3 className="my-product-title" style={{ height: '40px', overflow: 'hidden' }}>{product.title}</h3>
                                        <div className="my-product-actions">
                                            <Link href={route('dashboard.learning', product.slug || product.id)} className="access-btn">
                                                <ExternalLink size={14} /> Buka Materi
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ gridColumn: '1 / -1', padding: 'var(--space-10)', textAlign: 'center', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--color-border)' }}>
                                    <BookOpen size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                                    <p style={{ color: 'var(--color-text-muted)' }}>Anda belum memiliki produk digital.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transactions */}
                    <div className="dashboard-section">
                        <h2 className="section-heading">Riwayat Transaksi</h2>
                        <div className="transactions-table-wrap">
                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th>ID Transaksi</th>
                                        <th>Tanggal</th>
                                        <th>Produk</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Detail</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myTransactions.map(t => (
                                        <tr key={t.id}>
                                            <td className="trx-id">{t.id}</td>
                                            <td>{t.date}</td>
                                            <td>{t.products}</td>
                                            <td>{formatCurrency(t.amount)}</td>
                                            <td>
                                                <span className={`status-badge ${t.status === 'Berhasil' ? 'success' : t.status === 'Pending' ? 'warning' : 'error'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button onClick={() => setSelectedTrx(t)} style={{ background: 'none', border: 'none', color: 'var(--color-accent-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                                                    <Eye size={14} /> Lihat
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Transaction Detail Modal */}
                    {selectedTrx && (
                        <div className="modal-overlay" onClick={() => setSelectedTrx(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                            <div className="modal-detail" onClick={e => e.stopPropagation()} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 20, width: '100%', maxWidth: 500, overflow: 'hidden', animation: 'fadeIn 0.2s ease' }}>
                                <div className="modal-detail-header" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
                                    <div className={`status-icon-box ${selectedTrx.status === 'Berhasil' ? 'success' : selectedTrx.status === 'Pending' ? 'warning' : 'error'}`} style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}>
                                        {selectedTrx.status === 'Berhasil' ? <CheckCircle size={24} color="#10b981" /> : selectedTrx.status === 'Pending' ? <Clock size={24} color="#f59e0b" /> : <XCircle size={24} color="#ef4444" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: 16 }}>{selectedTrx.id}</div>
                                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{selectedTrx.date} • {selectedTrx.status}</div>
                                    </div>
                                    <button onClick={() => setSelectedTrx(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><XCircle size={20} /></button>
                                </div>

                                <div className="modal-detail-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 'bold', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                                            <Package size={13} /> Item Pembelian
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600, fontSize: 14 }}>{selectedTrx.products}</span>
                                            <span style={{ fontWeight: 'bold', color: 'var(--color-accent-light)' }}>{formatCurrency(selectedTrx.amount)}</span>
                                        </div>
                                    </div>

                                    <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 'bold', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                                            <CreditCard size={13} /> Informasi Pembayaran
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <div>
                                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>Metode</div>
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedTrx.bank}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>Total Bayar</div>
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(selectedTrx.amount)}</div>
                                            </div>
                                        </div>

                                        {selectedTrx.proof && (
                                            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8 }}>Bukti Pembayaran:</div>
                                                <div style={{ background: '#000', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <div style={{ width: '100%', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(220, 38, 38, 0.05) 0%, transparent 70%)' }}>
                                                        <img src={selectedTrx.proof} alt="Bukti Bayar" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                    </div>
                                                    <div style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                                        <a href={selectedTrx.proof} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--color-accent-light)', textDecoration: 'none', fontWeight: 600 }}>Klik untuk Perbesar Gambar</a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ padding: '16px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--color-border)' }}>
                                    <button onClick={() => setSelectedTrx(null)} style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'var(--color-border)', border: 'none', color: 'var(--color-text-primary)', fontWeight: 600, cursor: 'pointer' }}>Tutup</button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </MainLayout>
    );
}
