import { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Save, Eye, EyeOff, Layout, Type, Image as ImageIcon, MessageSquare, Phone, MapPin, Globe, 
    Loader2, Monitor, Smartphone, PanelLeftClose, PanelLeftOpen, Target, Shield, BookOpen, 
    UserCheck, Zap, ArrowRight, Trash2, Plus, X, Users, Award, CheckCircle, Video, Mic, 
    Star, Heart, Rocket, Trophy, Lightbulb, TrendingUp, Construction, ShoppingCart,
    ShieldCheck, Clock, AlertTriangle, AlertCircle, Info, HelpCircle, CheckCircle2, ChevronDown,
    ArrowUpDown, Link as LinkIcon, ChevronUp, Play, MousePointerClick, Images, Youtube
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

const BLOCK_TYPES = [
    { type: 'image',   label: 'Gambar Tunggal',    icon: ImageIcon,          color: '#3b82f6' },
    // { type: 'slider',  label: 'Multiple Gambar (Slider)', icon: ImageIcon,       color: '#8b5cf6' },
    { type: 'youtube', label: 'Link YouTube',       icon: Play,            color: '#ef4444' },
    { type: 'button',  label: 'Tombol (→ Checkout)', icon: MousePointerClick, color: '#10b981' },
];

function getYoutubeEmbedId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\n?#]+)/);
    return match ? match[1] : null;
}

export default function AdminContent({ dbCategories = [], dbFeaturedProducts = [], dbAllProducts = [] }) {
    const { content, updateContent } = useContent();
    const [selectedPreviewProductId, setSelectedPreviewProductId] = useState(dbAllProducts[0]?.id || dbFeaturedProducts[0]?.id || 1);
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

    // Landing blocks state
    const [landingBlocks, setLandingBlocks] = useState([]);
    const [landingFaq, setLandingFaq] = useState([]);
    const [countdownHours, setCountdownHours] = useState('');
    const [landingQuotaText, setLandingQuotaText] = useState('');
    const [blockFiles, setBlockFiles] = useState({});
    const [showBlockPicker, setShowBlockPicker] = useState(false);

    useEffect(() => {
        const product = dbAllProducts.find(p => p.id == selectedPreviewProductId) || dbFeaturedProducts[0];
        if (product) {
            const blocks = Array.isArray(product.landing_blocks) ? product.landing_blocks : JSON.parse(product.landing_blocks || '[]');
            const formattedBlocks = blocks.filter(b => b.type !== 'faq').map(b => {
                if (b.type === 'slider') {
                    return { ...b, previews: [...(b.images || [])] };
                }
                return b;
            });
            setLandingBlocks(formattedBlocks);

            const faq = Array.isArray(product.landing_faq) ? product.landing_faq : JSON.parse(product.landing_faq || '[]');
            setLandingFaq(faq.length > 0 ? faq : [{ q: '', a: '' }]);

            setCountdownHours(product.countdown_hours || '');
            setLandingQuotaText(product.landing_quota_text || 'Kuota Hampir Penuh ‼️');
        } else {
            setLandingBlocks([]);
            setLandingFaq([{ q: '', a: '' }]);
            setCountdownHours('');
            setLandingQuotaText('Kuota Hampir Penuh ‼️');
        }
        setBlockFiles({});
    }, [selectedPreviewProductId, dbAllProducts, dbFeaturedProducts]);

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

    // ── Landing Block Handlers ──
    const addBlock = (type) => {
        let newBlock = { type };
        if (type === 'image') newBlock = { type, url: '', preview: '' };
        if (type === 'slider') newBlock = { type, images: [], previews: [] };
        if (type === 'youtube') newBlock = { type, url: '' };
        if (type === 'button') newBlock = { type, label: 'Beli Sekarang 🚀' };
        if (type === 'faq') newBlock = { type, items: [{ q: '', a: '' }] };
        setLandingBlocks(prev => [...prev, newBlock]);
        setShowBlockPicker(false);
    };

    const removeBlock = (idx) => {
        setLandingBlocks(prev => prev.filter((_, i) => i !== idx));
        setBlockFiles(prev => {
            const next = { ...prev };
            delete next[idx];
            return next;
        });
    };

    const moveBlock = (idx, dir) => {
        setLandingBlocks(prev => {
            const arr = [...prev];
            const targetIdx = idx + dir;
            if (targetIdx < 0 || targetIdx >= arr.length) return arr;
            [arr[idx], arr[targetIdx]] = [arr[targetIdx], arr[idx]];
            return arr;
        });
    };

    const updateBlock = (idx, patch) => {
        setLandingBlocks(prev => prev.map((b, i) => i === idx ? { ...b, ...patch } : b));
    };

    const handleBlockImageFile = (file, blockIdx) => {
        if (!file || !file.type.startsWith('image/')) return toast.error('File harus gambar');
        if (file.size > 10 * 1024 * 1024) return toast.error('Ukuran maks 10MB per gambar');
        const preview = URL.createObjectURL(file);
        updateBlock(blockIdx, { preview, url: '', file });
    };

    const handleSliderImageFiles = (files, blockIdx) => {
        const fileArr = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (fileArr.length === 0) return toast.error('Pilih file gambar');
        const oversized = fileArr.find(f => f.size > 10 * 1024 * 1024);
        if (oversized) return toast.error('Ukuran maks 10MB per gambar');

        const newPreviews = fileArr.map(f => URL.createObjectURL(f));
        
        setLandingBlocks(prev => prev.map((b, i) => {
            if (i !== blockIdx) return b;
            return {
                ...b,
                previews: [...(b.previews || []), ...newPreviews],
                images: [...(b.images || []), ...newPreviews.map(()=>'')],
                files: [...(b.files || Array((b.images || []).length).fill(null)), ...fileArr]
            };
        }));
    };

    const removeSliderImage = (blockIdx, imgIdx) => {
        setLandingBlocks(prev => prev.map((b, i) => {
            if (i !== blockIdx) return b;
            return {
                ...b,
                images: b.images.filter((_, idx) => idx !== imgIdx),
                previews: b.previews.filter((_, idx) => idx !== imgIdx),
                files: (b.files || []).filter((_, idx) => idx !== imgIdx),
            };
        }));
    };

    const saveLandingBlocks = () => {
        const product = dbAllProducts.find(p => p.id == selectedPreviewProductId);
        if (!product) return toast.error('Pilih produk dulu');

        const cleanBlocks = landingBlocks.map(block => {
            const { preview, previews, file, files, ...rest } = block;
            return rest;
        });

        const formData = new FormData();
        formData.append('_method', 'POST');
        formData.append('landingBlocks', JSON.stringify(cleanBlocks));
        formData.append('landingFaq', JSON.stringify(landingFaq.filter(f => f.q)));
        formData.append('countdownHours', countdownHours);
        formData.append('landingQuotaText', landingQuotaText);

        landingBlocks.forEach((block, blockIdx) => {
            if (block.type === 'image' && block.file) {
                formData.append(`landingBlockImages[${blockIdx}]`, block.file);
            } else if (block.type === 'slider' && block.files) {
                block.files.forEach((f, imgIdx) => {
                    if (f) formData.append(`landingBlockImages[${blockIdx}_${imgIdx}]`, f);
                });
            }
        });

        setIsSaving(true);
        router.post(route('admin.products.landing', product.slug), formData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Landing Page Produk diperbarui!');
                setIsSaving(false);
            },
            onError: (err) => {
                console.error("Validation error:", err);
                toast.error('Gagal menyimpan: ' + (Object.values(err)[0] || 'Periksa kembali data Anda'));
                setIsSaving(false);
            },
            onFinish: () => {
                setIsSaving(false);
            }
        });
    };

    const handleInputChange = (tab, field, value) => {
        updateContent(tab, field, value);
    };

    const baseCheckoutFields = Object.keys(content.checkout || {}).reduce((acc, key) => {
        if (isNaN(Number(key))) {
            acc[key] = content.checkout[key];
        }
        return acc;
    }, {});

    const checkoutData = content.checkout?.[selectedPreviewProductId] || baseCheckoutFields;

    const handleCheckoutChange = (field, value) => {
        const updatedProductCheckout = {
            ...checkoutData,
            [field]: value
        };
        updateContent('checkout', selectedPreviewProductId, updatedProductCheckout);
    };

    const renderPreview = () => {
        switch (activeTab) {
            case 'home': return <Welcome previewMode={true} products={dbFeaturedProducts} categories={dbCategories} />;
            case 'about': return <About previewMode={true} />;
            case 'contact': return <Contact previewMode={true} />;
            case 'checkout': {
                const selectedProduct = dbAllProducts?.find(p => p.id == selectedPreviewProductId) 
                    || dbFeaturedProducts?.find(p => p.id == selectedPreviewProductId) 
                    || dbFeaturedProducts[0] 
                    || { id: 1, title: 'Produk Demo', price: 500000, description: 'Deskripsi produk demo untuk preview CMS.' };
                
                return (
                    <ProductSales 
                        previewMode={true} 
                        activeStep={activeCheckoutStep} 
                        product={{ 
                            ...selectedProduct, 
                            landing_blocks: landingBlocks,
                            landing_faq: landingFaq,
                            countdown_hours: countdownHours,
                            landing_quota_text: landingQuotaText
                        }}
                    />
                );
            }
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
                            <ShoppingCart size={18} /> <span>Konten Product</span>
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
                                    gridTemplateColumns: 'repeat(2, 1fr)', 
                                    gap: 6, 
                                    marginBottom: 20, 
                                    padding: 6, 
                                    background: 'var(--color-bg-secondary)', 
                                    borderRadius: 14,
                                    border: '1px solid var(--color-border)'
                                }}>
                                    {['Produk', 'Checkout'].map((s, i) => (
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
                                    <div className="cms-form-group" style={{ marginBottom: '15px' }}>
                                        <h4 className="cms-section-label">Pilih Produk</h4>
                                        <div style={{ position: 'relative' }}>
                                            <select 
                                                value={selectedPreviewProductId} 
                                                onChange={(e) => setSelectedPreviewProductId(e.target.value)}
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '10px 35px 10px 12px', 
                                                    borderRadius: '8px', 
                                                    border: '1px solid var(--color-border)', 
                                                    background: 'var(--color-bg)', 
                                                    color: 'var(--color-text-primary)',
                                                    appearance: 'none',
                                                    WebkitAppearance: 'none',
                                                    MozAppearance: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {dbAllProducts && dbAllProducts.length > 0 ? (
                                                    dbAllProducts.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))
                                                ) : (
                                                    <option value="1">Produk Demo</option>
                                                )}
                                            </select>
                                            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                                                <ChevronDown size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 0: Produk */}
                                    {activeCheckoutStep === 0 && (
                                        <div className="cms-form-group">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                                <h4 className="cms-section-label" style={{ margin: 0 }}>Step 1: Produk (Landing Page)</h4>
                                            </div>
                                            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 15 }}>
                                                Atur blok konten landing page (gambar, slider, YouTube, tombol, FAQ) yang akan ditampilkan untuk produk yang sedang Anda pilih.
                                            </p>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                                {landingBlocks.length === 0 && (
                                                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--color-border)' }}>
                                                        <ArrowUpDown size={28} style={{ color: 'var(--color-text-muted)', margin: '0 auto 8px' }} />
                                                        <p style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 13 }}>Belum ada blok konten</p>
                                                    </div>
                                                )}

                                                {landingBlocks.map((block, idx) => {
                                                    const blockDef = BLOCK_TYPES.find(b => b.type === block.type);
                                                    const Icon = blockDef?.icon || ImageIcon;
                                                    return (
                                                        <div key={idx} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                                                            {/* Block header */}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: blockDef?.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                    <Icon size={16} style={{ color: blockDef?.color }} />
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <span style={{ fontWeight: 700, fontSize: 13 }}>{blockDef?.label}</span>
                                                                    <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>Blok #{idx + 1}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', gap: 4 }}>
                                                                    <button onClick={() => moveBlock(idx, -1)} disabled={idx === 0} style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? 'var(--color-border)' : 'var(--color-text-muted)' }} title="Naik">
                                                                        <ChevronUp size={16} />
                                                                    </button>
                                                                    <button onClick={() => moveBlock(idx, 1)} disabled={idx === landingBlocks.length - 1} style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', cursor: idx === landingBlocks.length - 1 ? 'not-allowed' : 'pointer', color: idx === landingBlocks.length - 1 ? 'var(--color-border)' : 'var(--color-text-muted)' }} title="Turun">
                                                                        <ChevronDown size={16} />
                                                                    </button>
                                                                    <button onClick={() => removeBlock(idx)} style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }} title="Hapus">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Block content editor */}
                                                            <div style={{ padding: 'var(--space-4)' }}>
                                                                {/* ── Image Block ── */}
                                                                {block.type === 'image' && (
                                                                    <div>
                                                                        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8 }}>Lebar optimal: <strong>1080px</strong>.</p>
                                                                        {(block.preview || block.url) ? (
                                                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                                                <img 
                                                                                    src={block.preview || (block.url?.startsWith('http') ? block.url : `/storage/${block.url}`)} 
                                                                                    alt="block" 
                                                                                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 12, objectFit: 'contain', background: '#000' }} 
                                                                                />
                                                                                <button onClick={() => { updateBlock(idx, { url: '', preview: '' }); setBlockFiles(prev => { const n = {...prev}; delete n[idx]; return n; }); }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>
                                                                                    <X size={12} />
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '30px 20px', border: '2px dashed var(--color-border)', borderRadius: 12, cursor: 'pointer', background: 'var(--color-bg-secondary)' }}>
                                                                                <ImageIcon size={24} style={{ color: 'var(--color-text-muted)' }} />
                                                                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Upload Gambar</span>
                                                                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleBlockImageFile(e.target.files[0], idx)} />
                                                                            </label>
                                                                        )}
                                                                        {!block.preview && (
                                                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
                                                                                <LinkIcon size={14} style={{ color: 'var(--color-text-muted)' }} />
                                                                                <input value={block.url || ''} onChange={e => updateBlock(idx, { url: e.target.value, preview: '' })} placeholder="Atau URL gambar..." style={{ flex: 1, padding: '8px 12px', fontSize: 13 }} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* ── Slider Block ── */}
                                                                {block.type === 'slider' && (
                                                                    <div>
                                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
                                                                            {(block.previews || []).map((prev, imgIdx) => (
                                                                                <div key={imgIdx} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#000' }}>
                                                                                    <img src={prev?.startsWith('blob:') || prev?.startsWith('http') ? prev : `/storage/${prev}`} alt={`slide${imgIdx}`} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                                                                                    <button onClick={() => removeSliderImage(idx, imgIdx)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}>
                                                                                        <X size={10} />
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, aspectRatio: '1/1', border: '2px dashed var(--color-border)', borderRadius: 8, cursor: 'pointer', background: 'var(--color-bg-secondary)' }}>
                                                                                <Plus size={20} style={{ color: 'var(--color-text-muted)' }} />
                                                                                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleSliderImageFiles(e.target.files, idx)} />
                                                                            </label>
                                                                        </div>
                                                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                                            <LinkIcon size={14} style={{ color: 'var(--color-text-muted)' }} />
                                                                            <input placeholder="Tempel URL dan Enter..." style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
                                                                                onKeyDown={e => {
                                                                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                                                                        const url = e.target.value.trim();
                                                                                        setLandingBlocks(prev => prev.map((b, i) => i === idx ? { ...b, images: [...(b.images || []), url], previews: [...(b.previews || []), url] } : b));
                                                                                        e.target.value = '';
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* ── YouTube Block ── */}
                                                                {block.type === 'youtube' && (
                                                                    <div>
                                                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                                            <Youtube size={20} style={{ color: '#ef4444' }} />
                                                                            <input 
                                                                                value={block.url || ''} 
                                                                                onChange={e => updateBlock(idx, { url: e.target.value })} 
                                                                                placeholder="Masukkan link YouTube (contoh: https://youtube.com/watch?v=...)" 
                                                                                style={{ flex: 1, padding: '10px 14px', fontSize: 14 }}
                                                                            />
                                                                        </div>
                                                                        {getYoutubeEmbedId(block.url) && (
                                                                            <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', maxWidth: 400 }}>
                                                                                <iframe width="100%" height="225" src={`https://www.youtube.com/embed/${getYoutubeEmbedId(block.url)}`} frameBorder="0" allowFullScreen></iframe>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* ── Button Block ── */}
                                                                {block.type === 'button' && (
                                                                    <div>
                                                                        <label style={{ fontSize: 11, marginBottom: 4, display: 'block' }}>Teks Tombol</label>
                                                                        <input 
                                                                            value={block.label || ''} 
                                                                            onChange={e => updateBlock(idx, { label: e.target.value })} 
                                                                            placeholder="Contoh: Beli Sekarang 🚀"
                                                                            style={{ width: '100%', padding: '10px 14px', fontSize: 14 }}
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* ── FAQ Block ── */}
                                                                {block.type === 'faq' && (
                                                                    <div>
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                                            {(block.items || []).map((faq, faqIdx) => (
                                                                                <div key={faqIdx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                                                        <input value={faq.q || ''} onChange={e => {
                                                                                            const newItems = [...block.items];
                                                                                            newItems[faqIdx] = { ...newItems[faqIdx], q: e.target.value };
                                                                                            updateBlock(idx, { items: newItems });
                                                                                        }} placeholder="Pertanyaan..." style={{ padding: '8px 12px', fontSize: 13 }} />
                                                                                        <textarea value={faq.a || ''} onChange={e => {
                                                                                            const newItems = [...block.items];
                                                                                            newItems[faqIdx] = { ...newItems[faqIdx], a: e.target.value };
                                                                                            updateBlock(idx, { items: newItems });
                                                                                        }} placeholder="Jawaban..." rows="2" style={{ padding: '8px 12px', fontSize: 13 }} />
                                                                                    </div>
                                                                                    <button onClick={() => {
                                                                                        const newItems = block.items.filter((_, i) => i !== faqIdx);
                                                                                        updateBlock(idx, { items: newItems });
                                                                                    }} style={{ padding: 8, background: 'var(--color-bg-secondary)', border: 'none', borderRadius: 8, color: '#ef4444', cursor: 'pointer' }}>
                                                                                        <Trash2 size={16} />
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        <button className="btn-cms-action" onClick={() => updateBlock(idx, { items: [...(block.items || []), { q: '', a: '' }] })} style={{ marginTop: 12 }}>
                                                                            <Plus size={14} /> Tambah FAQ
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {/* Add Block button */}
                                                <div style={{ position: 'relative', marginTop: 12 }}>
                                                    {showBlockPicker ? (
                                                        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                                                <h4 style={{ margin: 0, fontSize: 14 }}>Pilih Jenis Blok</h4>
                                                                <button onClick={() => setShowBlockPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                                                            </div>
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                                                                {BLOCK_TYPES.map(bt => (
                                                                    <button key={bt.type} onClick={() => addBlock(bt.type)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', border: '1px solid var(--color-border)', borderRadius: 12, background: 'var(--color-bg-secondary)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                                                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: bt.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                            <bt.icon size={20} style={{ color: bt.color }} />
                                                                        </div>
                                                                        <span style={{ fontWeight: 600, fontSize: 13 }}>{bt.label}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setShowBlockPicker(true)} style={{ width: '100%', padding: '20px', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-xl)', background: 'transparent', color: 'var(--color-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
                                                            <Plus size={20} /> Tambah Blok Konten
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Simpan Blok button */}
                                                <button 
                                                    disabled={isSaving} 
                                                    className="btn-admin-primary" 
                                                    onClick={saveLandingBlocks} 
                                                    style={{ width: '100%', justifyContent: 'center', marginTop: 16, background: 'var(--color-success)', borderColor: 'var(--color-success)', border: 'none' }}
                                                >
                                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Blok'}</span>
                                                </button>
                                            </div>

                                            {/* Countdown & Quota Configuration */}
                                            <div style={{ marginTop: 24, padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 16, border: '1px solid var(--color-border)' }}>
                                                <h4 style={{ margin: '0 0 4px 0', fontSize: 13, fontWeight: 700 }}>Pengaturan Hitung Mundur & Urgensi</h4>
                                                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                                                    Atur hitung mundur dan teks kuota untuk memicu efek urgensi (urgency marketing) di bagian navbar atas.
                                                </p>
                                                
                                                <div style={{ marginBottom: 14 }}>
                                                    <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 6 }}>Sisa Waktu Hitung Mundur (Jam)</label>
                                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                        <input 
                                                            type="number" 
                                                            min="0" 
                                                            placeholder="Contoh: 2 atau 24" 
                                                            value={countdownHours} 
                                                            onChange={e => setCountdownHours(e.target.value)} 
                                                            style={{ flex: 1, height: '40px', fontSize: '14px', padding: '0 12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8 }} 
                                                        />
                                                        <span style={{ fontSize: '13px', fontWeight: 600 }}>Jam</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 6 }}>Teks Keterangan Kuota</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Contoh: Kuota Hampir Penuh ‼️" 
                                                        value={landingQuotaText} 
                                                        onChange={e => setLandingQuotaText(e.target.value)} 
                                                        style={{ width: '100%', height: '40px', fontSize: '14px', padding: '0 12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8 }} 
                                                    />
                                                </div>
                                            </div>

                                            {/* Dedicated FAQ Editor Section */}
                                            <div style={{ marginTop: 24, padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 16, border: '1px solid var(--color-border)' }}>
                                                <h4 style={{ margin: '0 0 4px 0', fontSize: 13, fontWeight: 700 }}>Pengaturan FAQ (Selalu di Paling Bawah)</h4>
                                                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 16 }}>
                                                    Kustomisasi pertanyaan dan jawaban bantuan yang akan selalu ditampilkan di bagian terbawah landing page produk ini.
                                                </p>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                    {landingFaq.map((faq, faqIdx) => (
                                                        <div key={faqIdx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--color-bg)', padding: 12, borderRadius: 12, border: '1px solid var(--color-border)' }}>
                                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                                <input 
                                                                    value={faq.q || ''} 
                                                                    onChange={e => {
                                                                        const newFaq = [...landingFaq];
                                                                        newFaq[faqIdx] = { ...newFaq[faqIdx], q: e.target.value };
                                                                        setLandingFaq(newFaq);
                                                                    }} 
                                                                    placeholder="Pertanyaan..." 
                                                                    style={{ padding: '8px 12px', fontSize: 13, height: 36, width: '100%', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8 }} 
                                                                />
                                                                <textarea 
                                                                    value={faq.a || ''} 
                                                                    onChange={e => {
                                                                        const newFaq = [...landingFaq];
                                                                        newFaq[faqIdx] = { ...newFaq[faqIdx], a: e.target.value };
                                                                        setLandingFaq(newFaq);
                                                                    }} 
                                                                    placeholder="Jawaban..." 
                                                                    rows="2" 
                                                                    style={{ padding: '8px 12px', fontSize: 13, width: '100%', resize: 'vertical', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8 }} 
                                                                />
                                                            </div>
                                                            <button 
                                                                onClick={() => {
                                                                    const newFaq = landingFaq.filter((_, i) => i !== faqIdx);
                                                                    setLandingFaq(newFaq.length > 0 ? newFaq : [{ q: '', a: '' }]);
                                                                }} 
                                                                style={{ padding: 8, background: 'var(--color-bg-secondary)', border: 'none', borderRadius: 8, color: '#ef4444', cursor: 'pointer' }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                <button 
                                                    className="btn-cms-action" 
                                                    onClick={() => setLandingFaq(prev => [...prev, { q: '', a: '' }])} 
                                                    style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                                                >
                                                    <Plus size={14} /> Tambah FAQ Baru
                                                </button>
                                            </div>

                                        </div>
                                    )}

                                    {/* Step 1: Checkout */}
                                    {activeCheckoutStep === 1 && (
                                        <div className="cms-form-group">
                                            <h4 className="cms-section-label">Step 2: Checkout (Konfirmasi)</h4>
                                            <label>Judul Utama Halaman Checkout</label>
                                            <input value={checkoutData.preCheckoutHeading || ''} onChange={(e) => handleCheckoutChange('preCheckoutHeading', e.target.value)} />
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
