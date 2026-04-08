import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Mail, Phone, MapPin, MessageCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useContent } from '../../Contexts/ContentContext';
import MainLayout from '../../Layouts/MainLayout';
import './Contact.css';

export default function Contact({ previewMode = false }) {
    const { content } = useContent();
    const contact = content?.contact || {};
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success('Pesan berhasil dikirim! Kami akan menghubungi Anda segera.');
        setForm({ name: '', email: '', subject: '', message: '' });
    };

    const Content = (
        <div className="contact-page">
            <Head title="Hubungi Kami - JAGGAD ACADEMY" />
            <div className="contact-header section-dark">
                <div className="container">
                    <p className="section-label">Hubungi Kami</p>
                    <h1 className="contact-title">{contact.title}</h1>
                    <p className="contact-subtitle">{contact.subtitle}</p>
                </div>
            </div>

            <div className="container contact-main">
                <div className="contact-layout">
                    {/* Info */}
                    <div className="contact-info">
                        <h2 className="info-title">Informasi Kontak</h2>
                        <div className="contact-cards">
                            {[
                                { icon: Mail, label: 'Email', value: contact.email, href: `mailto:${contact.email}` },
                                { icon: Phone, label: 'Telepon / WhatsApp', value: contact.phone, href: `https://wa.me/${(contact.phone || '').replace(/[^0-9]/g, '')}` },
                                { icon: MapPin, label: 'Alamat', value: contact.address, href: contact.mapsUrl },
                            ].filter(item => item.value).map(({ icon: Icon, label, value, href }) => {
                                const CardContent = (
                                    <>
                                        <div className="contact-icon"><Icon size={20} /></div>
                                        <div>
                                            <p className="contact-label">{label}</p>
                                            <p className="contact-value">{value}</p>
                                        </div>
                                    </>
                                );

                                if (href) {
                                    return (
                                        <a key={label} href={href} target="_blank" rel="noreferrer" className="contact-info-card contact-info-card--link" title={`Buka ${label}`}>
                                            {CardContent}
                                        </a>
                                    );
                                }

                                return (
                                    <div key={label} className="contact-info-card">
                                        {CardContent}
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                            {(contact.phone) && (
                                <a href={`https://wa.me/${(contact.phone).replace(/[^0-9]/g, '')}`} className="whatsapp-btn" target="_blank" rel="noreferrer">
                                    <MessageCircle size={20} />
                                    Chat di WhatsApp Sekarang
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Form */}
                    <div className="contact-form-wrap">
                        <h2 className="info-title">Kirim Pesan</h2>
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nama Lengkap</label>
                                    <input className="form-input" placeholder="Nama Anda" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input className="form-input" type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Subjek</label>
                                <input className="form-input" placeholder="Tentang apa pesan Anda?" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Pesan</label>
                                <textarea className="form-input form-textarea" rows={5} placeholder="Tuliskan pesan Anda di sini..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
                                <button type="submit" className="btn-hero-primary" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-4)' }}>
                                    <Send size={17} /> Kirim Pesan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );

    if (previewMode) return Content;

    return (
        <MainLayout>
            {Content}
        </MainLayout>
    );
}
