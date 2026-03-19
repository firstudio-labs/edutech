import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Save, Loader2, PanelsTopLeft, MousePointer2, Type, Image as ImageIcon, CheckCircle2, Layout, Monitor, Smartphone, PanelLeftClose, PanelLeftOpen, PackagePlus, Trash2, Copy } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';
import toast from 'react-hot-toast';
import './Admin.css';

// Import guest Ads component for preview
import Ads from '../Guest/Ads';

export default function AdminAds({ dbAds, products = [] }) {
    const parseList = (data) => typeof data === 'string' ? JSON.parse(data) : (data || []);
    const savedContent = typeof dbAds === 'string' ? JSON.parse(dbAds) : dbAds;

    const [adsContent, setAdsContent] = useState({
        title: savedContent?.title || savedContent?.heroTitle || 'Rahasia Digital Marketing Yang Belum Pernah Dibocorkan',
        subtitle: savedContent?.subtitle || savedContent?.heroSubtitle || 'Dapatkan Akses Eksklusif Ke Strategi Yang Digunakan Para Expert Untuk Mencapai 1M Pertama Mereka Dari Produk Digital.',
        videoUrl: savedContent?.videoUrl || '',
        ctaTitle: savedContent?.ctaTitle || 'AMBIL PROMO SEKARANG',
        ctaSubtitle: savedContent?.ctaSubtitle || 'Berakhir Dalam 15 Menit',
        selectedProductIds: savedContent?.selectedProductIds || []
    });

    const [isSaving, setIsSaving] = useState(false);
    const [hideSidebar, setHideSidebar] = useState(false);
    const [previewMode, setPreviewMode] = useState('desktop');

    const handleSave = () => {
        setIsSaving(true);
        router.post(route('admin.ads.store'), adsContent, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSaving(false);
                toast.success('Landing Page Ads berhasil dipublikasikan!');
            },
            onError: (errors) => {
                setIsSaving(false);
                toast.error(Object.values(errors)[0] || 'Gagal menyimpan perubahan.');
            }
        });
    };

    const handleCopyUrl = () => {
        const url = route('ads');
        navigator.clipboard.writeText(url);
        toast.success('URL Penawaran berhasil disalin!');
    };

    const handleInput = (f, v) => setAdsContent(prev => ({ ...prev, [f]: v }));

    const addProduct = (productId) => {
        if (!productId) return;
        const numId = Number(productId);
        const currentIds = adsContent.selectedProductIds || [];
        if (currentIds.includes(numId)) {
            return toast.error('Produk sudah dipilih');
        }
        handleInput('selectedProductIds', [...currentIds, numId]);
    };

    const removeProduct = (productId) => {
        const currentIds = adsContent.selectedProductIds || [];
        handleInput(
            'selectedProductIds',
            currentIds.filter(id => id !== productId)
        );
    };

    const selectedProducts = (adsContent.selectedProductIds || []).map(id => products.find(p => p.id === id)).filter(Boolean);
    const unselectedProducts = products.filter(p => !(adsContent.selectedProductIds || []).includes(p.id));

    return (
        <AdminLayout>
            <Head title="Ads Builder - JAGGAD ACADEMY" />
            <div className="admin-cms-layout">
                {/* CMS Sidebar */}
                <aside className={`cms-sidebar ${hideSidebar ? 'collapsed' : ''}`}>
                    <div className="cms-sidebar-header">
                        <h2>Ads Builder</h2>
                        <p>Kustomisasi Landing Page Khusus Ads / Promo</p>
                    </div>

                    <div className="cms-editor-fields">
                        <div className="cms-form-group">
                            <h4 className="cms-section-label">Headline & Video</h4>
                            <label>Judul Headline (H1)</label>
                            <textarea
                                value={adsContent.title || ''}
                                onChange={(e) => handleInput('title', e.target.value)}
                                rows="3"
                            />
                            <label>Sub-headline</label>
                            <textarea
                                value={adsContent.subtitle || ''}
                                onChange={(e) => handleInput('subtitle', e.target.value)}
                                rows="3"
                            />
                            <label>Embedded Video URL (YouTube/Vimeo)</label>
                            <input
                                value={adsContent.videoUrl || ''}
                                onChange={(e) => handleInput('videoUrl', e.target.value)}
                                placeholder="https://youtube.com/embed/..."
                            />
                        </div>

                        <hr style={{ borderTop: '1px solid var(--color-border)', margin: 'var(--space-6) 0' }} />
                        <div className="cms-form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', margin: 0 }}>
                                <PackagePlus size={16} /> Produk yang Ditawarkan
                            </label>
                            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: 8, marginTop: 4 }}>
                                Pilih produk dari database untuk ditampilkan di landing page promo ini.
                            </p>
                            <div style={{ 
                                fontSize: '11px', 
                                color: 'var(--color-accent-light)', 
                                background: 'var(--color-accent-dim)', 
                                padding: '6px 12px', 
                                borderRadius: '4px',
                                marginBottom: '12px',
                                display: 'block',
                                fontWeight: 500
                            }}>
                                💡 Benefit "Apa yang Akan Anda Dapatkan" sekarang otomatis diambil dari data produk yang Anda pilih.
                            </div>

                            <select
                                onChange={(e) => {
                                    addProduct(e.target.value);
                                    e.target.value = ''; // Reset select after adding
                                }}
                                value=""
                                className="form-input"
                                style={{ marginBottom: 15, width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}
                            >
                                <option value="" disabled>-- Tambah Produk ke Ads --</option>
                                {unselectedProducts.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} - Rp{p.price ? p.price.toLocaleString('id-ID') : 0}</option>
                                ))}
                            </select>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {selectedProducts.map(p => (
                                    <div key={p.id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '10px 12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{p.name}</span>
                                            <span style={{ fontSize: '11px', color: 'var(--color-success)' }}>Rp {p.price ? p.price.toLocaleString('id-ID') : 0}</span>
                                        </div>
                                        <button type="button" onClick={() => removeProduct(p.id)} style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {selectedProducts.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: 20, fontSize: 13, color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                                        Belum ada produk yang dipilih
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="cms-form-group">
                            <h4 className="cms-section-label">Call To Action (CTA)</h4>
                            <label>Teks Tombol</label>
                            <input
                                value={adsContent.ctaTitle || ''}
                                onChange={(e) => handleInput('ctaTitle', e.target.value)}
                            />
                            <label>Sub-teks Tombol (Urgency)</label>
                            <div style={{ position: 'relative' }}>
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
                                    value={adsContent.ctaSubtitle || ''}
                                    onChange={(e) => handleInput('ctaSubtitle', e.target.value)}
                                    placeholder="Contoh: Berakhir Dalam 15 Menit"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="cms-sidebar-footer">
                        <button className="btn-admin-primary" onClick={handleSave} disabled={isSaving} style={{ width: '100%', justifyContent: 'center' }}>
                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            <span>{isSaving ? 'Publish Landing Page' : 'Publikasikan'}</span>
                        </button>
                    </div>
                </aside>

                {/* CMS Preview */}
                <main className="cms-preview-area">
                    <div className="cms-preview-wrapper" style={{ maxWidth: previewMode === 'mobile' ? '400px' : '100%' }}>
                        <header className="cms-preview-header">
                            <button className="cms-toggle-btn" onClick={() => setHideSidebar(!hideSidebar)}>
                                {hideSidebar ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                            </button>
                            <div className="cms-url-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>URL Aktif:</span> 
                                <a href={route('ads')} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent-light)' }}>
                                    {route('ads')}
                                </a>
                                <button onClick={handleCopyUrl} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: 4 }} title="Copy URL Penawaran">
                                    <Copy size={14} />
                                </button>
                            </div>
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
                                <Ads previewMode={true} customData={adsContent} dbProducts={products} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AdminLayout>
    );
}
