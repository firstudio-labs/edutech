import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Save, Eye, EyeOff, Layout, Type, Image as ImageIcon, MessageSquare, Phone, MapPin, Globe, 
    Loader2, Monitor, Smartphone, PanelLeftClose, PanelLeftOpen, Target, Shield, BookOpen, 
    UserCheck, Zap, ArrowRight, Trash2, Plus, X, Users, Award, CheckCircle, Video, Mic, 
    Star, Heart, Rocket, Trophy, Lightbulb, TrendingUp, Construction 
} from 'lucide-react';
import { useContent } from '../../Contexts/ContentContext';
import AdminLayout from '../../Layouts/AdminLayout';
import toast from 'react-hot-toast';
import './Admin.css';

// Import guest components for preview
import Welcome from '../Guest/Welcome';
import About from '../Guest/About';
import Contact from '../Guest/Contact';

const availableIcons = {
    Users, Target, Eye, BookOpen, Award, Zap, Shield, CheckCircle,
    Video, Mic, MessageSquare, Globe, Star, Heart, Rocket, Trophy, Lightbulb, TrendingUp
};

export default function AdminContent({ dbCategories = [], dbFeaturedProducts = [] }) {
    const { content, updateContent } = useContent();
    const [activeTab, setActiveTab] = useState('home');
    const [isSaving, setIsSaving] = useState(false);
    const [hideSidebar, setHideSidebar] = useState(false);
    const [previewMode, setPreviewMode] = useState('desktop');

    const handleSave = () => {
        setIsSaving(true);
        router.post(route('admin.content.store'), { 
            home: content.home, 
            about: content.about, 
            contact: content.contact,
            social: content.social
        }, {
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
            default: return null;
        }
    };

    return (
        <AdminLayout>
            <Head title="Editor Konten - JAGGAD ACADEMY" />

            <div className="admin-page">
                <div className="admin-page-header">
                    <h1>Editor Konten</h1>
                    <p className="admin-page-subtitle">Kustomisasi teks dan visual landing page Academy Anda</p>
                </div>

            <div className="admin-cms-layout">
                <aside className={`cms-sidebar ${hideSidebar ? 'collapsed' : ''}`}>
                    <div className="cms-sidebar-header">
                        <h2>Editor Visual</h2>
                        <p>Kustomisasi teks dan visual landing page</p>
                    </div>

                    <div className="cms-tabs">
                        <button className={`cms-tab-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
                            <Layout size={18} /> <span>Home</span>
                        </button>
                        <button className={`cms-tab-btn ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
                            <Type size={18} /> <span>About</span>
                        </button>
                        <button className={`cms-tab-btn ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>
                            <Phone size={18} /> <span>Contact</span>
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
                                    
                                <div className="cms-form-group" style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                        <h4 className="cms-section-label" style={{ marginBottom: 0, color: 'var(--color-accent)' }}>Poin-poin Misi</h4>
                                        <button className="btn-icon" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => {
                                            const newMissions = [...(content.about.missions || []), 'Point Misi Baru'];
                                            handleInputChange('about', 'missions', newMissions);
                                        }}><Plus size={14} /> Tambah</button>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {(content.about.missions || []).map((m, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                <div style={{ color: 'var(--color-text-muted)', fontSize: '11px', width: '20px' }}>#{idx+1}</div>
                                                <input 
                                                    style={{ flex: 1, width: '100%', height: '44px', fontSize: '14px', padding: '0 12px' }}
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

                                <div className="cms-form-group" style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                        <h4 className="cms-section-label" style={{ marginBottom: 0, color: 'var(--color-accent)' }}>Pencapaian (Achievements)</h4>
                                        <button className="btn-icon" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => {
                                            const newAch = [...(content.about.achievements || []), { label: 'Label', value: '0+', icon: 'Award' }];
                                            handleInputChange('about', 'achievements', newAch);
                                        }}><Plus size={14} /> Tambah</button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                                        {(content.about.achievements || []).map((ach, idx) => (
                                            <div key={idx} style={{ padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                                                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Card #{idx + 1}</span>
                                                    <button style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => {
                                                        const newAch = content.about.achievements.filter((_, i) => i !== idx);
                                                        handleInputChange('about', 'achievements', newAch);
                                                    }}><Trash2 size={14} /></button>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                                                    <div>
                                                        <label style={{ fontSize: 11, marginBottom: 6, display: 'block', fontWeight: 600 }}>Label</label>
                                                        <input style={{ width: '100%', fontSize: 14, height: '40px', padding: '0 12px' }} value={ach.label} onChange={e => {
                                                            const newAch = [...content.about.achievements];
                                                            newAch[idx].label = e.target.value;
                                                            handleInputChange('about', 'achievements', newAch);
                                                        }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: 11, marginBottom: 6, display: 'block', fontWeight: 600 }}>Value</label>
                                                        <input style={{ width: '100%', fontSize: 14, height: '40px', padding: '0 12px' }} value={ach.value} onChange={e => {
                                                            const newAch = [...content.about.achievements];
                                                            newAch[idx].value = e.target.value;
                                                            handleInputChange('about', 'achievements', newAch);
                                                        }} />
                                                    </div>
                                                </div>
                                                <div style={{ marginTop: 12 }}>
                                                    <label style={{ fontSize: 11, marginBottom: 8, display: 'block', fontWeight: 600 }}>Pilih Ikon</label>
                                                    <div style={{ 
                                                        display: 'grid', 
                                                        gridTemplateColumns: 'repeat(6, 1fr)', 
                                                        gap: 8,
                                                        background: 'rgba(0,0,0,0.2)',
                                                        padding: 10,
                                                        borderRadius: 8,
                                                        border: '1px solid rgba(255,255,255,0.05)'
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
                                                                    padding: 8,
                                                                    background: ach.icon === name ? 'var(--color-accent)' : 'transparent',
                                                                    border: '1px solid',
                                                                    borderColor: ach.icon === name ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                                                                    borderRadius: 6,
                                                                    cursor: 'pointer',
                                                                    color: ach.icon === name ? 'white' : 'var(--color-text-muted)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                title={name}
                                                            >
                                                                <IconComp size={16} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="cms-form-group" style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                        <h4 className="cms-section-label" style={{ marginBottom: 0, color: 'var(--color-accent)' }}>Perjalanan Tahunan (Milestones)</h4>
                                        <button className="btn-icon" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => {
                                            const newMS = [...(content.about.milestones || []), { year: '2025', text: 'Pencapaian baru' }];
                                            handleInputChange('about', 'milestones', newMS);
                                        }}><Plus size={14} /> Tambah</button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                                        {(content.about.milestones || []).map((ms, idx) => (
                                            <div key={idx} style={{ padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
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

                            <div className="cms-url-bar">jaggad.academy/{activeTab === 'home' ? '' : activeTab}</div>

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
                            <div className="cms-preview-content" style={{ zoom: hideSidebar ? (previewMode === 'mobile' ? 1 : 0.8) : (previewMode === 'mobile' ? 0.9 : 0.6) }}>
                                {renderPreview()}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </AdminLayout>
    );
}
