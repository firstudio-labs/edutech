import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Video, Receipt, User, Download, ExternalLink, Plus } from 'lucide-react';
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

    const myProducts = purchasedProducts.map(p => ({
        id: p.id,
        title: p.name,
        category: p.category?.name || 'Tidak Ada',
        thumbnail: getStorageUrl(p.image),
    }));

    const myTransactions = transactions.map(t => ({
        id: t.transaction_code,
        date: new Date(t.created_at).toLocaleDateString('id-ID'),
        products: t.items?.map(i => i.product?.name).join(', ') || 'Produk',
        amount: t.total_amount,
        status: t.status === 'success' ? 'Berhasil' : t.status === 'pending' ? 'Pending' : 'Gagal'
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
                                            <Link href={route('dashboard.learning', { id: product.id })} className="access-btn">
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}
