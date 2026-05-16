import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Save, Eye, EyeOff, Layout, Type, Image as ImageIcon, MessageSquare, Phone, MapPin, Globe, 
    Loader2, Monitor, Smartphone, PanelLeftClose, PanelLeftOpen, Target, Shield, BookOpen, 
    UserCheck, Zap, ArrowRight, Trash2, Plus, X, Users, Award, CheckCircle, Video, Mic, 
    Star, Heart, Rocket, Trophy, Lightbulb, TrendingUp, Construction, ShoppingCart,
    ShieldCheck, Clock, AlertTriangle, AlertCircle, Info, HelpCircle
} from 'lucide-react';
import { useContent } from '../../Contexts/ContentContext';
import AdminLayout from '../../Layouts/AdminLayout';
import toast from 'react-hot-toast';
import './Admin.css';

// Import guest components for preview
import Welcome from '../Guest/Welcome';
import About from '../Guest/About';
import Contact from '../Guest/Contact';
import ProductSales from '../Guest/ProductSales';

const availableIcons = {
    Users, Target, Eye, BookOpen, Award, Zap, Shield, CheckCircle,
    Video, Mic, MessageSquare, Globe, Star, Heart, Rocket, Trophy, Lightbulb, TrendingUp,
    ShieldCheck, Clock, AlertTriangle, AlertCircle, Info, HelpCircle
};

export default function AdminContent({ dbCategories = [], dbFeaturedProducts = [] }) {
    const { content, updateContent } = useContent();
    const [activeTab, setActiveTab] = useState('home');
    const [activeCheckoutStep, setActiveCheckoutStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [hideSidebar, setHideSidebar] = useState(false);
    const [previewMode, setPreviewMode] = useState('desktop');

    // File Upload States
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [faviconFile, setFaviconFile] = useState(null);
    const [faviconPreview, setFaviconPreview] = useState(null);

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === 'logo') {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        } else {
            setFaviconFile(file);
            setFaviconPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        router.post(route('admin.content.store'), { 
            home: content.home, 
            about: content.about, 
            contact: content.contact,
            social: content.social,
            branding: content.branding,
            checkout: content.checkout,
            logoFile: logoFile,
            faviconFile: faviconFile
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsSaving(false);
                toast.success('Konten berhasil disimpan ke database!');
            },
            onError: () => {
                setIsSaving(false);
                toast.error('Gagal menyimpan perubahan.');
            }
        });
    };

    const handleInputChange = (tab, field, value) => {
        updateContent(tab, field, value);
    };

    const renderPreview = () => {
        switch (activeTab) {
            case 'home': return <Welcome previewMode={true} products={dbFeaturedProducts} categories={dbCategories} />;
            case 'about': return <About previewMode={true} />;
            case 'contact': return <Contact previewMode={true} />;
            case 'checkout': return (
                <ProductSales 
                    previewMode={true} 
                    activeStep={activeCheckoutStep} 
                    product={dbFeaturedProducts[0] || { id: 1, title: 'Produk Demo', price: 500000, description: 'Deskripsi produk demo untuk preview CMS.' }}
                />
            );
            default: return null;
        }
    };

    return (
        <AdminLayout>
            <Head title="Editor Konten - JAGGAD ACADEMY" />

            <div className="admin-cms-layout">
                <aside className={`cms-sidebar ${hideSidebar ? 'collapsed' : ''}`}>
                    <div className="cms-sidebar-header">
                        <h2>Editor Visual</h2>
                        <p>Kustomisasi teks dan visual landing page</p>
                    </div>

                    <div className="cms-tabs">
                        <button className={`cms-tab-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
                            <Layout size={18} /> <span>Halaman Utama</span>
                        </button>
                        <button className={`cms-tab-btn ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
                            <Type size={18} /> <span>Tentang Kami</span>
                        </button>
                        <button className={`cms-tab-btn ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>
                            <Phone size={18} /> <span>Kontak</span>
                        </button>
                        <button className={`cms-tab-btn ${activeTab === 'checkout' ? 'active' : ''}`} onClick={() => setActiveTab('checkout')}>
                            <ShoppingCart size={18} /> <span>Checkout</span>
                        </button>
                        <button className={`cms-tab-btn ${activeTab === 'branding' ? 'active' : ''}`} onClick={() => setActiveTab('branding')}>
                            <Target size={18} /> <span>Branding & Logo</span>
                        </button>
                    </div>

                    <div className="cms-editor-fields">
                        {activeTab === 'home' && (
                            <>
                                <div className="cms-form-group">
                                    <h4 className="cms-section-label">Hero Section</h4>
                                    <label>Badge Teks</label>
                                    <input value={content.home.heroBadge} onChange={(e) => handleInputChange('home', 'heroBadge', e.target.value)} />
                                    
                                    <label>Judul Baris 1</label>
                                    <input value={content.home.heroTitleLine1} onChange={(e) => handleInputChange('home', 'heroTitleLine1', e.target.value)} />
                                    
                                    <label>Judul Baris 2 (Gradien)</label>
                                    <input value={content.home.heroTitleLine2} onChange={(e) => handleInputChange('home', 'heroTitleLine2', e.target.value)} />
                                    
                                    <label>Sub-judul</label>
                                    <textarea value={content.home.heroSubtitle} onChange={(e) => handleInputChange('home', 'heroSubtitle', e.target.value)} rows="3" />
                                    
                                    <label>Teks Tombol Utama</label>
                                    <input value={content.home.ctaPrimary} onChange={(e) => handleInputChange('home', 'ctaPrimary', e.target.value)} />
                                    
                                    <label>Teks Proof (Social Proof)</label>
                                    <input value={content.home.proofText} onChange={(e) => handleInputChange('home', 'proofText', e.target.value)} />
                                </div>

                                <div className="cms-form-group">
                                    <h4 className="cms-section-label">Section Headers</h4>
                                    <label>Kategori - Judul Utama</label>
                                    <input value={content.home.catTitlePrefix} onChange={(e) => handleInputChange('home', 'catTitlePrefix', e.target.value)} />
                                    <label>Kategori - Judul Gradien</label>
                                    <input value={content.home.catTitleAccent} onChange={(e) => handleInputChange('home', 'catTitleAccent', e.target.value)} />
                                    
                                    <label>Unggulan - Judul Utama</label>
                                    <input value={content.home.featuredTitlePrefix} onChange={(e) => handleInputChange('home', 'featuredTitlePrefix', e.target.value)} />
                                    <label>Unggulan - Judul Gradien</label>
                                    <input value={content.home.featuredTitleAccent} onChange={(e) => handleInputChange('home', 'featuredTitleAccent', e.target.value)} />
                                </div>

                                <div className="cms-form-group">
                                    <h4 className="cms-section-label">Why Us Section</h4>
                                    <label>Judul Baris 1</label>
                                    <input value={content.home.whyJaggadTitleLine1} onChange={(e) => handleInputChange('home', 'whyJaggadTitleLine1', e.target.value)} />
                                    <label>Judul Gradien</label>
                                    <input value={content.home.whyJaggadTitleLine2} onChange={(e) => handleInputChange('home', 'whyJaggadTitleLine2', e.target.value)} />
                                    <label>Sub-judul</label>
                                    <textarea value={content.home.whyJaggadSubtitle} onChange={(e) => handleInputChange('home', 'whyJaggadSubtitle', e.target.value)} rows="3" />
                                </div>
                                
                                <div className="cms-form-group" style={{ padding: '15px', background: 'var(--color-bg-secondary)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                        <h4 className="cms-section-label" style={{ marginBottom: 0, color: 'var(--color-accent)' }}>Fitur Unggulan (Cards)</h4>
                                        <button className="btn-cms-action" onClick={() => {
                                            const newFeatures = [...(content.home.features || []), { icon: 'Zap', title: 'Fitur Baru', desc: 'Deskripsi fitur baru Anda di sini.' }];
                                            handleInputChange('home', 'features', newFeatures);
                                        }}><Plus size={14} /> Tambah</button>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {(content.home.features || []).map((feat, idx) => {
                                            const IconComp = availableIcons[feat.icon] || Zap;
                                            return (
                                                <div key={idx} style={{ padding: 15, background: 'var(--color-bg)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <div style={{ padding: 6, background: 'var(--color-accent)', borderRadius: 8, color: 'white' }}>
                                                                <IconComp size={14} />
                                                            </div>
                                                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-primary)' }}>Fitur #{idx + 1}</span>
                                                        </div>
                                                        <button style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => {
                                                            const newFeatures = (content.home.features || []).filter((_, i) => i !== idx);
                                                            handleInputChange('home', 'features', newFeatures);
                                                        }}><Trash2 size={14} /></button>
                                                    </div>
                                                    
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                        <div>
                                                            <label style={{ fontSize: 10, marginBottom: 4, display: 'block', fontWeight: 600 }}>Judul Fitur</label>
                                                            <input 
                                                                style={{ width: '100%', fontSize: 13, height: '36px', padding: '0 10px' }} 
                                                                value={feat.title} 
                                                                onChange={e => {
                                                                    const newFeatures = [...content.home.features];
                                                                    newFeatures[idx].title = e.target.value;
                                                                    handleInputChange('home', 'features', newFeatures);
                                                                }} 
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: 10, marginBottom: 4, display: 'block', fontWeight: 600 }}>Deskripsi</label>
                                                            <textarea 
                                                                style={{ width: '100%', fontSize: 12, minHeight: '60px', padding: '8px 10px', resize: 'vertical' }} 
                                                                value={feat.desc} 
                                                                onChange={e => {
                                                                    const newFeatures = [...content.home.features];
                                                                    newFeatures[idx].desc = e.target.value;
                                                                    handleInputChange('home', 'features', newFeatures);
                                                                }} 
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: 10, marginBottom: 6, display: 'block', fontWeight: 600 }}>Ikon</label>
                                                            <div style={{ 
                                                                display: 'grid', 
                                                                gridTemplateColumns: 'repeat(9, 1fr)', 
                                                                gap: 4,
                                                                background: 'var(--color-bg-secondary)',
                                                                padding: 6,
                                                                borderRadius: 8,
                                                                border: '1px solid var(--color-border)'
                                                            }}>
                                                                {Object.entries(availableIcons).map(([name, IconItem]) => (
                                                                    <button 
                                                                        key={name}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newFeatures = [...content.home.features];
                                                                            newFeatures[idx].icon = name;
                                                                            handleInputChange('home', 'features', newFeatures);
                                                                        }}
                                                                        style={{
                                                                            padding: 5,
                                                                            background: feat.icon === name ? 'var(--color-accent)' : 'transparent',
                                                                            border: 'none',
                                                                            borderRadius: 4,
                                                                            cursor: 'pointer',
                                                                            color: feat.icon === name ? 'white' : 'var(--color-text-muted)',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            transition: 'all 0.2s'
                                                                        }}
                                                                        title={name}
                                                                    >
                                                                        <IconItem size={12} />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="cms-form-group">
                                    <h4 className="cms-section-label">CTA Banner (Bottom)</h4>
                                    <label>Judul Banner</label>
                                    <input value={content.home.ctaBannerTitle} onChange={(e) => handleInputChange('home', 'ctaBannerTitle', e.target.value)} />
                                    <label>Deskripsi</label>
                                    <textarea value={content.home.ctaBannerDesc} onChange={(e) => handleInputChange('home', 'ctaBannerDesc', e.target.value)} rows="2" />
                                    <label>Teks Tombol</label>
                                    <input value={content.home.ctaBannerBtn} onChange={(e) => handleInputChange('home', 'ctaBannerBtn', e.target.value)} />
                                </div>
                            </>
                        )}

                        {activeTab === 'about' && (
                            <>
                                <div className="cms-form-group">
                                    <h4 className="cms-section-label">Hero About</h4>
                                    <label>Judul Fokus (Gradien)</label>
                                    <input value={content.about.heroTitle} onChange={(e) => handleInputChange('about', 'heroTitle', e.target.value)} />
                                    <label>Deskripsi Hero</label>
                                    <textarea value={content.about.heroDesc} onChange={(e) => handleInputChange('about', 'heroDesc', e.target.value)} rows="3" />
                                </div>

                                <div className="cms-form-group">
                                    <h4 className="cms-section-label">Cerita Kami</h4>
                                    <label>Judul Section</label>
                                    <input value={content.about.storyTitle} onChange={(e) => handleInputChange('about', 'storyTitle', e.target.value)} />
                                    <label>Paragraf 1</label>
                                    <textarea value={content.about.storyP1} onChange={(e) => handleInputChange('about', 'storyP1', e.target.value)} rows="4" />
                                    <label>Paragraf 2</label>
                                    <textarea value={content.about.storyP2} onChange={(e) => handleInputChange('about', 'storyP2', e.target.value)} rows="4" />
                                </div>

                                <div className="cms-form-group">
                                    <h4 className="cms-section-label">Visi & Misi</h4>
                                    <label>Judul Visi</label>
                                    <input value={content.about.visionTitle} onChange={(e) => handleInputChange('about', 'visionTitle', e.target.value)} />
                                    <label>Deskripsi Visi</label>
                                    <textarea value={content.about.visionDesc} onChange={(e) => handleInputChange('about', 'visionDesc', e.target.value)} rows="3" />
                                </div>
                                    
                                <div className="cms-form-group" style={{ padding: '15px', background: 'var(--color-bg-secondary)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                        <h4 className="cms-section-label" style={{ marginBottom: 0, color: 'var(--color-accent)' }}>Poin-poin Misi</h4>
                                        <button className="btn-cms-action" onClick={() => {
                                            const newMissions = [...(content.about.missions || []), 'Point Misi Baru'];
                                            handleInputChange('about', 'missions', newMissions);
                                        }}><Plus size={14} /> Tambah</button>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {(content.about.missions || []).map((m, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                <div style={{ color: 'var(--color-text-muted)', fontSize: '11px', width: '20px' }}>#{idx+1}</div>
                                                <input 
                                                    style={{ flex: 1, width: '100%', height: '44px', fontSize: '14px', padding: '0 12px', color: 'var(--color-text-primary)', background: 'var(--color-bg)' }}
                                                    value={m} 
                                                    onChange={(e) => {
                                                        const newMissions = [...content.about.missions];
                                                        newMissions[idx] = e.target.value;
                                                        handleInputChange('about', 'missions', newMissions);
                                                    }} 
                                                />
                                                <button className="btn-icon" style={{ border: 'none', color: '#ef4444', padding: '5px' }} onClick={() => {
                                                    const newMissions = content.about.missions.filter((_, i) => i !== idx);
                                                    handleInputChange('about', 'missions', newMissions);
                                                }}><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="cms-form-group" style={{ padding: '15px', background: 'var(--color-bg-secondary)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                        <h4 className="cms-section-label" style={{ marginBottom: 0, color: 'var(--color-accent)' }}>Pencapaian (Achievements)</h4>
                                        <button className="btn-cms-action" onClick={() => {
                                            const newAch = [...(content.about.achievements || []), { label: 'Label', value: '0+', icon: 'Award' }];
                                            handleInputChange('about', 'achievements', newAch);
                                        }}><Plus size={14} /> Tambah</button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                                        {(content.about.achievements || []).map((ach, idx) => {
                                            const IconComp = availableIcons[ach.icon] || Trophy;
                                            return (
                                                <div key={idx} style={{ padding: 16, background: 'var(--color-accent)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                                                    {/* Decorative background circle */}
                                                    <div style={{ position: 'absolute', right: -20, top: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
                                                    
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center', position: 'relative', zIndex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <div style={{ padding: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)' }}>
                                                                <IconComp size={16} />
                                                            </div>
                                                            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Statistik #{idx + 1}</span>
                                                        </div>
                                                        <button style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => {
                                                            const newAch = content.about.achievements.filter((_, i) => i !== idx);
                                                            handleInputChange('about', 'achievements', newAch);
                                                        }}><X size={16} /></button>
                                                    </div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12, position: 'relative', zIndex: 1 }}>
                                                        <div>
                                                            <label style={{ fontSize: 10, marginBottom: 4, display: 'block', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Label</label>
                                                            <input 
                                                                style={{ width: '100%', fontSize: 13, height: '36px', padding: '0 10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8 }} 
                                                                value={ach.label} 
                                                                onChange={e => {
                                                                    const newAch = [...content.about.achievements];
                                                                    newAch[idx].label = e.target.value;
                                                                    handleInputChange('about', 'achievements', newAch);
                                                                }} 
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: 10, marginBottom: 4, display: 'block', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Nilai (Value)</label>
                                                            <input 
                                                                style={{ width: '100%', fontSize: 13, height: '36px', padding: '0 10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8 }} 
                                                                value={ach.value} 
                                                                onChange={e => {
                                                                    const newAch = [...content.about.achievements];
                                                                    newAch[idx].value = e.target.value;
                                                                    handleInputChange('about', 'achievements', newAch);
                                                                }} 
                                                            />
                                                        </div>
                                                    </div>

                                                    <div style={{ marginTop: 15, position: 'relative', zIndex: 1 }}>
                                                        <label style={{ fontSize: 10, marginBottom: 8, display: 'block', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Ganti Ikon</label>
                                                        <div style={{ 
                                                            display: 'grid', 
                                                            gridTemplateColumns: 'repeat(6, 1fr)', 
                                                            gap: 6,
                                                            background: 'rgba(0,0,0,0.15)',
                                                            padding: 8,
                                                            borderRadius: 12,
                                                            border: '1px solid rgba(255,255,255,0.1)'
                                                        }}>
                                                            {Object.entries(availableIcons).map(([name, IconComp]) => (
                                                                <button 
                                                                    key={name}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newAch = [...content.about.achievements];
                                                                        newAch[idx].icon = name;
                                                                        handleInputChange('about', 'achievements', newAch);
                                                                    }}
                                                                    style={{
                                                                        padding: 6,
                                                                        background: ach.icon === name ? 'white' : 'transparent',
                                                                        border: '1px solid',
                                                                        borderColor: ach.icon === name ? 'white' : 'transparent',
                                                                        borderRadius: 6,
                                                                        cursor: 'pointer',
                                                                        color: ach.icon === name ? 'var(--color-accent)' : 'rgba(255,255,255,0.4)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                    title={name}
                                                                >
                                                                    <IconComp size={14} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="cms-form-group" style={{ padding: '15px', background: 'var(--color-bg-secondary)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                        <h4 className="cms-section-label" style={{ marginBottom: 0, color: 'var(--color-accent)' }}>Perjalanan Tahunan (Milestones)</h4>
                                        <button className="btn-cms-action" onClick={() => {
                                            const newMS = [...(content.about.milestones || []), { year: '2025', text: 'Pencapaian baru' }];
                                            handleInputChange('about', 'milestones', newMS);
                                        }}><Plus size={14} /> Tambah</button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                                        {(content.about.milestones || []).map((ms, idx) => (
                                            <div key={idx} style={{ padding: 12, background: 'var(--color-bg)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                                                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Milestone #{idx + 1}</span>
                                                    <button style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => {
                                                        const newMS = content.about.milestones.filter((_, i) => i !== idx);
                                                        handleInputChange('about', 'milestones', newMS);
                                                    }}><Trash2 size={14} /></button>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                                                    <div>
                                                        <label style={{ fontSize: 11, marginBottom: 6, display: 'block', fontWeight: 600 }}>Tahun</label>
                                                        <input style={{ width: '120px', fontSize: 14, height: '40px', padding: '0 12px' }} value={ms.year} onChange={e => {
                                                            const newMS = [...content.about.milestones];
                                                            newMS[idx].year = e.target.value;
                                                            handleInputChange('about', 'milestones', newMS);
                                                        }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: 11, marginBottom: 6, display: 'block', fontWeight: 600 }}>Pencapaian</label>
                                                        <textarea style={{ width: '100%', fontSize: 14, minHeight: '80px', padding: '10px 12px', resize: 'vertical' }} value={ms.text} onChange={e => {
                                                            const newMS = [...content.about.milestones];
                                                            newMS[idx].text = e.target.value;
                                                            handleInputChange('about', 'milestones', newMS);
                                                        }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'contact' && (
                            <>
                                <div className="cms-form-group">
                                <h4 className="cms-section-label">Kontak & Support</h4>
                                <label>Judul Utama</label>
                                <input value={content.contact.title} onChange={(e) => handleInputChange('contact', 'title', e.target.value)} />
                                <label>Sub-judul</label>
                                <textarea value={content.contact.subtitle} onChange={(e) => handleInputChange('contact', 'subtitle', e.target.value)} rows="2" />
                                <label>Alamat Email</label>
                                <input value={content.contact.email} onChange={(e) => handleInputChange('contact', 'email', e.target.value)} />
                                <label>WhatsApp / Phone</label>
                                <input value={content.contact.phone} onChange={(e) => handleInputChange('contact', 'phone', e.target.value)} />
                                <label>Alamat Kantor</label>
                                <textarea value={content.contact.address} onChange={(e) => handleInputChange('contact', 'address', e.target.value)} rows="3" />
                                <label>Google Maps URL (Untuk Button & Footer)</label>
                                <input value={content.contact.mapsUrl} onChange={(e) => handleInputChange('contact', 'mapsUrl', e.target.value)} placeholder="https://maps.app.goo.gl/..." />
                            </div>

                            <div className="cms-form-group">
                                <h4 className="cms-section-label">Media Sosial</h4>
                                <label>Instagram URL</label>
                                <input value={content.social.instagram} onChange={(e) => handleInputChange('social', 'instagram', e.target.value)} placeholder="https://instagram.com/..." />
                                
                                <label>YouTube URL</label>
                                <input value={content.social.youtube} onChange={(e) => handleInputChange('social', 'youtube', e.target.value)} placeholder="https://youtube.com/..." />
                                
                                <label>Twitter / X URL</label>
                                <input value={content.social.twitter} onChange={(e) => handleInputChange('social', 'twitter', e.target.value)} placeholder="https://twitter.com/..." />
                            </div>
                        </>
                        )}

                        {activeTab === 'checkout' && (
                            <>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(4, 1fr)', 
                                    gap: 6, 
                                    marginBottom: 20, 
                                    padding: 6, 
                                    background: 'var(--color-bg-secondary)', 
                                    borderRadius: 14,
                                    border: '1px solid var(--color-border)'
                                }}>
                                    {['Pengantar', 'Produk', 'Penjelasan', 'Checkout'].map((s, i) => (
                                        <button 
                                            key={s} 
                                            onClick={() => setActiveCheckoutStep(i)}
                                            className={`cms-tab-btn ${activeCheckoutStep === i ? 'active' : ''}`}
                                            style={{
                                                padding: '8px 4px',
                                                fontSize: 11,
                                                fontWeight: 800,
                                                borderRadius: 10,
                                                border: 'none',
                                                cursor: 'pointer',
                                                justifyContent: 'center',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                transition: 'all 0.2s',
                                                background: activeCheckoutStep === i ? 'var(--color-accent)' : 'transparent',
                                                color: activeCheckoutStep === i ? 'white' : 'var(--color-text-muted)',
                                            }}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>

                                <div className="cms-editor-fields-inner">
                                    {/* Section 1: Intro */}
                                    {activeCheckoutStep === 0 && (
                                        <div className="cms-form-group">
                                            <h4 className="cms-section-label">Langkah 1: Pengantar & Masalah</h4>
                                            <label>Judul Utama</label>
                                            <input value={content.checkout.introTitle} onChange={(e) => handleInputChange('checkout', 'introTitle', e.target.value)} />
                                            
                                            <label>Sub-judul</label>
                                            <textarea value={content.checkout.introSubtitle} onChange={(e) => handleInputChange('checkout', 'introSubtitle', e.target.value)} rows="3" />
                                            
                                            <label>Quote Motivasi</label>
                                            <textarea value={content.checkout.introQuote} onChange={(e) => handleInputChange('checkout', 'introQuote', e.target.value)} rows="3" />

                                            {/* Stats Cards */}
                                            <div style={{ marginTop: '20px', padding: '15px', background: 'var(--color-bg-secondary)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                                    <h5 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--color-accent)' }}>Kartu Statistik (Stats)</h5>
                                                    <button className="btn-cms-action" onClick={() => {
                                                        const newStats = [...(content.checkout.introStats || []), { icon: 'Star', value: '100+', label: 'Label Baru' }];
                                                        handleInputChange('checkout', 'introStats', newStats);
                                                    }}><Plus size={14} /> Tambah</button>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                    {(content.checkout.introStats || []).map((stat, idx) => {
                                                        const IconComp = availableIcons[stat.icon] || Zap;
                                                        return (
                                                            <div key={idx} style={{ padding: 12, background: 'var(--color-bg)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                        <div style={{ padding: 5, background: 'var(--color-accent)', borderRadius: 6, color: 'white' }}><IconComp size={12} /></div>
                                                                        <span style={{ fontSize: 11, fontWeight: 700 }}>Statistik #{idx + 1}</span>
                                                                    </div>
                                                                    <button className="btn-icon" style={{ color: '#ef4444' }} onClick={() => {
                                                                        const newStats = content.checkout.introStats.filter((_, i) => i !== idx);
                                                                        handleInputChange('checkout', 'introStats', newStats);
                                                                    }}><Trash2 size={14} /></button>
                                                                </div>
                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                                                                    <input value={stat.value} placeholder="Nilai" onChange={(e) => {
                                                                        const newStats = [...content.checkout.introStats];
                                                                        newStats[idx].value = e.target.value;
                                                                        handleInputChange('checkout', 'introStats', newStats);
                                                                    }} style={{ padding: '8px 10px', fontSize: '13px' }} />
                                                                    <input value={stat.label} placeholder="Label" onChange={(e) => {
                                                                        const newStats = [...content.checkout.introStats];
                                                                        newStats[idx].label = e.target.value;
                                                                        handleInputChange('checkout', 'introStats', newStats);
                                                                    }} style={{ padding: '8px 10px', fontSize: '13px' }} />
                                                                </div>

                                                                <div>
                                                                    <label style={{ fontSize: 10, marginBottom: 6, display: 'block', fontWeight: 600 }}>Pilih Ikon</label>
                                                                    <div style={{ 
                                                                        display: 'grid', 
                                                                        gridTemplateColumns: 'repeat(9, 1fr)', 
                                                                        gap: 4,
                                                                        background: 'var(--color-bg-secondary)',
                                                                        padding: 6,
                                                                        borderRadius: 8,
                                                                        border: '1px solid var(--color-border)'
                                                                    }}>
                                                                        {Object.entries(availableIcons).map(([name, IconItem]) => (
                                                                            <button 
                                                                                key={name}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const newStats = [...content.checkout.introStats];
                                                                                    newStats[idx].icon = name;
                                                                                    handleInputChange('checkout', 'introStats', newStats);
                                                                                }}
                                                                                style={{
                                                                                    padding: 5,
                                                                                    background: stat.icon === name ? 'var(--color-accent)' : 'transparent',
                                                                                    border: 'none',
                                                                                    borderRadius: 4,
                                                                                    cursor: 'pointer',
                                                                                    color: stat.icon === name ? 'white' : 'var(--color-text-muted)',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    transition: 'all 0.2s'
                                                                                }}
                                                                            >
                                                                                <IconItem size={12} />
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Problems List */}
                                            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                                                <h5 style={{ fontSize: 13, fontWeight: 700, marginBottom: 15, color: 'var(--color-accent)' }}>Daftar Poin (List Items)</h5>
                                                
                                                <label>Judul Seksi</label>
                                                <input value={content.checkout.problemSectionTitle} onChange={(e) => handleInputChange('checkout', 'problemSectionTitle', e.target.value)} placeholder="Contoh: Apakah Anda merasakan ini?" />

                                                <label style={{ marginTop: 15 }}>Ikon Poin</label>
                                                <div style={{ 
                                                    display: 'grid', 
                                                    gridTemplateColumns: 'repeat(9, 1fr)', 
                                                    gap: 4,
                                                    background: 'var(--color-bg-secondary)',
                                                    padding: 6,
                                                    borderRadius: 8,
                                                    border: '1px solid var(--color-border)',
                                                    marginBottom: 20
                                                }}>
                                                            {Object.entries(availableIcons).map(([name, IconItem]) => {
                                                                // Define color mapping for a "premium" look
                                                                const colors = {
                                                                    CheckCircle: '#10b981', Check: '#10b981', ShieldCheck: '#10b981',
                                                                    AlertTriangle: '#ffcc00', AlertCircle: '#ffcc00',
                                                                    Star: '#f59e0b', Zap: '#f59e0b', Lightbulb: '#f59e0b', Trophy: '#fbbf24', Award: '#fbbf24',
                                                                    Heart: '#ef4444', 
                                                                    Info: '#3b82f6', HelpCircle: '#3b82f6', Globe: '#3b82f6'
                                                                };
                                                                const iconColor = colors[name] || 'var(--color-text-muted)';
                                                                const isAlert = name === 'AlertTriangle' || name === 'AlertCircle';
                                                                const isFilled = isAlert || ['Star', 'Heart', 'Zap'].includes(name);
                                                                const isActive = content.checkout.problemIcon === name;

                                                                return (
                                                                    <button 
                                                                        key={name}
                                                                        type="button"
                                                                        onClick={() => handleInputChange('checkout', 'problemIcon', name)}
                                                                        style={{
                                                                            padding: 5,
                                                                            background: isActive ? 'var(--color-accent)' : 'transparent',
                                                                            border: 'none',
                                                                            borderRadius: 4,
                                                                            cursor: 'pointer',
                                                                            color: isActive ? 'white' : iconColor,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            transition: 'all 0.2s'
                                                                        }}
                                                                    >
                                                                        <IconItem 
                                                                            size={12} 
                                                                            fill={isFilled && !isActive ? iconColor : "none"} 
                                                                            stroke={isAlert && !isActive ? '#000' : (isActive ? 'white' : 'currentColor')}
                                                                            strokeWidth={isActive ? 3 : 2}
                                                                        />
                                                                    </button>
                                                                );
                                                            })}
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                                    <label style={{ margin: 0 }}>Isi Daftar</label>
                                                    <button className="btn-cms-action" onClick={() => {
                                                        const newP = [...content.checkout.problems, 'Item baru...'];
                                                        handleInputChange('checkout', 'problems', newP);
                                                    }}><Plus size={14} /> Tambah</button>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {content.checkout.problems.map((p, idx) => (
                                                        <div key={idx} className="form-added-item">
                                                            <input value={p} onChange={(e) => {
                                                                const newP = [...content.checkout.problems];
                                                                newP[idx] = e.target.value;
                                                                handleInputChange('checkout', 'problems', newP);
                                                            }} style={{ border: 'none', background: 'transparent', padding: 0, fontSize: 13, flex: 1 }} />
                                                            <button className="btn-remove" onClick={() => {
                                                                const newP = content.checkout.problems.filter((_, i) => i !== idx);
                                                                handleInputChange('checkout', 'problems', newP);
                                                            }}><Trash2 size={14} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Section 2: Produk */}
                                    {activeCheckoutStep === 1 && (
                                        <div className="cms-form-group">
                                            <h4 className="cms-section-label">Langkah 2: Detail Produk</h4>
                                            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: 15 }}>
                                                Bagian ini menampilkan detail dari produk yang dipilih pembeli secara dinamis.
                                            </p>
                                            <div style={{ padding: 15, background: 'var(--color-bg-secondary)', borderRadius: 12, border: '1px solid var(--color-border)', fontSize: 12 }}>
                                                💡 Produk yang tampil di preview adalah salah satu dari produk unggulan Anda. Data ini disinkronkan langsung dari Katalog Produk.
                                            </div>
                                        </div>
                                    )}

                                    {/* Section 3: Penjelasan */}
                                    {activeCheckoutStep === 2 && (
                                        <div className="cms-form-group">
                                            <h4 className="cms-section-label">Langkah 3: Penjelasan</h4>
                                            <label>Judul Atas (Label)</label>
                                            <input value={content.checkout.explanationTitle} onChange={(e) => handleInputChange('checkout', 'explanationTitle', e.target.value)} />
                                            
                                            <label>Heading Utama</label>
                                            <input value={content.checkout.explanationHeading} onChange={(e) => handleInputChange('checkout', 'explanationHeading', e.target.value)} />

                                            {/* Journey Steps */}
                                            <div style={{ marginTop: '20px', padding: '15px', background: 'var(--color-bg-secondary)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                                    <h5 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--color-accent)' }}>Langkah Perjalanan (Journey)</h5>
                                                    <button className="btn-cms-action" onClick={() => {
                                                        const nextNum = content.checkout.journeySteps.length + 1;
                                                        const newSteps = [...content.checkout.journeySteps, { num: nextNum, title: 'Langkah Baru', desc: 'Penjelasan singkat.' }];
                                                        handleInputChange('checkout', 'journeySteps', newSteps);
                                                    }}><Plus size={14} /> Tambah</button>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                    {content.checkout.journeySteps.map((step, idx) => (
                                                        <div key={idx} style={{ padding: 12, background: 'var(--color-bg)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                                                <span style={{ fontSize: 11, fontWeight: 700 }}>Langkah #{idx + 1}</span>
                                                                <button className="btn-icon" style={{ color: '#ef4444' }} onClick={() => {
                                                                    const newSteps = content.checkout.journeySteps.filter((_, i) => i !== idx);
                                                                    handleInputChange('checkout', 'journeySteps', newSteps);
                                                                }}><Trash2 size={14} /></button>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                                <div style={{ display: 'flex', gap: 10 }}>
                                                                    <input value={step.num} placeholder="No" onChange={(e) => {
                                                                        const newSteps = [...content.checkout.journeySteps];
                                                                        newSteps[idx].num = e.target.value;
                                                                        handleInputChange('checkout', 'journeySteps', newSteps);
                                                                    }} style={{ width: 50, padding: '6px', fontSize: '11px' }} />
                                                                    <input value={step.title} placeholder="Judul" onChange={(e) => {
                                                                        const newSteps = [...content.checkout.journeySteps];
                                                                        newSteps[idx].title = e.target.value;
                                                                        handleInputChange('checkout', 'journeySteps', newSteps);
                                                                    }} style={{ flex: 1, padding: '6px', fontSize: '11px' }} />
                                                                </div>
                                                                <textarea value={step.desc} placeholder="Deskripsi" onChange={(e) => {
                                                                    const newSteps = [...content.checkout.journeySteps];
                                                                    newSteps[idx].desc = e.target.value;
                                                                    handleInputChange('checkout', 'journeySteps', newSteps);
                                                                }} style={{ padding: '6px', fontSize: '11px', minHeight: '50px' }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* FAQ Section */}
                                            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                                    <h5 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--color-accent)' }}>Tanya Jawab (FAQ)</h5>
                                                    <button className="btn-cms-action" onClick={() => {
                                                        const newFaqs = [...(content.checkout.faqs || []), { q: 'Pertanyaan baru?', a: 'Jawaban baru di sini.' }];
                                                        handleInputChange('checkout', 'faqs', newFaqs);
                                                    }}><Plus size={14} /> Tambah</button>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                    {(content.checkout.faqs || []).map((faq, idx) => (
                                                        <div key={idx} style={{ padding: 12, background: 'var(--color-bg)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                                                <span style={{ fontSize: 11, fontWeight: 700 }}>FAQ #{idx + 1}</span>
                                                                <button className="btn-icon" style={{ color: '#ef4444' }} onClick={() => {
                                                                    const newFaqs = content.checkout.faqs.filter((_, i) => i !== idx);
                                                                    handleInputChange('checkout', 'faqs', newFaqs);
                                                                }}><Trash2 size={14} /></button>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                                <div>
                                                                    <label style={{ fontSize: 10, marginBottom: 4, display: 'block' }}>Pertanyaan</label>
                                                                    <input value={faq.q} onChange={(e) => {
                                                                        const newFaqs = [...content.checkout.faqs];
                                                                        newFaqs[idx].q = e.target.value;
                                                                        handleInputChange('checkout', 'faqs', newFaqs);
                                                                    }} style={{ padding: '8px 10px', fontSize: '13px' }} />
                                                                </div>
                                                                <div>
                                                                    <label style={{ fontSize: 10, marginBottom: 4, display: 'block' }}>Jawaban</label>
                                                                    <textarea value={faq.a} onChange={(e) => {
                                                                        const newFaqs = [...content.checkout.faqs];
                                                                        newFaqs[idx].a = e.target.value;
                                                                        handleInputChange('checkout', 'faqs', newFaqs);
                                                                    }} rows="3" style={{ padding: '8px 10px', fontSize: '12px' }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Section 4: Checkout */}
                                    {activeCheckoutStep === 3 && (
                                        <div className="cms-form-group">
                                            <h4 className="cms-section-label">Langkah 4: Checkout</h4>
                                            <label>Judul Utama</label>
                                            <input value={content.checkout.preCheckoutHeading} onChange={(e) => handleInputChange('checkout', 'preCheckoutHeading', e.target.value)} />
                                            
                                            <div style={{ marginTop: '15px' }}>
                                                <label>Teks Urgensi (Dari Ads Builder)</label>
                                                <div style={{ 
                                                    fontSize: '11px', 
                                                    color: 'var(--color-success)', 
                                                    background: 'var(--color-success-dim)', 
                                                    padding: '4px 10px', 
                                                    borderRadius: '4px',
                                                    marginBottom: '8px',
                                                    display: 'inline-block',
                                                    fontWeight: 600
                                                }}>
                                                    ✨ Diskon % Otomatis akan ditambahkan di depan teks ini
                                                </div>
                                                <input 
                                                    value={content.ads?.ctaSubtitle || content.checkout.preCheckoutUrgency} 
                                                    disabled
                                                    style={{ background: 'var(--color-bg-secondary)', cursor: 'not-allowed' }}
                                                    title="Ubah teks ini di menu Ads Builder"
                                                />
                                                <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                                    Teks ini sekarang disinkronkan dengan <strong>Ads Builder</strong> agar konsisten.
                                                </p>
                                            </div>

                                            {/* Includes List */}
                                            <div style={{ marginTop: '20px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                                    <label style={{ margin: 0 }}>Daftar "Yang Anda Dapatkan"</label>
                                                    <button className="btn-cms-action" onClick={() => {
                                                        const newI = [...content.checkout.preCheckoutIncludes, 'Item baru...'];
                                                        handleInputChange('checkout', 'preCheckoutIncludes', newI);
                                                    }}><Plus size={14} /> Tambah</button>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {content.checkout.preCheckoutIncludes.map((item, idx) => (
                                                        <div key={idx} className="form-added-item">
                                                            <input value={item} onChange={(e) => {
                                                                const newI = [...content.checkout.preCheckoutIncludes];
                                                                newI[idx] = e.target.value;
                                                                handleInputChange('checkout', 'preCheckoutIncludes', newI);
                                                            }} style={{ border: 'none', background: 'transparent', padding: 0, fontSize: 13, flex: 1 }} />
                                                            <button className="btn-remove" onClick={() => {
                                                                const newI = content.checkout.preCheckoutIncludes.filter((_, i) => i !== idx);
                                                                handleInputChange('checkout', 'preCheckoutIncludes', newI);
                                                            }}><Trash2 size={14} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeTab === 'branding' && (
                            <>
                                <div className="cms-form-group">
                                    <h4 className="cms-section-label">Identitas Visual</h4>
                                    <label>Nama Website (Utama)</label>
                                    <input value={content.branding.siteName} onChange={(e) => handleInputChange('branding', 'siteName', e.target.value)} placeholder="Contoh: JAGGAD" />
                                    
                                    <label>Tagline / Sub Nama</label>
                                    <input value={content.branding.siteTagline} onChange={(e) => handleInputChange('branding', 'siteTagline', e.target.value)} placeholder="Contoh: Academy" />
                                    
                                    <div style={{ marginTop: '20px', padding: '15px', background: 'var(--color-bg-secondary)', borderRadius: '12px', border: '1px dotted var(--color-border)' }}>
                                        <h5 style={{ fontSize: '13px', marginBottom: '10px' }}>Unggah File Brand</h5>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                            <div>
                                                <label>Logo Website</label>
                                                <div 
                                                    className="image-upload-zone small"
                                                    onClick={() => document.getElementById('logo-upload').click()}
                                                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                                                    onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        e.currentTarget.classList.remove('drag-over');
                                                        handleFileChange({ target: { files: e.dataTransfer.files } }, 'logo');
                                                    }}
                                                >
                                                    <input type="file" id="logo-upload" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                                                    {logoPreview || (content.branding.logo && !logoFile) ? (
                                                        <div className="image-preview-wrap">
                                                            <img src={logoPreview || (content.branding.logo.startsWith('http') ? content.branding.logo : `/storage/${content.branding.logo}`)} className="image-preview" alt="Logo" />
                                                            <div style={{ fontSize: '10px', marginTop: '5px' }}>Klik/Drop untuk ganti</div>
                                                        </div>
                                                    ) : (
                                                        <div className="upload-placeholder">
                                                            <ImageIcon size={20} />
                                                            <span style={{ fontSize: '12px' }}>Logo</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label>Favicon</label>
                                                <div 
                                                    className="image-upload-zone small"
                                                    onClick={() => document.getElementById('favicon-upload').click()}
                                                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                                                    onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        e.currentTarget.classList.remove('drag-over');
                                                        handleFileChange({ target: { files: e.dataTransfer.files } }, 'favicon');
                                                    }}
                                                >
                                                    <input type="file" id="favicon-upload" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'favicon')} />
                                                    {faviconPreview || (content.branding.favicon && !faviconFile) ? (
                                                        <div className="image-preview-wrap">
                                                            <img src={faviconPreview || (content.branding.favicon.startsWith('http') ? content.branding.favicon : `/storage/${content.branding.favicon}`)} style={{ width: '32px', height: '32px', objectFit: 'contain' }} alt="Fav" />
                                                            <div style={{ fontSize: '10px', marginTop: '5px' }}>Klik/Drop</div>
                                                        </div>
                                                    ) : (
                                                        <div className="upload-placeholder">
                                                            <Globe size={20} />
                                                            <span style={{ fontSize: '12px' }}>Icon</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '15px' }}>
                                            <label>URL Logo (Manual)</label>
                                            <input value={content.branding.logo} onChange={(e) => handleInputChange('branding', 'logo', e.target.value)} style={{ fontSize: '12px' }} />
                                            <label style={{ marginTop: '8px' }}>URL Favicon (Manual)</label>
                                            <input value={content.branding.favicon} onChange={(e) => handleInputChange('branding', 'favicon', e.target.value)} style={{ fontSize: '12px' }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="cms-form-group">
                                    <h4 className="cms-section-label">Preview Branding</h4>
                                    <div style={{ padding: '20px', background: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', width: '60px' }}>Navbar:</span>
                                            <div style={{ fontWeight: '800', fontSize: '18px', display: 'flex', gap: '4px' }}>
                                                <span style={{ color: 'var(--color-accent)' }}>{content.branding.siteName}</span>
                                                <span style={{ color: 'var(--color-text-primary)' }}>{content.branding.siteTagline}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', width: '60px' }}>Browser:</span>
                                            <div style={{ padding: '4px 12px', background: 'var(--color-bg-secondary)', borderRadius: '6px', fontSize: '12px', border: '1px solid var(--color-border)' }}>
                                                {content.branding.siteName} {content.branding.siteTagline} | Home
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="cms-sidebar-footer">
                        <button className="btn-admin-primary" onClick={handleSave} disabled={isSaving} style={{ width: '100%', justifyContent: 'center' }}>
                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                        </button>
                    </div>
                </aside>

                <main className="cms-preview-area">
                    <div className="cms-preview-wrapper" style={{ maxWidth: previewMode === 'mobile' ? '400px' : '100%' }}>
                        <header className="cms-preview-header">
                            <button className="cms-toggle-btn" onClick={() => setHideSidebar(!hideSidebar)} title={hideSidebar ? "Show Sidebar" : "Hide Sidebar"}>
                                {hideSidebar ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                            </button>

                            <div className="cms-url-bar">jaggad.academy/{activeTab === 'home' ? '' : (activeTab === 'checkout' ? `checkout?step=${activeCheckoutStep + 1}` : activeTab)}</div>

                            <div style={{ display: 'flex', gap: 6 }}>
                                <button className={`cms-toggle-btn ${previewMode === 'desktop' ? 'active' : ''}`} onClick={() => setPreviewMode('desktop')}>
                                    <Monitor size={15} />
                                </button>
                                <button className={`cms-toggle-btn ${previewMode === 'mobile' ? 'active' : ''}`} onClick={() => setPreviewMode('mobile')}>
                                    <Smartphone size={15} />
                                </button>
                            </div>

                            <div className="cms-preview-badge">LIVE PREVIEW</div>
                        </header>

                        <div className="cms-preview-frame">
                            <div className="cms-preview-content guest-theme" style={{ zoom: hideSidebar ? (previewMode === 'mobile' ? 1 : 0.8) : (previewMode === 'mobile' ? 0.9 : 0.6), backgroundColor: 'var(--color-bg)' }}>
                                {renderPreview()}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AdminLayout>
    );
}
