import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Star, Check, ArrowLeft, ExternalLink, Link as LinkIcon, Download, PlayCircle, FileText } from 'lucide-react';
import { products } from '../../Data/products';
import { getCategoryLabel, getStorageUrl } from '../../Utils/helpers';
import toast from 'react-hot-toast';
import MainLayout from '../../Layouts/MainLayout';
import '../Guest/ProductDetail.css'; // Reusing the exact same ProductDetail CSS
import './UserLearning.css';

export default function UserLearning({ id, product: dbProduct }) {
    const rawProduct = dbProduct || products.find(p => p.id === Number(id));

    if (!rawProduct) {
        toast.error('Produk tidak ditemukan');
        router.visit(route('dashboard'));
        return null;
    }

    const parseList = (data) => typeof data === 'string' ? JSON.parse(data) : (data || []);
    const product = {
        ...rawProduct,
        title: rawProduct.name || rawProduct.title,
        description: rawProduct.short_description || rawProduct.description,
        longDescription: rawProduct.description || rawProduct.longDescription,
        thumbnail: getStorageUrl(rawProduct.image || rawProduct.thumbnail),
        category: rawProduct.category?.slug || rawProduct.category || 'ebook',
        benefits: parseList(rawProduct.benefits),
        materials: parseList(rawProduct.materials)
    };

    const materials = product.materials && product.materials.length > 0 ? product.materials : [
        { title: 'Grup Komunitas Premium', duration: 'Akses Selamanya', link: 'https://t.me/jaggad_community_dummy' },
        { title: 'Link Download Modul PDF', duration: '12 MB', link: 'https://gdrive.link/dummy_modul' },
        { title: 'Rekaman Webinar Sesi 1', duration: '1h 45m', link: 'https://youtube.com/dummy_video_1' },
    ];

    const handleOpenLink = (m) => {
        if (m.link) {
            window.open(m.link, '_blank', 'noopener,noreferrer');
        } else {
            toast.error('Link materi belum tersedia.');
        }
    };

    return (
        <MainLayout>
            <Head title={`Belajar: ${product.title} - JAGGAD ACADEMY`} />
            <div className="product-detail">
                <div className="container product-detail__inner" style={{ paddingBottom: 'var(--space-10)' }}>
                    <Link href={route('dashboard')} className="back-link"><ArrowLeft size={16} /> Kembali ke Dashboard</Link>
    
                    <div className="product-detail__layout">
                        {/* Left - Main Content */}
                        <div className="product-detail__main">
                            <div className="product-detail__hero-img">
                                <img src={product.thumbnail} alt={product.title} />
                                {product.badge && <span className="detail-badge">{product.badge}</span>}
                            </div>
    
                            <div className="detail-section">
                                <h2 className="detail-section-title">Deskripsi Produk</h2>
                                <p className="detail-desc" style={{ whiteSpace: 'pre-wrap' }}>{product.longDescription || product.description}</p>
                            </div>
    
                            <div className="detail-section">
                                <h2 className="detail-section-title">Apa yang Akan Anda Dapatkan</h2>
                                <div className="benefits-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                                    {(product.benefits || []).map((b, i) => (
                                        <div key={i} className="benefit-item" style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className="benefit-check" style={{ background: 'var(--color-success)', color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{b}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
    
                            <div className="detail-section">
                                <h2 className="detail-section-title">Isi Materi Pembelajaran</h2>
                                <p className="detail-desc" style={{ marginBottom: 'var(--space-4)' }}>Klik pada modul materi di bawah ini untuk langsung mengakses materi.</p>
    
                                <div className="materials-list">
                                    {materials.map((m, i) => (
                                        <div
                                            key={i}
                                            className="material-item-box"
                                            onClick={() => handleOpenLink(m)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="material-title-row">
                                                <span className="material-num">{String(i + 1).padStart(2, '0')}</span>
                                                {m.link?.includes('youtube') ? <PlayCircle size={16} color="var(--color-accent)" /> : <FileText size={16} color="var(--color-accent)" />}
                                                {m.title}
                                            </div>
                                            <div className="material-meta-row">
                                                <span className="material-meta">
                                                    {m.duration || 'Akses Materi'}
                                                </span>
                                                <ExternalLink size={16} color="var(--color-text-muted)" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
    
                        {/* Right - Sidebar */}
                        <div className="product-detail__sidebar">
                            <div className="detail-card">
                                <div className="detail-card__category">
                                    <span>{getCategoryLabel(product.category)}</span>
                                </div>
                                <h1 className="detail-card__title">{product.title}</h1>
    
                                <div className="detail-card__meta" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '12px 0' }}>
                                    <div className="detail-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Star size={14} fill="var(--color-warning)" stroke="var(--color-warning)" />
                                        <span className="rating-val" style={{ fontWeight: 700, fontSize: '13px' }}>{product.rating || '5.0'}</span>
                                    </div>
                                    <span className="meta-divider" style={{ color: '#e2e8f0' }}>|</span>
                                    <div className="detail-meta-item">
                                        <span className="sold-val" style={{ fontWeight: 700, fontSize: '13px' }}>{product.sold_count || 120}+</span>
                                        <span className="sold-label" style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '4px' }}>Peserta</span>
                                    </div>
                                </div>
    
                                <div className="detail-card__price" style={{ marginTop: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                                    <div style={{ 
                                        background: 'var(--color-success-dim)', 
                                        padding: '10px 15px', 
                                        borderRadius: '10px', 
                                        border: '1px solid var(--color-success)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: 'var(--color-success)',
                                        fontWeight: 700,
                                        fontSize: '14px'
                                    }}>
                                        <Check size={18} strokeWidth={3} />
                                        <span>Sudah Anda Miliki</span>
                                    </div>
                                </div>
    
                                {product.start_at && (
                                    <div className="detail-schedule" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', background: '#f8f9fa', border: '1px solid #edf2f7', borderRadius: '12px', color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: '1.5', margin: '16px 0', width: '100%', whiteSpace: 'pre-wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                            <span style={{ fontSize: '16px', marginTop: '1px' }}>📅</span>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                                    {new Date(product.start_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                    {product.end_at && ` - ${new Date(product.end_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
                                                </span>
                                                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                                                    {new Date(product.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    {product.end_at && ` - ${new Date(product.end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`} WIB
                                                </span>
                                            </div>
                                        </div>
                                        {product.location && (
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '4px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                                                <span style={{ fontSize: '16px' }}>📍</span>
                                                <span style={{ flex: 1, color: 'var(--color-text-primary)', fontWeight: 600 }}>{product.location}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
    
                                <div className="detail-card__actions">
                                    <button className="btn-buy" onClick={() => window.scrollTo({ top: document.querySelector('.materials-list').offsetTop - 100, behavior: 'smooth' })}>
                                        Mulai Belajar
                                    </button>
                                </div>
    
                                <div className="detail-card__guarantees">
                                    {['Akses Seumur Hidup', 'Materi Terupdate', 'Dukungan Komunitas'].map(g => (
                                        <div key={g} className="guarantee-item">
                                            <Check size={14} className="g-check" />
                                            {g}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
    
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
