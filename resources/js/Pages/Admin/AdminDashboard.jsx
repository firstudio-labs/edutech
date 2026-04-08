import AdminLayout from '../../Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { LayoutDashboard, Package, Receipt, Users, TrendingUp, ArrowUp, Eye, ShoppingBag, DollarSign, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency } from '../../Utils/helpers';
import './Admin.css';

const formatJt = (v) => {
    if (v >= 1000000) return `Rp ${(v / 1000000).toFixed(1)}jt`;
    if (v >= 1000) return `Rp ${(v / 1000).toFixed(1)}k`;
    return `Rp ${v}`;
};

const formatChange = (val, isPerc = true) => {
    if (val > 0) return `↑ +${val}${isPerc ? '%' : ''} dari bulan lalu`;
    if (val < 0) return `↓ ${val}${isPerc ? '%' : ''} dari bulan lalu`;
    return `Stabil dari bulan lalu`;
};

export default function AdminDashboard({ stats = {}, recentTransactions = [], salesData = [] }) {
    const dashboardStats = [
        { icon: Receipt, label: 'Total Transaksi', value: stats.sales || 0, changeVal: stats.sales_change || 0, isPerc: true },
        { icon: TrendingUp, label: 'Pendapatan Bulan Ini', value: formatJt(stats.revenue || 0), changeVal: stats.revenue_change || 0, isPerc: true },
        { icon: Users, label: 'Pengguna Terdaftar', value: stats.users || 0, changeVal: stats.users_change || 0, isPerc: true },
        { icon: Package, label: 'Produk Aktif', value: stats.active_products || 0, changeVal: stats.products_change || 0, isPerc: true },
    ];

    const recentOrders = recentTransactions.map(dbT => ({
        id: dbT.transaction_code,
        customer: dbT.user?.name || 'Unknown',
        product: dbT.items?.map(i => i.product?.name).join(', ') || 'Produk',
        amount: dbT.total_amount,
        status: dbT.status === 'success' ? 'Berhasil' : (dbT.status === 'failed' ? 'Gagal' : 'Pending'),
        date: new Date(dbT.created_at).toLocaleDateString('id-ID'),
    }));

    return (
        <AdminLayout>
            <Head title="Admin Dashboard - JAGGAD ACADEMY" />
            <div className="admin-page">
                <div className="admin-page-header">
                    <h1>Dashboard</h1>
                    <p className="admin-page-subtitle">Ringkasan aktivitas platform JAGGAD ACADEMY</p>
                </div>

                {/* Stats */}
                <div className="admin-stats-grid" style={{ gap: '20px' }}>
                    {dashboardStats.map(({ icon: Icon, label, value, changeVal, isPerc }) => (
                        <div key={label} className="admin-stat-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '24px', background: 'var(--color-bg-card)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                            <div className="admin-stat-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-light)', marginRight: '16px', flexShrink: 0 }}>
                                <Icon size={20} strokeWidth={1.5} />
                            </div>
                            <div className="admin-stat-body" style={{ display: 'flex', flexDirection: 'column' }}>
                                <p className="admin-stat-label" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px', fontWeight: 500 }}>{label}</p>
                                <p className="admin-stat-value" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.5px', marginBottom: '4px', lineHeight: 1 }}>{value}</p>
                                <p className="admin-stat-change" style={{ fontSize: '11px', color: changeVal > 0 ? 'var(--color-success)' : (changeVal < 0 ? 'var(--color-error)' : 'var(--color-text-muted)'), fontWeight: 500, margin: 0 }}>
                                    {formatChange(changeVal, isPerc)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="admin-charts-grid">
                    <div className="admin-chart-card">
                        <h3 className="admin-chart-title">Pendapatan Bulanan</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="month" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                                <YAxis tickFormatter={formatJt} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                                <Tooltip formatter={(v) => [`Rp${v.toLocaleString('id-ID')}`, 'Pendapatan']} contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '10px' }} />
                                <Area type="monotone" dataKey="revenue" stroke="var(--color-accent)" fill="url(#colorRevenue)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="admin-chart-card">
                        <h3 className="admin-chart-title">Pesanan per Bulan</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="month" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                                <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                                <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '10px' }} />
                                <Bar dataKey="orders" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="admin-table-card">
                    <div className="admin-table-header">
                        <h3>Transaksi Terbaru</h3>
                        <Link href={route('admin.transactions.index')} className="see-all-link" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent-light)' }}>Lihat Semua</Link>
                    </div>
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr><th>ID</th><th>Pelanggan</th><th>Produk</th><th>Total</th><th>Status</th><th>Tanggal</th></tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(o => (
                                    <tr key={o.id}>
                                        <td className="trx-id">{o.id}</td>
                                        <td>{o.customer}</td>
                                        <td>{o.product}</td>
                                        <td>Rp{o.amount.toLocaleString('id-ID')}</td>
                                        <td>
                                            <span className={`status-badge ${o.status === 'Berhasil' ? 'success' : o.status === 'Pending' ? 'warning' : 'error'}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="text-muted">{o.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
