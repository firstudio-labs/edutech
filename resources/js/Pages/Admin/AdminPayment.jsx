import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus, CreditCard, Pencil, Trash2, X, AlertCircle, ToggleLeft, ToggleRight, QrCode, Banknote, Eye, Shield, Landmark } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminPayment({ dbBanks = [] }) {
    const [isGateWayActive, setIsGateWayActive] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [selectedBank, setSelectedBank] = useState(null);
    const [form, setForm] = useState({ bank_name: '', account_holder: '', account_number: '' });

    const toggleBank = (slug) => {
        router.patch(route('admin.payment.toggle', slug), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Status bank berhasil diubah'),
            onError: () => toast.error('Gagal mengubah status bank')
        });
    };

    const handleSave = () => {
        if (!form.bank_name || !form.account_number || !form.account_holder) return toast.error('Lengkapi data bank');
        
        if (editingBank) {
            router.put(route('admin.payment.update', editingBank.slug || editingBank.id), form, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Bank berhasil diperbarui');
                    setIsAddOpen(false);
                    setEditingBank(null);
                },
                onError: () => toast.error('Gagal memperbarui bank')
            });
        } else {
            router.post(route('admin.payment.store'), form, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Rekening baru ditambahkan');
                    setIsAddOpen(false);
                },
                onError: () => toast.error('Gagal menambahkan bank')
            });
        }
    };

    const deleteBank = (slug) => {
        if (confirm('Hapus rekening ini?')) {
            router.delete(route('admin.payment.destroy', slug), {
                preserveScroll: true,
                onSuccess: () => toast.success('Rekening dihapus'),
                onError: () => toast.error('Gagal menghapus rekening')
            });
        }
    };

    const openEdit = (b) => {
        setEditingBank(b);
        setForm({ bank_name: b.bank_name, account_holder: b.account_name, account_number: b.account_number });
        setIsAddOpen(true);
    };

    return (
        <AdminLayout>
            <Head title="Pengaturan Pembayaran - SAGA Academy" />
            <div className="admin-page">
                <div className="admin-page-header">
                    <h1>Pengaturan Pembayaran</h1>
                    <p className="admin-page-subtitle">Kelola metode pembayaran dan rekening bank untuk transaksi pelanggan</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                    {/* Manual Transfer */}
                    <div className="admin-table-card" style={{ height: 'fit-content' }}>
                        <div className="admin-table-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Banknote size={20} /></div>
                                <div>
                                    <h3 style={{ fontSize: 'var(--text-base)' }}>Transfer Bank Manual</h3>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Pelanggan kirim bukti transfer secara manual</p>
                                </div>
                            </div>
                            <button className="btn-icon edit" onClick={() => { setForm({ bank_name: '', account_holder: '', account_number: '' }); setEditingBank(null); setIsAddOpen(true); }}><Plus size={18} /></button>
                        </div>
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr><th>Bank</th><th>No. Rekening</th><th>Status</th><th>Aksi</th></tr>
                                </thead>
                                <tbody>
                                    {dbBanks.map(b => {
                                        const isActive = b.status == 1 || b.status === true;
                                        return (
                                        <tr key={b.id}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{b.bank_name}</div>
                                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{b.account_name}</div>
                                            </td>
                                            <td className="trx-id">{b.account_number}</td>
                                            <td>
                                                <button onClick={() => toggleBank(b.slug || b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isActive ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                                                    {isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                                </button>
                                            </td>
                                            <td>
                                                <div className="actions-col">
                                                    <button className="btn-icon" onClick={() => setSelectedBank(b)} title="Lihat Detail"><Eye size={15} /></button>
                                                    <button className="btn-icon edit" onClick={() => openEdit(b)}><Pencil size={15} /></button>
                                                    <button className="btn-icon delete" onClick={() => deleteBank(b.slug || b.id)}><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Automatic Gateway */}
                    <div className="admin-table-card" style={{ height: 'fit-content', border: '1px solid var(--color-border)', opacity: 0.7 }}>
                        <div className="admin-table-header" style={{ borderBottom: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><QrCode size={20} /></div>
                                <div>
                                    <h3 style={{ fontSize: 'var(--text-base)' }}>Payment Gateway (Xendit/Midtrans)</h3>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Otomatisasi pembayaran QRIS, VA, & Credit Card</p>
                                </div>
                            </div>
                            <button className="status-badge warning" style={{ border: 'none' }}>SOON</button>
                        </div>
                        <div style={{ padding: '0 24px 24px' }}>
                            <div style={{ padding: 'var(--space-4)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)', display: 'flex', gap: 12 }}>
                                <AlertCircle size={20} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                                    Integrasi payment gateway memungkinkan sistem mengonfirmasi pembayaran secara otomatis tanpa perlu cek manual. Hubungkan API Key Anda di sini.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {isAddOpen && (
                    <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{editingBank ? 'Edit Rekening' : 'Tambah Rekening'}</h3>
                                <button className="btn-icon" onClick={() => setIsAddOpen(false)}><X size={20} /></button>
                            </div>
                            <div className="modal-form">
                                <div className="form-group">
                                    <label>Nama Bank</label>
                                    <input value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} placeholder="BCA, Mandiri, BRI, dll" />
                                </div>
                                <div className="form-group">
                                    <label>Nama Pemilik Rekening</label>
                                    <input value={form.account_holder} onChange={e => setForm({ ...form, account_holder: e.target.value })} placeholder="Masukkan nama sesuai buku tabungan" />
                                </div>
                                <div className="form-group">
                                    <label>Nomor Rekening</label>
                                    <input value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} placeholder="000 - 0000 - 000" />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-modal-cancel" onClick={() => setIsAddOpen(false)}>Batal</button>
                                <button className="btn-modal-save" onClick={handleSave}>Simpan Rekening</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bank Detail Modal */}
                {selectedBank && (
                    <div className="modal-overlay" onClick={() => setSelectedBank(null)}>
                        <div className="modal modal-detail" onClick={e => e.stopPropagation()}>
                            <div className="modal-detail-header" style={{ borderColor: 'var(--color-border)' }}>
                                <div style={{ 
                                    width: 56, 
                                    height: 56, 
                                    borderRadius: 'var(--radius-md)', 
                                    background: 'var(--color-accent-dim)', 
                                    color: 'var(--color-accent-light)',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Landmark size={28} />
                                </div>
                                <div style={{ marginLeft: 'var(--space-4)' }}>
                                    <p className="modal-detail-id">METODE PEMBAYARAN</p>
                                    <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{selectedBank.bank_name}</h3>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 4 }}>
                                        <span className={`status-badge ${(selectedBank.status == 1 || selectedBank.status === true) ? 'success' : 'error'}`} style={{ fontSize: 'var(--text-xs)' }}>
                                            {(selectedBank.status == 1 || selectedBank.status === true) ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>
                                </div>
                                <button className="btn-icon" onClick={() => setSelectedBank(null)} style={{ marginLeft: 'auto' }}><X size={20} /></button>
                            </div>

                            <div className="modal-detail-body">
                                <div className="detail-section-block">
                                    <div className="detail-section-label"><CreditCard size={14} /> Informasi Rekening</div>
                                    <div className="detail-grid">
                                        <div style={{ gridColumn: '1 / -1' }}><span>Nama Pemilik</span><strong>{selectedBank.account_name}</strong></div>
                                        <div><span>Nomor Rekening</span><strong className="trx-id" style={{ fontSize: 'var(--text-base)' }}>{selectedBank.account_number}</strong></div>
                                        <div><span>Status</span><strong>{(selectedBank.status == 1 || selectedBank.status === true) ? 'Bisa Digunakan' : 'Sedang Ditangguhkan'}</strong></div>
                                    </div>
                                </div>

                                <div className="detail-section-block">
                                    <div className="detail-section-label"><Shield size={14} /> Panduan Keamanan</div>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                        Gunakan rekening ini sebagai tujuan transfer manual pelanggan. Pastikan nama pemilik rekening sesuai dengan yang terdaftar untuk memudahkan verifikasi bukti pembayaran oleh tim Admin.
                                    </p>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button className="btn-modal-cancel" style={{ flex: 1 }} onClick={() => setSelectedBank(null)}>Tutup</button>
                                <button className="btn-modal-save" style={{ flex: 1 }} onClick={() => {
                                    openEdit(selectedBank);
                                    setSelectedBank(null);
                                }}>
                                    Ubah Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
