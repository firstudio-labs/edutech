import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, PlayCircle, ShieldCheck, Zap } from 'lucide-react';
import { useContent } from '../../Contexts/ContentContext';
import { useCart } from '../../Contexts/CartContext';
import { formatCurrency } from '../../Utils/helpers';
import toast from 'react-hot-toast';
import './Ads.css';

export default function Ads({ previewMode = false, customData = null, dbAds, dbProducts = [] }) {
    const { content } = useContent();
    const { addToCart } = useCart();
    const { auth } = usePage().props;

    const savedContent = typeof dbAds === 'string' ? JSON.parse(dbAds) : dbAds;
    const adsContent = previewMode ? customData : (savedContent || {
        heroTitle: 'Bongkar Rahasia Bisnis Beromset Ratusan Juta',
        heroSubtitle: 'Pelajari strategi digital yang telah terbukti.',
        videoUrl: '',
        selectedProductIds: [] 
    });

    // Support both customData structure and content structure
    const title = adsContent.title || adsContent.heroTitle;
    const subtitle = adsContent.subtitle || adsContent.heroSubtitle;
    const ctaTitle = adsContent.ctaTitle || 'Ambil Promo Sekarang';
    const ctaSubtitle = adsContent.ctaSubtitle || 'Amankan seat Anda sebelum promo berakhir!';
    const customBenefits = adsContent.benefits;

    // Helper to safely convert standard youtube links to embed links
    const getEmbedUrl = (url) => {
        if (!url) return '';
        if (url.includes('youtube.com/watch?v=')) {
            const videoId = url.split('v=')[1].split('&')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1].split('?')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return url; // Assume it's already an embed link if neither match
    };

    const videoUrl = getEmbedUrl(adsContent.videoUrl);

    const handleBuy = (e, product) => {
        if (previewMode) {
            e.preventDefault();
            toast.success(`Simulasi: Mengarahkan ke halaman detail "${product.name || product.title}".`);
            return;
        }

        router.get(route('products.detail', product.slug || product.id));
    };

    const parseList = (data) => typeof data === 'string' ? JSON.parse(data) : (data || []);

    // Find actual products based on selected IDs using real DB products
    const featuredProducts = (adsContent.selectedProductIds || []).map(id => dbProducts.find(p => p.id === id)).filter(Boolean);

    return (
        <div className="ads-landing-min">
            <Head title="Promo Spesial - JAGGAD ACADEMY" />
            {/* Header minimal */}
            <header className="ads-header">
                <div className="ads-container">
                    <span className="ads-brand">JAGGAD ACADEMY</span>
                    <span className="ads-badge-top">Penawaran Terbatas</span>
                </div>
            </header>

            <main>
                <section className="ads-hero section-dark">
                    <div className="ads-container">
                        <div className="ads-hero-content">
                            <h1 className="ads-title-main">{title}</h1>
                            <p className="ads-subtitle">{subtitle}</p>

                            {videoUrl && (
                                <div className="ads-video-wrapper">
                                    <iframe
                                        src={videoUrl}
                                        title="Video Promo"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}



                            <p className="ads-guarantee" style={{ marginTop: 24 }}><ShieldCheck size={16} /> Garansi Uang Kembali 100%</p>
                        </div>
                    </div>
                </section>

                <section className="ads-details section-light">
                    <div className="ads-container">

                        {featuredProducts.length === 0 ? (
                            <div className="ads-card">
                                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Produk penawaran belum dikonfigurasi.</p>
                            </div>
                        ) : (
                            featuredProducts.map((product, index) => (
                                <div key={product.id} className="ads-card" style={{ marginTop: index === 0 ? '-40px' : '30px' }}>
                                    <h2 className="ads-section-title" style={{ fontSize: '1.25rem', color: '#0f4c81', marginBottom: 10 }}>PENAWARAN SPESIAL</h2>
                                    <h3 style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 800, marginBottom: 25, lineHeight: 1.3 }}>{product.name || product.title}</h3>

                                    <p style={{ textAlign: 'center', color: '#4a5568', marginBottom: 20, fontSize: '0.95rem' }}>
                                        {product.short_description || product.description}
                                    </p>

                                    {/* Benefits Section */}
                                    {parseList(product.benefits).length > 0 && (
                                        <>
                                            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 15, borderBottom: '1px solid #eee', paddingBottom: 10 }}>Apa yang Akan Anda Dapatkan:</h4>
                                            <ul className="ads-materi-list">
                                                {parseList(product.benefits).map((item, i) => (
                                                    <li key={i}><CheckCircle2 size={18} className="icon-check" /> {item}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}

                                    <div className="ads-pricing-box" style={{ background: '#fff9e6', borderColor: '#ffe082', marginTop: 30 }}>
                                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: 5 }}>Dapatkan penawaran ini hanya seharga:</p>
                                        <span className="ads-price-strike">{formatCurrency(product.normal_price || product.originalPrice || (product.price * 2))}</span>
                                        <span className="ads-price-final">{formatCurrency(product.price)}</span>
                                    </div>

                                    <button onClick={(e) => handleBuy(e, product)} className="ads-btn-primary w-full pulse-anim" style={{ marginTop: 20 }}>
                                        {ctaTitle}
                                    </button>
                                    
                                    {/* Calculated Discount & Custom Subtitle */}
                                    {(() => {
                                        const normal = product.normal_price || product.originalPrice || 0;
                                        const current = product.price || 0;
                                        const diskonPerc = normal > current ? Math.round(((normal - current) / normal) * 100) : 0;
                                        
                                        return (
                                            <p className="ads-scarcity">
                                                <Zap size={16} /> 
                                                {diskonPerc > 0 && <strong>Diskon {diskonPerc}% </strong>}
                                                {ctaSubtitle}
                                            </p>
                                        );
                                    })()}
                                </div>
                            ))
                        )}

                    </div>
                </section>
            </main>

            <footer className="ads-footer">
                <p>&copy; {new Date().getFullYear()} JAGGAD ACADEMY. All rights reserved.</p>
            </footer>
        </div>
    );
}

