import { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Star, ShoppingCart, Check, BookOpen, ArrowLeft, Zap, Shield, Award } from 'lucide-react';
import { products } from '../../Data/products';
import { testimonials } from '../../Data/testimonials';
import ProductCard from '../../Components/ProductCard';
import TestimonialCard from '../../Components/TestimonialCard';
import { formatCurrency, getCategoryLabel, getStorageUrl } from '../../Utils/helpers';
import { useCart } from '../../Contexts/CartContext';
import MainLayout from '../../Layouts/MainLayout';
import toast from 'react-hot-toast';
import './ProductDetail.css';

export default function ProductDetail({ product: dbProduct, similarProducts = [], id }) {
    const { auth } = usePage().props;
    const { addToCart, isInCart } = useCart();
    // Fallback to imported mock if dbProduct is absent (for offline UI work)
    const productDef = products.find(p => p.id === Number(id));
    const product = dbProduct || productDef;
    const [openSection, setOpenSection] = useState(null);
    
    if (!product) {
        return (
            <MainLayout>
                <div className="not-found-page">
                    <div className="container">
                        <h2>Ups! Produk tidak ditemukan</h2>
                        <p>Produk yang Anda cari mungkin telah dihapus atau dipindahkan.</p>
                        <Link href="/products" className="btn-hero-primary">Kembali ke Katalog</Link>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const categorySlug = product.category?.slug || product.category || 'ebook';
    const title = product.name || product.title;
    const desc = product.description || product.longDescription;
    const shortDesc = product.short_description || product.description;
    const image = getStorageUrl(product.image || product.thumbnail);
    const price = product.price;
    const originalPrice = product.normal_price || product.originalPrice;
    const discount = product.discount || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);
    const badge = product.badge || 'Baru';
    const parseList = (data) => typeof data === 'string' ? JSON.parse(data) : (data || []);
    const materials = parseList(product.materials);
    const benefits = parseList(product.benefits);

    const inCart = isInCart(product.id);
    const isPurchased = auth?.purchased_products?.includes(product.id);
    const related = similarProducts.length > 0 ? similarProducts : products.filter(p => p.category === categorySlug && p.id !== product.id).slice(0, 3);

    const handleBuy = () => {
        router.get(route('products.sales', product.id || product.slug));
    };

    const handleAddToCart = () => {
        if (!auth.user) {
            toast.error('Harap login terlebih dahulu untuk menambahkan produk ke keranjang.');
            router.get(route('login'));
            return;
        }
        addToCart(product);
        toast.success('Berhasil ditambahkan ke keranjang!');
    };

    return (
        <MainLayout>
            <Head title={`${title} - SAGA Academy`} />
            <div className="product-detail">
                <div className="container product-detail__inner">
                    <Link href={route('products')} className="back-link">
                        <ArrowLeft size={16} /> Kembali ke Katalog
                    </Link>

                    <div className="product-detail__layout">
                        {/* Main Content */}
                        <div className="product-detail__main">
                            <div className="product-detail__hero-img">
                                <img src={image} alt={title} />
                                {badge && <span className="detail-badge">{badge}</span>}
                            </div>

                            <div className="detail-section">
                                <h2 className="detail-section-title">Deskripsi Produk</h2>
                                <p className="detail-desc">{desc}</p>
                            </div>

                            <div className="detail-section">
                                <h2 className="detail-section-title">Apa yang Akan Anda Dapatkan</h2>
                                <div className="benefits-list">
                                    {benefits.map((b, i) => (
                                        <div key={i} className="benefit-item">
                                            <div className="benefit-check"><Check size={14} /></div>
                                            <span>{b}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h2 className="detail-section-title">Isi Materi</h2>
                                <div className="materials-list">
                                    {materials.map((m, i) => (
                                        <div key={i} className="material-item" onClick={() => setOpenSection(openSection === i ? null : i)}>
                                            <div className="material-title">
                                                <span className="material-num">{String(i + 1).padStart(2, '0')}</span>
                                                {m.title}
                                            </div>
                                            <span className="material-meta">
                                                {m.pages ? `${m.pages} hal` : m.videos ? `${m.videos} video` : m.duration || 'Akses Instan'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="product-detail__sidebar">
                            <div className="detail-card">
                                <div className="detail-card__category">
                                    <span>{getCategoryLabel(categorySlug)}</span>
                                </div>
                                <h1 className="detail-card__title">{title}</h1>

                                <div className="detail-card__price">
                                    <span className="price-big">{formatCurrency(price)}</span>
                                    {originalPrice > price && (
                                        <div className="price-meta">
                                            <span className="price-strike">{formatCurrency(originalPrice)}</span>
                                            <span className="price-disc">Hemat {discount}%</span>
                                        </div>
                                    )}
                                </div>

                                {product.start_at && (
                                    <div className="detail-schedule" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: '#9090a8', fontSize: '13px', lineHeight: '1.5', margin: '16px 0', width: '100%', whiteSpace: 'pre-wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                            <span style={{ fontSize: '14px', marginTop: '1px' }}>📅</span>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600, color: '#e2e2e2' }}>
                                                    {new Date(product.start_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                    {product.end_at && ` - ${new Date(product.end_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
                                                </span>
                                                <span style={{ fontSize: '12px' }}>
                                                    {new Date(product.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    {product.end_at && ` - ${new Date(product.end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`} WIB
                                                </span>
                                            </div>
                                        </div>
                                        {product.location && (
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px' }}>
                                                <span style={{ fontSize: '14px' }}>📍</span>
                                                <span style={{ flex: 1, color: '#e2e2e2' }}>{product.location}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="detail-card__actions">
                                    {isPurchased ? (
                                        <button className="btn-buy" onClick={() => router.get(route('dashboard.learning', product.id))} style={{ background: 'var(--color-success)', color: 'white', border: 'none' }}>
                                            ☑ Sudah Dibeli (Buka Materi)
                                        </button>
                                    ) : (
                                        <>
                                            <button className="btn-buy" onClick={handleBuy}>
                                                Beli Sekarang
                                            </button>
                                            <button
                                                className={`btn-cart ${inCart ? 'in-cart' : ''}`}
                                                onClick={handleAddToCart}
                                                disabled={inCart}
                                            >
                                                <ShoppingCart size={17} />
                                                {inCart ? 'Di Keranjang' : 'Keranjang'}
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="detail-card__guarantees">
                                    {['Akses Seumur Hidup', 'Garansi 7 Hari', 'Sertifikat Tersedia'].map(g => (
                                        <div key={g} className="guarantee-item">
                                            <Check size={14} className="g-check" />
                                            {g}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>

                    {/* Related Products */}
                    {related.length > 0 && (
                        <section className="related-section">
                            <h2 className="related-title">Produk Terkait</h2>
                            <div className="grid-3">
                                {related.map(p => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
