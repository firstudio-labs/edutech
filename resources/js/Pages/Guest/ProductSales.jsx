import { useState } from 'react';
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

const STEPS = ['Pengantar', 'Produk', 'Penjelasan', 'Checkout'];

const availableIcons = {
    Users, Target, Eye, BookOpen, Award, Zap, Shield, CheckCircle,
    Video, Mic, MessageSquare, Globe, Star, Heart, Rocket, Trophy, Lightbulb, TrendingUp,
    ShieldCheck, Clock, AlertTriangle, AlertCircle, Info, HelpCircle
};

export default function ProductSales({ id, product: dbProduct, previewMode = false, activeStep = 0 }) {
    const { auth } = usePage().props;
    const { addToCart } = useCart();
    const productDef = products.find(p => p.id === Number(id));
    const rawProduct = dbProduct || productDef;

    const { content } = useContent();
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
    };

    const related = testimonials.filter(t => t.productId === product.id).slice(0, 2);
    const isPurchased = auth?.purchased_products?.includes(product.id);

    const handleNext = () => {
        if (step < STEPS.length - 1) setStep(step + 1);
        else {
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleBack = () => step > 0 ? setStep(step - 1) : router.get(route('products.detail', product.slug || product.id));



    const contentBody = (
        <div className={`product-sales ${previewMode ? 'is-preview' : ''}`}>
            {/* Progress bar */}
            <div className="sales-progress-bar section-dark">
                <div className="sales-progress-inner">
                    <div className="sales-steps">
                        {STEPS.map((s, i) => (
                            <div key={s} className={`sales-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`} onClick={() => !previewMode && i < step && setStep(i)}>
                                <div className="sales-step-circle">{i < step ? '✓' : i + 1}</div>
                                <span>{s}</span>
                            </div>
                        ))}
                    </div>
                    <div className="sales-progress-track">
                        <div className="sales-progress-fill" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
                    </div>
                </div>
            </div>

            <div className="container sales-container">
                {/* ─── STEP 0: Introduction ─── */}
                {step === 0 && (
                    <div className="sales-step-content">
                        <div className="step-intro">
                            <div className="step-intro__glow" />
                            <div className="step-intro__body">
                                <span className="section-label">Selamat Datang</span>
                                <h1 className="step-intro__title">{content.checkout.introTitle}</h1>
                                <p className="step-intro__subtitle">{content.checkout.introSubtitle}</p>

                                <div className="intro-stats">
                                    {(content.checkout.introStats || []).map((stat, idx) => {
                                        const Icon = availableIcons[stat.icon] || ShieldCheck;
                                        return (
                                            <div key={idx} className="intro-stat">
                                                <div className="intro-stat__icon"><Icon size={20} /></div>
                                                <div className="intro-stat__value">{stat.value}</div>
                                                <div className="intro-stat__label">{stat.label}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="intro-quote">
                                    <p>{content.checkout.introQuote}</p>
                                </div>

                                <div className="intro-problems">
                                    <h3>{content.checkout.problemSectionTitle}</h3>
                                    <div className="problem-list">
                                        {content.checkout.problems.map((p, idx) => {
                                            const iconName = content.checkout.problemIcon;
                                            const ProbIcon = availableIcons[iconName] || ShieldCheck;
                                            
                                            const colors = {
                                                CheckCircle: '#10b981', Check: '#10b981', ShieldCheck: '#10b981',
                                                AlertTriangle: '#ffcc00', AlertCircle: '#ffcc00',
                                                Star: '#f59e0b', Zap: '#f59e0b', Lightbulb: '#f59e0b', Trophy: '#fbbf24', Award: '#fbbf24',
                                                Heart: '#ef4444', 
                                                Info: '#3b82f6', HelpCircle: '#3b82f6', Globe: '#3b82f6'
                                            };

                                            const isAlert = iconName === 'AlertTriangle' || iconName === 'AlertCircle';
                                            const isFilled = isAlert || ['Star', 'Heart', 'Zap'].includes(iconName);
                                            const iconColor = colors[iconName] || 'var(--color-accent)';
                                            
                                            return (
                                                <div key={idx} className="problem-item">
                                                    <span className="problem-dot" style={{ color: iconColor }}>
                                                        <ProbIcon 
                                                            size={18} 
                                                            fill={isFilled ? iconColor : "none"} 
                                                            stroke={isAlert ? '#000' : (isFilled ? iconColor : 'currentColor')}
                                                            strokeWidth={isFilled ? 2.5 : 2}
                                                        />
                                                    </span>
                                                    <span>{p}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <p className="intro-cta-text">Jika ya — maka Anda berada di tempat yang tepat. Mari kami tunjukkan solusinya.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── STEP 1: Product Overview ─── */}
                {step === 1 && (
                    <div className="sales-step-content">
                        <div className="step-label-top">Produk yang Anda Pilih</div>
                        <div className="product-showcase">
                            <div className="product-showcase__image">
                                <img src={product.thumbnail} alt={product.title} />
                                {product.badge && <span className="showcase-badge">{product.badge}</span>}
                            </div>
                            <div className="product-showcase__info">
                                <span className="cat-pill">{getCategoryLabel(product.category)}</span>
                                <h2>{product.title}</h2>
                                <p className="showcase-desc" style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
                                <div className="showcase-price">
                                    <span className="price-main">{formatCurrency(product.price)}</span>
                                    {product.originalPrice > product.price && (
                                        <>
                                            <del>{formatCurrency(product.originalPrice)}</del>
                                            <span className="discount-pill">Hemat {product.discount}%</span>
                                        </>
                                    )}
                                </div>
                                {product.start_at && (
                                    <div className="showcase-schedule" style={{ marginTop: '16px', padding: '12px 14px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #edf2f7', fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ display: 'flex', gap: '8px', color: 'var(--color-text-primary)', fontWeight: 700 }}>
                                            <span style={{ fontSize: '16px' }}>📅</span>
                                            <span>
                                                {new Date(product.start_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                {product.end_at && ` - ${new Date(product.end_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
                                            </span>
                                        </div>
                                        <div style={{ paddingLeft: '24px', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                                            🕒 {new Date(product.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} 
                                            {product.end_at && ` - ${new Date(product.end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`} WIB
                                        </div>
                                        {product.location && (
                                            <div style={{ paddingLeft: '24px', fontSize: '12px', marginTop: '6px', borderTop: '1px solid #e2e8f0', paddingTop: '8px', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                                                📍 {product.location}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="product-highlights">
                            <h3>Apa yang Anda Dapatkan</h3>
                            <div className="highlights-grid">
                                {(product.benefits || ['Materi pembelajaran lengkap', 'Akses seumur hidup', 'Sertifikat penyelesaian', 'Dukungan mentor']).slice(0, 6).map((b, i) => (
                                    <div key={i} className="highlight-item">
                                        <div className="highlight-check"><Check size={14} /></div>
                                        <span>{b}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── STEP 2: Education / Explanation ─── */}
                {step === 2 && (
                    <div className="sales-step-content">
                        <div className="step-label-top">{content.checkout.explanationTitle}</div>
                        <h2 className="step-heading">{content.checkout.explanationHeading}</h2>

                        <div className="journey-steps">
                            {content.checkout.journeySteps.map(j => (
                                <div key={j.num} className="journey-step-item">
                                    <div className="journey-num">{j.num}</div>
                                    <div className="journey-content">
                                        <h4>{j.title}</h4>
                                        <p>{j.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Materials */}
                        {product.materials && product.materials.length > 0 && (
                            <div className="materials-preview">
                                <h3>Isi Materi Pembelajaran ({product.materials.length} bab)</h3>
                                <div className="materials-list">
                                    {product.materials.map((m, i) => (
                                        <div key={i} className="material-row">
                                            <div className="material-num">{String(i + 1).padStart(2, '0')}</div>
                                            <span>{m.title}</span>
                                            <span className="material-meta-sm">{m.pages ? `${m.pages} hal` : m.videos ? `${m.videos} video` : (m.duration && m.duration !== 'N/A' ? m.duration : '')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* FAQ */}
                        <div className="sales-faq">
                            <h3>Pertanyaan yang Sering Diajukan</h3>
                            <div className="faq-list">
                                {(content.checkout.faqs || []).map((faq, i) => (
                                    <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                                        <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                            {faq.q}
                                            {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                        {openFaq === i && <p className="faq-a">{faq.a}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── STEP 3: Pre-Checkout Summary ─── */}
                {step === 3 && (
                    <div className="sales-step-content">
                        <div className="step-label-top">Konfirmasi Pembelian</div>
                        <h2 className="step-heading">{content.checkout.preCheckoutHeading}</h2>

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
                                        const urgencyText = content.ads?.ctaSubtitle || content.checkout.preCheckoutUrgency || 'Berakhir Dalam 15 Menit';
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
                )}

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
