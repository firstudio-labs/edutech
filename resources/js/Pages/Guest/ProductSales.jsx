import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { 
    Check, Star, ArrowRight, ArrowLeft, ShoppingCart, Play, BookOpen, Users, Zap, 
    ChevronDown, ChevronUp, ShieldCheck, Clock, AlertTriangle, AlertCircle, 
    Info, HelpCircle, Trophy, Heart, Rocket, Award, Shield, Eye, Video, 
    Mic, MessageSquare, Globe, Lightbulb, TrendingUp, CheckCircle, Target
} from 'lucide-react';
import { products } from '../../Data/products';
import { testimonials } from '../../Data/testimonials';
import { formatCurrency, getCategoryLabel, getStorageUrl } from '../../Utils/helpers';
import { useCart } from '../../Contexts/CartContext';
import MainLayout from '../../Layouts/MainLayout';
import TestimonialCard from '../../Components/TestimonialCard';
import toast from 'react-hot-toast';
import { useContent } from '../../Contexts/ContentContext';
import './ProductSales.css';

const STEPS = ['Produk', 'Checkout'];

function SalesNavbar({ product }) {
    const defaultHours = product.countdown_hours ? parseFloat(product.countdown_hours) : 2;
    const [timeLeft, setTimeLeft] = useState(defaultHours * 3600);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="sales-top-navbar">
            <div className="sales-top-navbar__inner">
                <div className="sales-top-navbar__info">
                    <h2 className="sales-top-navbar__title">{product.title}</h2>
                    <div className="sales-top-navbar__price-row">
                        <span className="sales-top-navbar__old-price">
                            dari <del>{formatCurrency(product.originalPrice)}</del> jadi
                        </span>
                        <span className="sales-top-navbar__new-price">
                            {formatCurrency(product.price)}
                        </span>
                    </div>
                    <div className="sales-top-navbar__urgency">
                        {product.landing_quota_text || 'Kuota Hampir Penuh ‼️'}
                    </div>
                </div>
                <div className="sales-top-navbar__timer">
                    <span className="timer-label">SISA WAKTU</span>
                    <span className="timer-value">{formatTime(timeLeft)}</span>
                </div>
            </div>
        </div>
    );
}

const availableIcons = {
    Users, Target, Eye, BookOpen, Award, Zap, Shield, CheckCircle,
    Video, Mic, MessageSquare, Globe, Star, Heart, Rocket, Trophy, Lightbulb, TrendingUp,
    ShieldCheck, Clock, AlertTriangle, AlertCircle, Info, HelpCircle
};

function getYoutubeEmbedId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\n?#]+)/);
    return match ? match[1] : null;
}

function LandingSlider({ images = [] }) {
    const [activeIdx, setActiveIdx] = useState(0);

    useEffect(() => {
        if (!images || images.length <= 1) return;
        const timer = setInterval(() => {
            setActiveIdx(i => (i + 1) % images.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [images]);

    if (!images.length) return null;

    const prev = () => setActiveIdx(i => (i - 1 + images.length) % images.length);
    const next = () => setActiveIdx(i => (i + 1) % images.length);

    const getImgSrc = (src) => {
        if (!src) return '';
        if (src.startsWith('http') || src.startsWith('blob')) return src;
        return `/storage/${src}`;
    };

    return (
        <div className="landing-slider">
            <div className="landing-slider__track" style={{ transform: `translateX(-${activeIdx * 100}%)` }}>
                {images.map((img, i) => (
                    <img key={i} src={getImgSrc(img)} className="landing-slider__img" alt={`Slide ${i+1}`} />
                ))}
            </div>
            {images.length > 1 && (
                <>
                    <button className="slider-btn prev" onClick={prev}><ChevronDown size={20} style={{transform:'rotate(90deg)'}} /></button>
                    <button className="slider-btn next" onClick={next}><ChevronDown size={20} style={{transform:'rotate(-90deg)'}} /></button>
                    <div className="slider-dots">
                        {images.map((_, i) => (
                            <span key={i} className={`slider-dot ${i === activeIdx ? 'active' : ''}`} onClick={() => setActiveIdx(i)} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function LandingBlock({ block, onCheckout, openFaq, setOpenFaq }) {
    const getImgSrc = (src) => {
        if (!src) return '';
        if (src.startsWith('http') || src.startsWith('blob')) return src;
        return `/storage/${src}`;
    };

    if (block.type === 'image' && block.url) {
        return <img src={getImgSrc(block.url)} className="landing-block-img" alt="Block" />;
    }

    if (block.type === 'slider' && block.images?.length > 0) {
        return <LandingSlider images={block.images} />;
    }

    if (block.type === 'youtube' && block.url) {
        const yid = getYoutubeEmbedId(block.url);
        if (!yid) return null;
        return (
            <div className="landing-block landing-block--youtube">
                <iframe 
                    src={`https://www.youtube.com/embed/${yid}`} 
                    title="YouTube video" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen 
                />
            </div>
        );
    }

    if (block.type === 'button') {
        return (
            <div className="landing-block landing-block--button">
                <button className="landing-cta-btn" onClick={onCheckout}>
                    {block.label || 'Beli Sekarang 🚀'}
                    <ArrowRight size={18} />
                </button>
            </div>
        );
    }

    if (block.type === 'faq' && block.items?.length > 0) {
        return (
            <div className="landing-block landing-block--faq">
                <h3 className="faq-title">Pertanyaan yang Sering Diajukan</h3>
                <div className="faq-list">
                    {block.items.filter(f => f.q).map((faq, i) => (
                        <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                            <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                {faq.q}
                                {openFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            {openFaq === i && <p className="faq-a">{faq.a}</p>}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return null;
}

export default function ProductSales({ id, product: dbProduct, previewMode = false, activeStep = 0 }) {
    const { auth } = usePage().props;
    const { addToCart } = useCart();
    const productDef = products.find(p => p.id === Number(id));
    const rawProduct = dbProduct || productDef;

    const { content } = useContent();
    const checkoutData = content.checkout?.[productDef?.id || dbProduct?.id] || content.checkout;
    const [internalStep, setInternalStep] = useState(0);
    const step = previewMode ? activeStep : internalStep;
    const setStep = previewMode ? () => {} : setInternalStep;
    const [openFaq, setOpenFaq] = useState(null);

    if (!rawProduct) {
        return (
            <MainLayout>
                <div className="sales-not-found">
                    <p>Produk tidak ditemukan.</p>
                    <button className="btn-hero-secondary" onClick={() => router.get(route('products'))}>Kembali</button>
                </div>
            </MainLayout>
        );
    }

    const parseList = (data) => typeof data === 'string' ? JSON.parse(data) : (data || []);
    
    // Merge landing_faq into landing_blocks as a fake block if it exists
    let blocks = parseList(rawProduct.landing_blocks);
    blocks = blocks.filter(b => b.type !== 'faq'); // Remove any old inline faq blocks to avoid duplicates
    const faqs = parseList(rawProduct.landing_faq);
    if (faqs.length > 0 && faqs.some(f => f.q)) {
        blocks.push({ type: 'faq', items: faqs });
    }

    const product = {
        id: rawProduct.id,
        slug: rawProduct.slug,
        title: rawProduct.name || rawProduct.title,
        category: rawProduct.category?.slug || rawProduct.category || 'ebook',
        price: rawProduct.price,
        originalPrice: rawProduct.normal_price || rawProduct.originalPrice,
        discount: rawProduct.discount || ((rawProduct.normal_price || rawProduct.originalPrice) > rawProduct.price ? Math.round((((rawProduct.normal_price || rawProduct.originalPrice) - rawProduct.price) / (rawProduct.normal_price || rawProduct.originalPrice)) * 100) : 0),
        thumbnail: getStorageUrl(rawProduct.image || rawProduct.thumbnail),
        description: rawProduct.short_description || rawProduct.description,
        badge: rawProduct.badge || 'Baru',
        benefits: parseList(rawProduct.benefits),
        materials: parseList(rawProduct.materials),
        start_at: rawProduct.start_at,
        end_at: rawProduct.end_at,
        location: rawProduct.location,
        landing_blocks: blocks,
    };

    const isPurchased = auth?.purchased_products?.includes(product.id);

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            addToCart(product);
            if (!auth.user) {
                toast.error('Harap login terlebih dahulu untuk melanjutkan pembayaran.');
                router.get(route('checkout'));
                return;
            }
            if (isPurchased) {
                toast.error('Anda sudah memiliki produk ini!');
                return router.get(route('dashboard.learning', product.slug || product.id));
            }
            router.get(route('checkout'));
        }
    };
    
    const handleBack = () => step > 0 ? setStep(step - 1) : router.get(route('products.detail', product.slug || product.id));

    const contentBody = (
        <div className={`product-sales ${previewMode ? 'is-preview' : ''}`}>
            {step === 0 && <SalesNavbar product={product} />}
            {/* ─── STEP 0: Produk (Landing Page Dinamis) ─── */}
            {step === 0 && (
                <div className="landing-page-step">
                    {product.landing_blocks?.length > 0 ? (
                        product.landing_blocks.map((block, idx) => (
                            <LandingBlock key={idx} block={block} onCheckout={handleNext} openFaq={openFaq} setOpenFaq={setOpenFaq} />
                        ))
                    ) : (
                        <div className="container sales-container">
                            <div className="sales-step-content" style={{textAlign: 'center', padding: '100px 20px'}}>
                                <h2>{product.title}</h2>
                                <p style={{marginBottom: 24, whiteSpace: 'pre-wrap'}}>{product.description}</p>
                                <button className="btn-checkout-now" onClick={handleNext}>
                                    Lanjut ke Pembayaran <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ─── STEP 1: Checkout Summary ─── */}
            {step === 1 && (
                <div className="container sales-container">
                    <div className="sales-step-content">
                        <div className="step-label-top">Konfirmasi Pembelian</div>
                        <h1 className="step-heading">{checkoutData.preCheckoutHeading || 'Anda Selangkah Lagi! 🎉'}</h1>
                        <div className="precart-layout">
                            <div className="precart-summary">
                                <div className="precart-product">
                                    <img src={product.thumbnail} alt={product.title} className="precart-img" />
                                    <div>
                                        <p className="precart-cat">{getCategoryLabel(product.category)}</p>
                                        <h3 className="precart-title">{product.title}</h3>
                                    </div>
                                </div>

                                <div className="precart-includes">
                                    <h4>Yang Anda Dapatkan:</h4>
                                    {(product.benefits || []).map(item => (
                                        <div key={item} className="precart-include-item">
                                            <Check size={14} className="precart-check" /> {item}
                                        </div>
                                    ))}
                                </div>

                                <div className="precart-urgency">
                                    {(() => {
                                        const urgencyText = content.ads?.ctaSubtitle || checkoutData.preCheckoutUrgency || 'Berakhir Dalam 15 Menit';
                                        const diskonPerc = product.originalPrice > product.price 
                                            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
                                            : 0;
                                        
                                        return (
                                            <>
                                                🔥 {diskonPerc > 0 && <strong>Diskon {diskonPerc}% Otomatis </strong>}
                                                {urgencyText}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="precart-order">
                                <h4>Ringkasan Pesanan</h4>
                                <div className="order-row-sm">
                                    <span>{product.title}</span>
                                    <span>
                                        {product.originalPrice > product.price && (
                                            <del style={{ fontSize: '0.85em', color: 'var(--color-text-muted)', marginRight: '6px' }}>{formatCurrency(product.originalPrice)}</del>
                                        )}
                                        {formatCurrency(product.price)}
                                    </span>
                                </div>
                                {product.originalPrice > product.price && (
                                    <div className="order-row-sm saving">
                                        <span>Hemat</span>
                                        <span>- {formatCurrency(product.originalPrice - product.price)}</span>
                                    </div>
                                )}
                                <div className="order-divider-sm" />
                                <div className="order-row-sm total-sm">
                                    <span>Total</span>
                                    <span>{formatCurrency(product.price)}</span>
                                </div>

                                {isPurchased ? (
                                    <button className="btn-checkout-now" onClick={() => router.get(route('dashboard.learning', product.slug || product.id))} style={{ background: 'var(--color-success)', border: 'none', boxShadow: 'none' }}>
                                        ☑ Sudah Dibeli (Buka Materi)
                                    </button>
                                ) : (
                                    <button className="btn-checkout-now" onClick={handleNext}>
                                        Lanjut ke Pembayaran <ArrowRight size={18} />
                                    </button>
                                )}
                                <p className="precart-secure">🔒 Transaksi aman & terenkripsi</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    {!previewMode && (
                        <div className="sales-nav">
                            <button className="sales-btn-back" onClick={handleBack}>
                                <ArrowLeft size={16} /> {step === 0 ? 'Kembali ke Produk' : 'Sebelumnya'}
                            </button>
                            {step < STEPS.length - 1 ? (
                                <button className="sales-btn-next" onClick={handleNext}>
                                    Selanjutnya <ArrowRight size={16} />
                                </button>
                            ) : null}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    if (previewMode) return contentBody;

    return (
        <MainLayout hideNavbar={true}>
            <Head title={`${product.title} - JAGGAD ACADEMY`} />
            {contentBody}
        </MainLayout>
    );
}
