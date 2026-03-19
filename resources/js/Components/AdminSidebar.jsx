import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard, Package, FileBox, Receipt, Users,
    MessageSquare, FileEdit, CreditCard, Bot, LogOut, ChevronRight, Menu, Megaphone, Settings
} from 'lucide-react';
import Swal from 'sweetalert2';
import './AdminSidebar.css';

const menuItems = [
    { href: route('admin.dashboard'), icon: LayoutDashboard, label: 'Dashboard' },
    { href: route('admin.products.index'), icon: Package, label: 'Produk' },
    { href: route('admin.categories.index'), icon: FileBox, label: 'Kategori' },
    { href: route('admin.transactions.index'), icon: Receipt, label: 'Transaksi' },
    { href: route('admin.users.index'), icon: Users, label: 'Pengguna' },
    { href: route('admin.testimonials.index'), icon: MessageSquare, label: 'Testimoni (Soon)' },
    { href: route('admin.content.index'), icon: FileEdit, label: 'Konten' },
    { href: route('admin.ads.index'), icon: Megaphone, label: 'Ads Page' },
    { href: route('admin.payment.index'), icon: CreditCard, label: 'Pembayaran' },
    { href: route('admin.chatbot.index'), icon: Bot, label: 'Chatbot AI' },
    { href: route('admin.settings.index'), icon: Settings, label: 'Settings' },
];

export default function AdminSidebar({ isCollapsed, toggleSidebar }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const isActive = (href) => {
        return window.location.href === href;
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Konfirmasi Keluar',
            text: 'Apakah Anda yakin ingin keluar dari halaman sistem?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#4b5563',
            confirmButtonText: 'Ya, Keluar!',
            cancelButtonText: 'Batal',
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text)',
            customClass: {
                popup: 'swal2-dark-popup'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('logout'));
            }
        });
    };

    return (
        <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="admin-sidebar__header">
                <Link href="/" className="admin-sidebar__brand">
                    <span className="brand-logo">JAGGAD</span>
                    {!isCollapsed && <span className="brand-sub">Admin</span>}
                </Link>
                <button className="admin-sidebar__toggle" onClick={toggleSidebar}>
                    <Menu size={20} />
                </button>
            </div>

            <nav className="admin-sidebar__nav">
                {!isCollapsed && <p className="admin-sidebar__section-label">Menu Utama</p>}
                {menuItems.map(({ href, icon: Icon, label }) => (
                    <Link
                        key={label}
                        href={href}
                        className={`admin-sidebar__link ${isActive(href) ? 'active' : ''}`}
                        title={isCollapsed ? label : undefined}
                    >
                        <Icon size={18} />
                        {!isCollapsed && <span>{label}</span>}
                        {!isCollapsed && <ChevronRight size={14} className="chevron" />}
                    </Link>
                ))}
            </nav>

            <div className="admin-sidebar__footer">
                <div className="admin-sidebar__user">
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="user-avatar" style={{ objectCover: 'cover' }} />
                    ) : (
                        <div className="user-avatar">{user?.name?.[0] || 'A'}</div>
                    )}
                    {!isCollapsed && (
                        <div className="user-info">
                            <p className="user-name">{user?.name || 'Admin'}</p>
                            <p className="user-role">Administrator</p>
                        </div>
                    )}
                </div>
                {!isCollapsed && (
                    <button 
                        onClick={handleLogout}
                        className="admin-sidebar__logout" 
                        title="Keluar"
                    >
                        <LogOut size={16} />
                    </button>
                )}
            </div>
        </aside>
    );
}
