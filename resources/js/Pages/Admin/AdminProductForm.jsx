import { useState, useRef, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { Upload, X, ArrowLeft, Plus, Trash2, FileText, Video, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';
import toast from 'react-hot-toast';
import { getStorageUrl } from '../../Utils/helpers';
import './Admin.css';

export default function AdminProductForm({ dbCategories = [], product }) {
    const isEdit = Boolean(product);

    const toLocalISO = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().slice(0, 16);
    };

    const { data: form, setData: setForm, post, processing } = useForm({
        _method: isEdit ? 'PUT' : 'POST',
        title: product?.name || '', 
        category: product?.category_id || (dbCategories[0]?.id || ''), 
        price: product?.price || '', 
        originalPrice: product?.normal_price || '',
        description: product?.short_description || '', 
        longDescription: product?.description || '', 
        badge: product?.badge || '',
        startAt: toLocalISO(product?.start_at),
        endAt: toLocalISO(product?.end_at),
        location: product?.location || '',
        imageUrl: getStorageUrl(product?.image), 
        imageFile: null, 
        imagePreview: getStorageUrl(product?.image),
        benefits: product?.benefits ? (Array.isArray(product.benefits) ? product.benefits : JSON.parse(product.benefits)) : [],
        materials: product?.materials ? (Array.isArray(product.materials) ? product.materials : JSON.parse(product.materials)) : []
    });

    const [dragOver, setDragOver] = useState(false);
    const [newBenefit, setNewBenefit] = useState('');
    const [newMaterialTitle, setNewMaterialTitle] = useState('');
    const [newMaterialMeta, setNewMaterialMeta] = useState('');
    const [newMaterialLink, setNewMaterialLink] = useState('');

    const fileInputRef = useRef(null);

    const handleImageFile = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) return toast.error('File harus berupa gambar');
        if (file.size > 2 * 1024 * 1024) return toast.error('Ukuran file maksimal 2MB');
        const preview = URL.createObjectURL(file);
        setForm(prev => ({ ...prev, imageFile: file, imagePreview: preview }));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleImageFile(e.dataTransfer.files[0]);
    };

    const addBenefit = () => {
        if (!newBenefit.trim()) return;
        setForm(prev => ({ ...prev, benefits: [...prev.benefits, newBenefit.trim()] }));
        setNewBenefit('');
    };

    const addMaterial = () => {
        if (!newMaterialTitle.trim()) return;

        const title = newMaterialTitle.trim();
        const duration = newMaterialMeta.trim() || '';
        const link = newMaterialLink.trim();

        setForm(prev => ({
            ...prev,
            materials: [...prev.materials, { title, duration, link }]
        }));

        setNewMaterialTitle('');
        setNewMaterialMeta('');
        setNewMaterialLink('');
    };

    const handleSave = () => {
        if (!form.title || !form.price) return toast.error('Lengkapi data wajib produk (Judul & Harga)');

        if (form.startAt && form.endAt && new Date(form.endAt) < new Date(form.startAt)) {
            return toast.error('Waktu selesai tidak boleh mendahului waktu mulai');
        }

        post(isEdit ? route('admin.products.update', product.slug) : route('admin.products.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isEdit ? 'Produk berhasil diperbarui' : 'Produk baru berhasil ditambahkan');
            },
            onError: (e) => toast.error(Object.values(e)[0] || 'Gagal menyimpan produk')
        });
    };

    return (
        <AdminLayout>
            <Head title={`${isEdit ? 'Edit' : 'Tambah'} Produk - JAGGAD ACADEMY`} />
            <div className="admin-page">
                <div className="admin-page-header">
                    <button className="btn-icon" onClick={() => router.get(route('admin.products.index'))} style={{ marginBottom: 'var(--space-3)', display: 'inline-flex', gap: 6, alignItems: 'center', width: 'fit-content' }}>
                        <ArrowLeft size={16} /> Kembali
                    </button>
                    <h1>{isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}</h1>
                    <p className="admin-page-subtitle">Lengkapi formulir di bawah ini untuk mengelola detail produk dan materi pembelajaran.</p>
                </div>

                <div className="admin-table-card" style={{ padding: 'var(--space-6)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
                    {/* ─── GAMBAR PRODUK ─── */}
                    <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>1. Visual Produk</h3>
                    <div
                        className={`image-upload-zone ${dragOver ? 'drag-over' : ''}`}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        style={{ marginBottom: 'var(--space-4)' }}
                    >
                        {form.imagePreview ? (
                            <div className="image-preview-wrap">
                                <img src={form.imagePreview} alt="Preview" className="image-preview" />
                                <button className="image-remove-btn" onClick={e => { e.stopPropagation(); setForm(prev => ({ ...prev, imageFile: null, imagePreview: '', imageUrl: '' })); }}>
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <Upload size={28} />
                                <p>Drag & drop atau <span>klik untuk upload</span> gambar cover produk</p>
                                <p className="upload-hint">PNG, JPG, WebP · Maks 2MB · Rasio 16:9 disarankan</p>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageFile(e.target.files[0])} />
                    </div>

                    {!form.imagePreview && (
                        <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                            <label>Atau gunakan URL Gambar</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <LinkIcon size={18} style={{ color: 'var(--color-text-muted)', alignSelf: 'center' }} />
                                <input
                                    className="form-input"
                                    value={form.imageUrl}
                                    onChange={e => setForm({ ...form, imageUrl: e.target.value, imagePreview: e.target.value })}
                                    placeholder="https://contoh.com/gambar.jpg"
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>
                    )}

                    <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-8) 0' }} />

                    {/* ─── INFO DASAR ─── */}
                    <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>2. Informasi Dasar</h3>
                    <div className="modal-form" style={{ marginTop: 0, paddingBottom: 0 }}>
                        <div className="form-group">
                            <label>Judul Produk *</label>
                            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Masukkan nama produk" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                            <div className="form-group">
                                <label>Kategori</label>
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    {dbCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Badge Label (Opsional)</label>
                                <input value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="Contoh: Bestseller, Baru" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                            <div className="form-group">
                                <label>Waktu Mulai (Opsional)</label>
                                <div className="date-input-wrapper">
                                    <input type="datetime-local" className="form-input date-picker-custom" value={form.startAt} onChange={e => setForm({ ...form, startAt: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Waktu Selesai (Opsional)</label>
                                <div className="date-input-wrapper">
                                    <input type="datetime-local" className="form-input date-picker-custom" min={form.startAt} value={form.endAt} onChange={e => setForm({ ...form, endAt: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Lokasi (Opsional)</label>
                                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Contoh: Jakarta Selatan atau Via Zoom" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                            <div className="form-group">
                                <label>Harga Jual *</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-muted)' }}>Rp</span>
                                    <input type="number" style={{ paddingLeft: 40 }} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" />
                                </div>
                            </div>
                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label>Harga Normal (Membentuk diskon coret)</label>
                                    {form.originalPrice > form.price && form.price > 0 && (
                                        <span style={{ fontSize: '11px', background: 'var(--color-accent-dim)', color: 'var(--color-accent-light)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                            Hemat {Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100)}%
                                        </span>
                                    )}
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-muted)' }}>Rp</span>
                                    <input type="number" style={{ paddingLeft: 40 }} value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} placeholder="0" />
                                </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                            <label>Deskripsi Singkat (Tampil di Katalog/Card)</label>
                            <textarea rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ringkasan produk..." />
                        </div>

                        <div className="form-group">
                            <label>Deskripsi Lengkap (Tampil di Halaman Penjualan)</label>
                            <textarea rows="5" value={form.longDescription} onChange={e => setForm({ ...form, longDescription: e.target.value })} placeholder="Penjelasan detail tentang produk yang meyakinkan pembeli..." />
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-8) 0' }} />

                    {/* ─── SALES FUNNEL & MATERI ─── */}
                    <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>3. Konten Funnel & Materi Belajar</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)' }}>
                        {/* Benefits */}
                        <div className="form-group" style={{ padding: 'var(--space-4)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                            <label style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>Benefit / Apa yang didapat</label>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>Tambahkan poin-poin keuntungan membeli produk ini.</p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input value={newBenefit} onChange={e => setNewBenefit(e.target.value)} placeholder="Contoh: Akses grup alumni premium..." onKeyDown={e => e.key === 'Enter' && addBenefit()} style={{ flex: 1 }} />
                                <button type="button" className="btn-modal-save" style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)' }} onClick={addBenefit}>+ Tambah</button>
                            </div>
                            {form.benefits.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                                    {form.benefits.map((b, i) => (
                                        <div key={i} className="form-added-item">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <CheckCircle2 size={14} className="color-accent" style={{ color: 'var(--color-accent)' }} />
                                                <span style={{ fontWeight: 500 }}>{b}</span>
                                            </div>
                                            <button type="button" className="btn-remove" onClick={() => setForm(prev => ({ ...prev, benefits: prev.benefits.filter((_, idx) => idx !== i) }))}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pembelajaran / Silabus */}
                        <div className="form-group" style={{ padding: 'var(--space-4)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                            <label style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>Materi Pembelajaran / Silabus</label>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>Tulis manual judul bab/materi beserta link (Zoom, Google Drive, YouTube, dll).</p>

                            <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
                                <input value={newMaterialTitle} onChange={e => setNewMaterialTitle(e.target.value)} placeholder="Judul bab/materi..." style={{ flex: 2 }} onKeyDown={e => e.key === 'Enter' && addMaterial()} />
                                <input value={newMaterialMeta} onChange={e => setNewMaterialMeta(e.target.value)} placeholder="Durasi/Meta (opsional)" style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && addMaterial()} />
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 12px' }}>
                                    <LinkIcon size={14} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
                                    <input value={newMaterialLink} onChange={e => setNewMaterialLink(e.target.value)} placeholder="Link eksternal (Zoom, GDrive, dll) - Opsional" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', height: '100%', padding: '10px 8px', color: 'var(--color-text-primary)' }} onKeyDown={e => e.key === 'Enter' && addMaterial()} />
                                </div>
                                <button type="button" className="btn-modal-save" style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)' }} onClick={addMaterial}>+ Tambah</button>
                            </div>

                            {form.materials.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                                    {form.materials.map((m, i) => (
                                        <div key={i} className="form-added-item">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span className="item-index">{String(i + 1).padStart(2, '0')}</span>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{ fontWeight: 600 }}>{m.title}</span>
                                                        {m.duration && (
                                                            <span style={{ color: 'var(--color-accent)', fontSize: '10px', padding: '1px 6px', background: 'var(--color-accent-dim)', borderRadius: 4, fontWeight: 700 }}>
                                                                {m.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {m.link && (
                                                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <LinkIcon size={10} /> {m.link}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button type="button" className="btn-remove" onClick={() => setForm(prev => ({ ...prev, materials: prev.materials.filter((_, idx) => idx !== i) }))}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)' }}>
                        <button disabled={processing} className="btn-modal-cancel" onClick={() => router.get(route('admin.products.index'))}>Batal</button>
                        <button disabled={processing} className="btn-modal-save" style={{ padding: 'var(--space-3) var(--space-6)' }} onClick={handleSave}>
                            {processing ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Buat Produk Baru')}
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
