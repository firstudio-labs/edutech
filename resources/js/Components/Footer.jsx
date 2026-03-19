import { Link } from '@inertiajs/react';
import { Instagram, Youtube, Twitter, Mail, Phone, MapPin, ArrowRight, Zap } from 'lucide-react';
import { useContent } from '../Contexts/ContentContext';
import './Footer.css';

const productLinks = [
    { label: 'Ebook Digital', href: route('products', { category: 'ebook' }) },
    { label: 'Video Kelas', href: route('products', { category: 'video' }) },
    { label: 'Webinar Live', href: route('products', { category: 'webinar' }) },
    { label: 'Kelas Offline', href: route('products', { category: 'offline' }) },
];

const companyLinks = [
    { label: 'Tentang Kami', href: route('about') },
    { label: 'Testimoni', href: '#' },
    { label: 'Kontak', href: route('contact') },
];

export default function Footer() {
    const { content } = useContent();
    const contact = content?.contact || {};
    const home = content?.home || {};
    const social = content?.social || {};
    
    const dynamicSocialLinks = [
        { icon: Instagram, href: social.instagram || '#', label: 'Instagram' },
        { icon: Youtube, href: social.youtube || '#', label: 'YouTube' },
        { icon: Twitter, href: social.twitter || '#', label: 'Twitter/X' },
    ];

    const contactItems = [
        { 
            icon: Mail, 
            text: contact.email || 'hello@jaggad.id',
            href: `mailto:${contact.email || 'hello@jaggad.id'}`
        },
        { 
            icon: Phone, 
            text: contact.phone || '+62 812-3456-7890',
            href: `https://wa.me/${(contact.phone || '').replace(/[^0-9]/g, '')}`
        },
        { 
            icon: MapPin, 
            text: contact.address || 'Jakarta Selatan, Indonesia',
            href: contact.mapsUrl || '#'
        },
    ];

    return (
        <footer className="footer">
            <div className="footer__accent-bar" />

            <div className="container">
                <div className="footer__grid">
                    <div className="footer__brand">
                        <Link href="/" className="footer__logo">
                            <span className="footer-logo-jaggad">JAGGAD</span>
                            <span className="footer-logo-academy">Academy</span>
                        </Link>
                        <p className="footer__tagline">
                            {home.whyJaggadSubtitle || "Platform pembelajaran digital terpercaya untuk akselerasi karir dan bisnis Anda di era modern."}
                        </p>

                        <div className="footer__newsletter">
                            <p className="newsletter-label">Dapatkan tips gratis setiap minggu</p>
                            <div className="newsletter-row">
                                <input type="email" placeholder="Email kamu..." className="newsletter-input" />
                                <button className="newsletter-btn"><ArrowRight size={16} /></button>
                            </div>
                        </div>

                        <div className="footer__socials">
                            {dynamicSocialLinks.map(({ icon: Icon, href, label }) => (
                                <a key={label} href={href} className="footer-social" aria-label={label} target="_blank" rel="noreferrer">
                                    <Icon size={17} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="footer__col">
                        <h4 className="footer__col-title">Produk</h4>
                        <ul className="footer__col-links">
                            {productLinks.map(({ label, href }) => (
                                <li key={label}>
                                    <Link href={href}>{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer__col">
                        <h4 className="footer__col-title">Perusahaan</h4>
                        <ul className="footer__col-links">
                            {companyLinks.map(({ label, href }) => (
                                <li key={label}>
                                    <Link href={href}>{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer__col">
                        <h4 className="footer__col-title">Kontak</h4>
                        <ul className="footer__contact-list">
                            {contactItems.map(({ icon: Icon, text, href }) => (
                                <li key={text}>
                                    <a href={href} target={href?.startsWith('http') ? "_blank" : "_self"} rel="noreferrer" className="footer-contact-link footer-contact-item">
                                        <Icon size={14} className="contact-icon" />
                                        <span>{text}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <Link href={route('products')} className="footer__cta-btn">
                            <Zap size={14} /> Mulai Belajar Sekarang
                        </Link>
                    </div>
                </div>

                <div className="footer__bottom">
                    <p>© 2025 JAGGAD ACADEMY. All rights reserved. Made with ❤️ in Indonesia.</p>
                    <div className="footer__legal">
                        <a href="#">Kebijakan Privasi</a>
                        <span className="footer-divider-dot">·</span>
                        <a href="#">Syarat & Ketentuan</a>
                        <span className="footer-divider-dot">·</span>
                        <a href="#">Cookie</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
