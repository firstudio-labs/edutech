import { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowRight, BookOpen, Video, Mic, MapPin, Users, Star, Zap, Shield, Award, ChevronLeft, ChevronRight,
    Target, Eye, CheckCircle, MessageSquare, Globe, Heart, Rocket, Trophy, Lightbulb, TrendingUp 
} from 'lucide-react';
import { products as initialProducts } from '../../Data/products';
import { testimonials } from '../../Data/testimonials';
import ProductCard from '../../Components/ProductCard';
import TestimonialCard from '../../Components/TestimonialCard';
import MainLayout from '../../Layouts/MainLayout';
import { formatCurrency, getStorageUrl } from '../../Utils/helpers';
import { useContent } from '../../Contexts/ContentContext';
import './Welcome.css';

const features = [
    { icon: Zap, title: 'Akses Instan', desc: 'Nikmati produk digital Anda segera setelah pembayaran berhasil, tanpa menunggu.' },
    { icon: Shield, title: 'Akses Seumur Hidup', desc: 'Satu kali beli, akses selamanya. Termasuk semua update konten di masa mendatang.' },
    { icon: Award, title: 'Dijamin Berkualitas', desc: 'Semua materi dikurasi oleh para expert dengan pengalaman industri yang terbukti.' },
];

export default function Welcome({ products = [], categories = [], dbStats = {}, previewMode = false }) {
    const { content } = useContent();
    const home = content?.home || {};
    const about = content?.about || {};
    const sliderRef = useRef(null);

    const iconMap = {
        Users, Target, Eye, BookOpen, Award, Zap, Shield, CheckCircle,
        Video, Mic, MessageSquare, Globe, Star, Heart, Rocket, Trophy, Lightbulb, TrendingUp
    };
    
    // Sync home stats with "JAGGAD dalam Angka" from About Page
    const stats = (about.achievements || []).map(stat => ({
        icon: iconMap[stat.icon] || Award,
        value: stat.value,
        label: stat.label
    }));

    // Fallback if no achievements defined yet
    if (stats.length === 0) {
        stats.push(
            { icon: Users, value: `${(dbStats.users || 0) + 1000}+`, label: 'Pelajar Aktif' },
            { icon: Award, value: `${dbStats.sales || 0}`, label: 'Alumni Sukses' },
            { icon: BookOpen, value: `${dbStats.products || 0}+`, label: 'Program Tersedia' }
        );
    }
    
    // Fallback to initial products if backend didn't send anything
    const featuredProducts = products.length > 0 
        ? products.slice(0, 3)
        : initialProducts.filter(p => p.featured).slice(0, 3);

    const scroll = (direction) => {
        if (!sliderRef.current) return;
        const scrollAmount = 320;
        sliderRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    const PageContent = (
        <div className="home">
            <Head title={`${content.branding?.siteName || "JAGGAD"} ${content.branding?.siteTagline || "ACADEMY"} - ${home.heroBadge}`} />
            
            {/* Hero */}
            <section className="hero section-dark">
                <div className="container hero__content">
                    <div className="hero__badge badge badge-accent">
                        <Zap size={12} />
                        {home.heroBadge}
                    </div>
                    <h1 className="hero__title">
                        {home.heroTitleLine1}<br />
                        <span className="text-gradient">{home.heroTitleLine2}</span>
                    </h1>
                    <p className="hero__subtitle">
                        {home.heroSubtitle}
                    </p>
                    <div className="hero__actions">
                        <Link href={route('products')} className="btn-hero-primary">
                            {home.ctaPrimary} <ArrowRight size={18} />
                        </Link>
                        {/* <Link href={route('packages.landing', { slug: 'growth-pack' })} className="btn-hero-secondary">
                            {home.ctaSecondary}
                        </Link> */}
                    </div>
                    <div className="hero__proof">
                        <div className="proof-avatars">
                            {['A', 'B', 'C', 'D'].map((l) => (
                                <div key={l} className="proof-avatar">{l}</div>
                            ))}
                        </div>
                        <p className="proof-text">
                            {home.proofText}
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="stats-bar section-light-red">
                <div className="container stats-bar__grid">
                    {stats.map(({ icon: Icon, value, label }) => (
                        <div key={label} className="stats-bar__item">
                            <div className="stats-icon"><Icon size={20} /></div>
                            <div>
                                <p className="stats-value">{value}</p>
                                <p className="stats-label">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Product Categories */}
            <section className="section categories-section">
                <div className="container">
                    <div className="section-header-row">
                        <div>
                            <p className="section-label"><BookOpen size={14} /> Kategori Produk</p>
                            <h2 className="section-title">
                                {home.catTitlePrefix}<br />
                                <span className="text-gradient">{home.catTitleAccent}</span>
                            </h2>
                        </div>
                        <div className="slider-controls">
                            <button className="btn-slider" onClick={() => scroll('left')}><ChevronLeft size={20} /></button>
                            <button className="btn-slider" onClick={() => scroll('right')}><ChevronRight size={20} /></button>
                        </div>
                    </div>

                    <div className="categories-wrapper">
                        <div className="categories-slider" ref={sliderRef}>
                            {categories.length > 0 ? categories.map((cat) => (
                                <Link href={route('products', { category: cat.slug })} key={cat.id} className="category-card card-red">
                                    <div className="category-card__image">
                                        <img src={getStorageUrl(cat.image)} alt={cat.name} />
                                    </div>
                                    <div className="category-card__content">
                                        <h3 className="category-card__title">{cat.name}</h3>
                                        <p className="category-card__desc">{cat.description?.substring(0, 80)}...</p>
                                        <span className="category-card__count">{cat.products_count || 0} Produk</span>
                                    </div>
                                </Link>
                            )) : (
                                <div style={{ width: '100%', textAlign: 'center', padding: 'var(--space-10)', opacity: 0.5 }}>
                                    <BookOpen size={30} style={{ display: 'block', margin: '0 auto 10px' }} />
                                    <p>Belum ada kategori tersedia.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="section">
                <div className="container">
                    <div className="section-header-row">
                        <div>
                            <p className="section-label"><Zap size={14} /> Produk Unggulan</p>
                            <h2 className="section-title">
                                {home.featuredTitlePrefix} <span className="text-gradient">{home.featuredTitleAccent}</span>
                            </h2>
                        </div>
                        <Link href={route('products')} className="see-all-link">Lihat Semua <ArrowRight size={16} /></Link>
                    </div>
                    <div className="grid-3">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} className="card-red" />
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="section section-light-red">
                <div className="container">
                    <div className="features-layout">
                        <div className="features-left">
                            <p className="section-label"><Shield size={14} /> Mengapa JAGGAD?</p>
                            <h2 className="section-title">
                                {home.whyJaggadTitleLine1}<br />
                                <span className="text-gradient">{home.whyJaggadTitleLine2}</span>
                            </h2>
                            <p className="section-subtitle">
                                {home.whyJaggadSubtitle}
                            </p>
                            <Link href={route('about')} className="learn-more-link">
                                Pelajari Lebih Lanjut <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="features-right">
                            {features.map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="feature-item">
                                    <div className="feature-icon"><Icon size={20} /></div>
                                    <div>
                                        <h4 className="feature-title">{title}</h4>
                                        <p className="feature-desc">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials - hidden for now */}
            {/* 
            <section className="section">
                <div className="container">
                    <div className="section-header-row">
                        <div>
                            <p className="section-label"><Award size={14} /> Testimonial</p>
                            <h2 className="section-title">Cerita Sukses<br /><span className="text-gradient">Alumni Kami</span></h2>
                        </div>
                    </div>
                    <div className="grid-2">
                        {testimonials.slice(0, 4).map((t) => (
                            <TestimonialCard key={t.id} testimonial={t} />
                        ))}
                    </div>
                </div>
            </section>
            */}

            {/* CTA */}
            <section className="section cta-section section-dark">
                <div className="container">
                    <div className="cta-card card-red">
                        <div className="cta-glow" />
                        <p className="section-label" style={{ justifyContent: 'center' }}><Zap size={14} /> Mulai Sekarang</p>
                        <h2 className="cta-title">{home.ctaBannerTitle}</h2>
                        <p className="cta-desc">{home.ctaBannerDesc}</p>
                        <div className="cta-actions">
                            <Link href={route('register')} className="btn-hero-primary">
                                {home.ctaBannerBtn} <ArrowRight size={18} />
                            </Link>
                            <Link href={route('contact')} className="btn-hero-secondary">Hubungi Kami</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

    if (previewMode) return PageContent;

    return (
        <MainLayout>
            {PageContent}
        </MainLayout>
    );
}


