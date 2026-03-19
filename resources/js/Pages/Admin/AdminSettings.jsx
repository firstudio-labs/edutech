import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Save, Loader2, Settings, ShieldCheck, Link2, AlertCircle, CreditCard } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminSettings({ dbSettings }) {
    const [data, setData] = useState({
        google_client_id: dbSettings?.google_client_id || '',
        google_client_secret: dbSettings?.google_client_secret || '',
        google_redirect_url: dbSettings?.google_redirect_url || window.location.origin + '/auth/google/callback',
        midtrans_server_key: dbSettings?.midtrans_server_key || '',
        midtrans_client_key: dbSettings?.midtrans_client_key || '',
        midtrans_is_production: dbSettings?.midtrans_is_production ?? false,
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        router.post(route('admin.settings.store'), data, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSaving(false);
                toast.success('Pengaturan berhasil disimpan!');
            },
            onError: (errors) => {
                setIsSaving(false);
                toast.error('Gagal menyimpan pengaturan.');
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Pengaturan Sistem - JAGGAD ACADEMY" />
            
            <div className="admin-page">
                <div className="admin-page-header">
                    <h1>Pengaturan Sistem</h1>
                    <p className="admin-page-subtitle">Kelola kredensial API dan konfigurasi eksternal</p>
                </div>

                <div className="admin-table-card" style={{ padding: 'var(--space-8)' }}>
                    <form onSubmit={handleSave} className="modal-form">
                        {/* Google Auth Section */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-4)', color: 'var(--color-accent-light)' }}>
                            <ShieldCheck size={20} />
                            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Google Auth Credentials</h3>
                        </div>

                        <div className="form-group">
                            <label>Google Client ID</label>
                            <input 
                                type="text"
                                value={data.google_client_id}
                                onChange={e => setData({...data, google_client_id: e.target.value})}
                                placeholder="Contoh: 123456789-abc.apps.googleusercontent.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>Google Client Secret</label>
                            <input 
                                type="password"
                                value={data.google_client_secret}
                                onChange={e => setData({...data, google_client_secret: e.target.value})}
                                placeholder="••••••••••••••••••••••••"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 'var(--space-8)' }}>
                            <label>Google Redirect URL (Callback)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                    type="text"
                                    value={data.google_redirect_url}
                                    onChange={e => setData({...data, google_redirect_url: e.target.value})}
                                />
                                <button 
                                    type="button" 
                                    className="btn-icon" 
                                    onClick={() => {
                                        navigator.clipboard.writeText(data.google_redirect_url);
                                        toast.success('URL berhasil disalin!');
                                    }}
                                >
                                    <Link2 size={18} />
                                </button>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-8) 0' }} />

                        {/* Midtrans Section */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-4)', color: '#10b981' }}>
                            <CreditCard size={20} />
                            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Midtrans Payment Gateway</h3>
                        </div>

                        <div style={{ 
                            padding: 'var(--space-6)', 
                            background: 'rgba(0,0,0,0.1)', 
                            borderRadius: 'var(--radius-xl)',
                            border: '1px solid var(--color-border)',
                            marginBottom: 'var(--space-6)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                    Production Mode {data.midtrans_is_production ? '🚀' : '🛠️'}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                    {data.midtrans_is_production 
                                        ? 'Sistem menggunakan akun Midtrans LIVE untuk transaksi asli.' 
                                        : 'Sistem menggunakan akun Midtrans Sandbox untuk simulasi.'}
                                </span>
                             </div>

                             <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={data.midtrans_is_production}
                                    onChange={e => setData({...data, midtrans_is_production: e.target.checked})}
                                />
                                <span className="toggle-slider"></span>
                             </label>
                        </div>

                        <div className="form-group">
                            <label>Midtrans Server Key</label>
                            <input 
                                type="password"
                                value={data.midtrans_server_key}
                                onChange={e => setData({...data, midtrans_server_key: e.target.value})}
                                placeholder="SB-Mid-server-..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Midtrans Client Key</label>
                            <input 
                                type="text"
                                value={data.midtrans_client_key}
                                onChange={e => setData({...data, midtrans_client_key: e.target.value})}
                                placeholder="SB-Mid-client-..."
                            />
                        </div>

                        <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn-admin-primary" disabled={isSaving}>
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
