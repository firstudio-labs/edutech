import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useCart } from '../Contexts/CartContext';
import Swal from 'sweetalert2';
import './Navbar.css';

export default function Navbar() {
    const { auth } = usePage().props;
    const { count } = useCart();
    const user = auth.user;
    const isAdmin = user && user.role === 'admin';

    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const handleLogout = (e) => {
        if (e) e.preventDefault();
        Swal.fire({
            title: 'Konfirmasi Keluar',
            text: 'Apakah Anda yakin ingin keluar dari halaman sistem?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#4b5563',
            confirmButtonText: 'Ya, Keluar!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('logout'));
            }
        });
    };

    const navLinks = [
        { name: 'home', href: route('home'), label: 'Beranda' },
        { name: 'products', href: route('products'), label: 'Produk' },
        { name: 'about', href: route('about'), label: 'Tentang Kami' },
        { name: 'contact', href: route('contact'), label: 'Kontak' },
    ];

    return (
        <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
            <div className="navbar__inner container">
                <Link href={route('home')} className="navbar__brand">
                    <span className="navbar__logo">SAGA</span>
                    <span className="navbar__tagline">Academy</span>
                </Link>

                <ul className="navbar__links">
                    {navLinks.map(link => (
                        <li key={link.label}>
                            <Link 
                                href={link.href} 
                                className={`navbar__link ${link.name && route().current(link.name) ? 'navbar__link--active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="navbar__actions">
                    {user && (
                        <Link href={route('checkout')} className="navbar__cart">
                            <ShoppingCart size={20} />
                            {count > 0 && <span className="navbar__cart-badge">{count}</span>}
                        </Link>
                    )}

                    {user ? (
                        <div className="navbar__user">
                            <button className="navbar__avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                <div className="avatar-circle">{user.name[0]}</div>
                            </button>
                            {dropdownOpen && (
                                <div className="navbar__dropdown">
                                    <div className="navbar__dropdown-header">
                                        <p className="dropdown-name">{user.name}</p>
                                        <p className="dropdown-email">{user.email}</p>
                                    </div>
                                    <div className="navbar__dropdown-divider" />
                                    {isAdmin ? (
                                        <Link href="/admin" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>
                                            <Shield size={15} /> Dashboard Admin
                                        </Link>
                                    ) : (
                                        <Link href={route('dashboard')} className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>
                                            <LayoutDashboard size={15} /> Dashboard Saya
                                        </Link>
                                    )}
                                    <Link href={route('profile.edit')} className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>
                                        <User size={15} /> Edit Profil
                                    </Link>
                                    <button 
                                        type="button"
                                        className="navbar__dropdown-item navbar__dropdown-item--danger" 
                                        onClick={(e) => {
                                            setDropdownOpen(false);
                                            handleLogout(e);
                                        }}
                                    >
                                        <LogOut size={15} /> Keluar
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="navbar__auth">
                            <Link href={route('login')} className="btn-ghost-sm">Masuk</Link>
                            <Link href={route('register')} className="btn-primary-sm">Daftar</Link>
                        </div>
                    )}

                    <button className="navbar__mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="navbar__mobile">
                    {navLinks.map(link => (
                        <Link 
                            key={link.label} 
                            href={link.href} 
                            className={`navbar__mobile-link ${link.name && route().current(link.name) ? 'active' : ''}`} 
                            onClick={() => setMobileOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {!user && (
                        <div className="navbar__mobile-auth">
                            <Link href={route('login')} className="btn-ghost-sm" onClick={() => setMobileOpen(false)}>Masuk</Link>
                            <Link href={route('register')} className="btn-primary-sm" onClick={() => setMobileOpen(false)}>Daftar</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
