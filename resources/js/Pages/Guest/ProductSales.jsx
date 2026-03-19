import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Check, Star, ArrowRight, ArrowLeft, ShoppingCart, Play, BookOpen, Users, Zap, ChevronDown, ChevronUp, ShieldCheck, Clock } from 'lucide-react';
import { products } from '../../Data/products';
import { testimonials } from '../../Data/testimonials';
import { formatCurrency, getCategoryLabel, getStorageUrl } from '../../Utils/helpers';
import { useCart } from '../../Contexts/CartContext';
import MainLayout from '../../Layouts/MainLayout';
import TestimonialCard from '../../Components/TestimonialCard';
import toast from 'react-hot-toast';
import './ProductSales.css';

const STEPS = ['Pengantar', 'Produk', 'Penjelasan', 'Checkout'];

export default function ProductSales({ id, product: dbProduct }) {
    const { auth } = usePage().props;
    const { addToCart } = useCart();
    const productDef = products.find(p => p.id === Number(id));
    const rawProduct = dbProduct || productDef;

    const [step, setStep] = useState(0);
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

    const faqs = [
        { q: 'Apakah saya mendapat akses seumur hidup?', a: 'Ya! Setelah membeli, akses produk ini tidak akan pernah kedaluwarsa.' },
        { q: 'Apakah ada garansi uang kembali?', a: 'Kami memberikan garansi uang kembali 7 hari penuh jika Anda tidak puas.' },
        { q: 'Apakah ada sertifikat?', a: 'Ya, tersedia sertifikat penyelesaian yang dapat Anda tambahkan ke LinkedIn.' },
        { q: 'Bagaimana cara mengakses setelah membeli?', a: 'Setelah pembayaran berhasil, produk langsung dapat diakses di dashboard Anda.' },
    ];

    return (
        <MainLayout hideNavbar={true}>
            <Head title={`${product.title} - JAGGAD ACADEMY`} />
            <div className="product-sales">
                {/* Progress bar */}
                <div className="sales-progress-bar">
                    <div className="sales-progress-inner">
                        <div className="sales-steps">
                            {STEPS.map((s, i) => (
                                <div key={s} className={`sales-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`} onClick={() => i < step && setStep(i)}>
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
                                    <h1 className="step-intro__title">Apakah Anda Siap Mengubah Karir Anda?</h1>
                                    <p className="step-intro__subtitle">Setiap pelajar sukses dimulai dari satu langkah yang berani. Hari ini, Anda sudah di sini — itu adalah langkah terbaik.</p>

                                    <div className="intro-stats">
                                        {[
                                            { icon: ShieldCheck, value: 'Akses Selamanya', label: 'Lifetime Access' },
                                            { icon: Clock, value: '24/7', label: 'Dukungan Teknis' },
                                        ].map(({ icon: Icon, value, label }) => (
                                            <div key={label} className="intro-stat">
                                                <div className="intro-stat__icon"><Icon size={20} /></div>
                                                <div className="intro-stat__value">{value}</div>
                                                <div className="intro-stat__label">{label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="intro-quote">
                                        <p>"Investasi terbaik adalah investasi pada ilmu pengetahuan. Dan ilmu yang tepat bisa mengubah hidup Anda selamanya."</p>
                                    </div>

                                    <div className="intro-problems">
                                        <h3>Apakah Anda merasakan ini?</h3>
                                        <div className="problem-list">
                                            {['Merasa tertinggal di era digital yang bergerak cepat', 'Skill yang belum relevan dengan kebutuhan industri', 'Bingung mulai dari mana untuk meningkatkan penghasilan', 'Belajar sendiri tapi tidak tahu mana yang benar'].map(p => (
                                                <div key={p} className="problem-item">
                                                    <span className="problem-dot">⚠️</span>
                                                    <span>{p}</span>
                                                </div>
                                            ))}
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
                                    <p className="showcase-desc">{product.description}</p>
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
                                        <div className="showcase-schedule" style={{ marginTop: '16px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ display: 'flex', gap: '6px', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                                                <span>📅</span>
                                                <span>
                                                    {new Date(product.start_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                    {product.end_at && ` - ${new Date(product.end_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
                                                </span>
                                            </div>
                                            <div style={{ paddingLeft: '22px', fontSize: '11px' }}>
                                                🕒 {new Date(product.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} 
                                                {product.end_at && ` - ${new Date(product.end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`} WIB
                                            </div>
                                            {product.location && (
                                                <div style={{ paddingLeft: '22px', fontSize: '11px', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '4px' }}>
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
                            <div className="step-label-top">Mengapa Ini Penting untuk Anda?</div>
                            <h2 className="step-heading">Perjalanan Belajar yang Telah Terbukti</h2>

                            <div className="journey-steps">
                                {[
                                    { num: '01', title: 'Dapatkan Fondasi yang Kuat', desc: 'Mulai dari dasar yang tepat agar setiap langkah selanjutnya menjadi lebih mudah dan efektif.' },
                                    { num: '02', title: 'Praktik Langsung dengan Studi Kasus Nyata', desc: 'Bukan hanya teori — setiap materi dilengkapi contoh nyata dari praktisi industri berpengalaman.' },
                                    { num: '03', title: 'Bangun Portfolio yang Mengesankan', desc: 'Terapkan ilmu untuk menciptakan karya nyata yang bisa ditunjukkan kepada klien atau perusahaan.' },
                                    { num: '04', title: 'Raih Hasil yang Terukur', desc: 'Ikuti jalur yang telah membantu ribuan peserta mendapatkan pekerjaan baru atau meningkatkan penghasilan.' },
                                ].map(j => (
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
                                    {faqs.map((faq, i) => (
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
                            <h2 className="step-heading">Anda Selangkah Lagi! 🎉</h2>

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
                                        {['Akses seumur hidup ke semua materi', 'Sertifikat penyelesaian resmi', 'Garansi uang kembali 7 hari', 'Update materi gratis selamanya', 'Akses komunitas eksklusif peserta'].map(item => (
                                            <div key={item} className="precart-include-item">
                                                <Check size={14} className="precart-check" /> {item}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="precart-urgency">
                                        🔥 <strong>Penawaran terbatas!</strong> Harga ini hanya berlaku hari ini.
                                    </div>
                                </div>

                                <div className="precart-order">
                                    <h4>Ringkasan Pesanan</h4>
                                    <div className="order-row-sm">
                                        <span>{product.title}</span>
                                        <span>{formatCurrency(product.price)}</span>
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

                                    <div className="precart-guarantees">
                                        {['Garansi 7 Hari', 'Akses Seumur Hidup', 'Sertifikat Tersedia'].map(g => (
                                            <div key={g} className="precart-g">
                                                <Check size={12} /> {g}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
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
                </div>
            </div>
        </MainLayout>
    );
}
