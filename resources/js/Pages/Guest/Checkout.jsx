import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Building2, CheckCircle2, ShoppingBag, Upload, Trash2, ArrowRight, Lock, CreditCard, Shield } from 'lucide-react';
import { useCart } from '../../Contexts/CartContext';
import { formatCurrency } from '../../Utils/helpers';
import MainLayout from '../../Layouts/MainLayout';
import toast from 'react-hot-toast';
import './Checkout.css';

export default function Checkout({ auth, dbPaymentMethods = [] }) {
    const { midtrans } = usePage().props;
    const { cartItems, getTotal, clearCart, removeFromCart } = useCart();
    const [selectedMethod, setSelectedMethod] = useState('');
    const [step, setStep] = useState(1); // 1=form, 2=payment, 3=success
    const [form, setForm] = useState({ name: auth.user?.name || '', email: auth.user?.email || '', phone: auth.user?.phone || '' });
    const [proofFile, setProofFile] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        // Load Midtrans Snap script
        const snapScriptUrl = midtrans.is_production 
            ? 'https://app.midtrans.com/snap/snap.js' 
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
        
        const script = document.createElement('script');
        script.src = snapScriptUrl;
        script.setAttribute('data-client-key', midtrans.client_key);
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [midtrans]);

    const activeMethods = dbPaymentMethods.map(m => ({ 
        id: m.id, 
        label: m.bank_name, 
        accNo: m.account_number, 
        accName: m.account_name, 
        isManual: m.account_number !== '-',
        icon: m.account_number === '-' ? CreditCard : Building2 
    }));

    const total = getTotal();
    const tax = Math.round(total * 0.11);
    const grandTotal = total + tax;

    const handleOrder = () => {
        if (!form.name || !form.email || !form.phone) return toast.error('Lengkapi data diri termasuk Nomor HP');
        setStep(2);
    };

    const handlePay = (methodId = null) => {
        const targetId = methodId || selectedMethod;
        const pm = activeMethods.find(m => m.id === targetId);
        
        if (!pm) return toast.error('Pilih metode pembayaran');
        if (pm.isManual && !proofFile) return toast.error('Harap unggah bukti pembayaran');

        setProcessing(true);
        
        router.post(route('checkout.process'), {
            phone: form.phone,
            payment_method_id: targetId,
            cart: cartItems.map(item => ({ id: item.id, price: item.price, name: item.title })),
            proof: pm.isManual ? proofFile : null,
            _method: 'post',
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                const { snap_token } = page.props.flash || {};
                
                if (snap_token) {
                    window.snap.pay(snap_token, {
                        onSuccess: (result) => {
                            setProcessing(false);
                            clearCart();
                            setStep(3);
                            toast.success('Pembayaran Berhasil!');
                        },
                        onPending: (result) => {
                            setProcessing(false);
                            toast.success('Pembayaran Diproses, Silakan Selesaikan Pembayaran Anda.');
                            router.visit(route('dashboard'));
                        },
                        onError: (result) => {
                            setProcessing(false);
                            toast.error('Pembayaran Gagal!');
                        },
                        onClose: () => {
                            setProcessing(false);
                            toast('Pintu pembayaran ditutup.');
                        }
                    });
                } else {
                    setProcessing(false);
                    clearCart();
                    setStep(3);
                }
            },
            onError: (errors) => {
                setProcessing(false);
                Object.values(errors).forEach(err => toast.error(err));
            }
        });
    };

    if (step === 3) {
        return (
            <MainLayout>
                <Head title="Pembayaran Berhasil! - JAGGAD ACADEMY" />
                <div className="checkout-success">
                    <div className="success-card">
                        <div className="success-icon"><CheckCircle2 size={64} /></div>
                        <h2>Pembayaran Berhasil!</h2>
                        <p>Terima kasih telah berbelanja di JAGGAD ACADEMY. Akses produk Anda kini tersedia.</p>
                        <div className="success-actions">
                            <Link href={route('dashboard')} className="btn-hero-primary">Lihat Dashboard Saya</Link>
                            <Link href={route('products')} className="btn-hero-secondary">Belanja Lagi</Link>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (cartItems.length === 0 && step !== 3) {
        return (
            <MainLayout>
                <Head title="Keranjang Kosong - JAGGAD ACADEMY" />
                <div className="checkout-empty">
                    <ShoppingBag size={64} className="empty-icon" />
                    <h2>Keranjang Kosong</h2>
                    <p>Tambahkan produk ke keranjang terlebih dahulu.</p>
                    <Link href={route('products')} className="btn-hero-primary">Jelajahi Produk</Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Head title="Checkout - JAGGAD ACADEMY" />
            <div className="checkout-page">
                <div className="container checkout-inner">
                    <div className="checkout-steps">
                        {['Data Diri', 'Pembayaran', 'Selesai'].map((s, i) => (
                            <div key={s} className={`step-item ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
                                <div className="step-circle">{step > i + 1 ? '✓' : i + 1}</div>
                                <span>{s}</span>
                            </div>
                        ))}
                    </div>

                    <div className="checkout-layout">
                        {/* Left form */}
                        <div className="checkout-form-section">
                            {step === 1 && (
                                <div className="checkout-card">
                                    <h2 className="checkout-card-title">Data Pemesanan</h2>
                                    <div className="form-group">
                                        <label>Nama Lengkap</label>
                                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Masukkan nama lengkap" className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" type="email" className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Nomor HP</label>
                                        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+62 xxx-xxxx-xxxx" className="form-input" />
                                    </div>
                                    <button className="btn-checkout-action w-full" onClick={handleOrder}>
                                        Lanjutkan ke Pembayaran <ArrowRight size={20} />
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="checkout-card">
                                    <h2 className="checkout-card-title">Metode Pembayaran</h2>
                                    <p className="text-muted" style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                                        {activeMethods.find(m => m.id === selectedMethod)?.isManual === false 
                                            ? 'Anda akan diarahkan ke pop-up pembayaran otomatis Midtrans.'
                                            : 'Silakan transfer sesuai total tagihan ke salah satu rekening di bawah ini, lalu unggah buktinya.'}
                                    </p>

                                    <div className="payment-methods">
                                        {activeMethods.map(method => (
                                            <div 
                                                key={method.id} 
                                                className={`payment-option ${selectedMethod === method.id ? 'selected' : ''}`} 
                                                onClick={() => {
                                                    setSelectedMethod(method.id);
                                                    // Auto-trigger pay if it's Midtrans (automated)
                                                    if (!method.isManual) {
                                                        // We need to wait for state to update or use method.id directly
                                                        handlePay(method.id);
                                                    }
                                                }}
                                            >
                                                <div className="payment-option__header">
                                                    <div className="payment-icon">
                                                        {method.isManual ? <Building2 size={20} /> : <CreditCard size={20} />}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <span className="payment-label" style={{ display: 'block' }}>{method.label}</span>
                                                        {!method.isManual && <span style={{ fontSize: '10px', color: 'var(--color-accent-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Otomatis (QRIS, VA, DLL)</span>}
                                                    </div>
                                                    <div className={`payment-radio ${selectedMethod === method.id ? 'checked' : ''}`} />
                                                </div>
                                                {selectedMethod === method.id && method.isManual && (
                                                    <div className="bank-details" style={{ margin: '0 var(--space-4) var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Nomor Rekening</p>
                                                        <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '1px', color: 'var(--color-text)' }}>{method.accNo}</p>
                                                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 4 }}>Atas Nama: <strong>{method.accName}</strong></p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {activeMethods.find(m => m.id === selectedMethod)?.isManual === false && (
                                        <div className="automated-steps-guide" style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'rgba(59, 130, 246, 0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: '#3b82f6', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Shield size={16} /> Langkah Pembayaran Otomatis
                                            </h4>
                                            <div className="step-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                                {[
                                                    'Klik tombol "Konfirmasi Pembayaran" di bawah.',
                                                    'Popup Midtrans Snap akan muncul secara otomatis.',
                                                    'Pilih metode (QRIS, VA, E-Wallet) dan bayar.',
                                                    'Akses produk langsung aktif detik itu juga!'
                                                ].map((text, idx) => (
                                                    <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                                        <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</span>
                                                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>{text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeMethods.find(m => m.id === selectedMethod)?.isManual && (
                                     <div className="proof-upload-section">
                                          <h3 className="proof-upload-title">Upload Bukti Pembayaran</h3>
                                          <label className={`proof-upload-label ${proofFile ? 'has-file' : ''}`}>
                                              {proofFile ? (
                                                  <>
                                                      {proofFile.type && proofFile.type.startsWith('image/') ? (
                                                          <img 
                                                              src={URL.createObjectURL(proofFile)} 
                                                              alt="Preview Bukti" 
                                                              className="proof-preview-image"
                                                          />
                                                      ) : (
                                                          <CheckCircle2 size={32} className="proof-upload-icon" />
                                                      )}
                                                      <span className="proof-file-name">{proofFile.name}</span>
                                                      <span className="proof-upload-hint">(Klik untuk mengganti)</span>
                                                  </>
                                              ) : (
                                                  <>
                                                      <Upload size={32} className="proof-upload-icon" />
                                                      <span className="proof-upload-text">Pilih File Bukti Transfer</span>
                                                      <span className="proof-upload-hint">JPG, PNG, atau PDF (Max 2MB)</span>
                                                  </>
                                              )}
                                              <input
                                                  type="file"
                                                  accept="image/*,.pdf"
                                                  style={{ display: 'none' }}
                                                  onChange={(e) => {
                                                      if (e.target.files && e.target.files[0]) {
                                                          setProofFile(e.target.files[0]);
                                                      }
                                                  }}
                                              />
                                          </label>
                                      </div>
                                    )}

                                    <button className={`btn-checkout-action w-full ${processing ? 'loading' : ''}`} style={{ marginTop: 'var(--space-6)' }} onClick={handlePay} disabled={processing}>
                                        <Lock size={20} />
                                        {processing ? 'Memproses Pesanan...' : `Konfirmasi Pembayaran ${formatCurrency(grandTotal)}`}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Order summary */}
                        <div className="checkout-summary">
                            <div className="checkout-card">
                                <h3 className="checkout-card-title">Ringkasan Pesanan</h3>
                                <div className="order-items">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="order-item">
                                            <div className="order-item-main" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                <span className="order-item-name">{item.title}</span>
                                                <span className="order-item-price">{formatCurrency(item.price)}</span>
                                            </div>
                                            {step === 1 && (
                                                <button
                                                    className="btn-remove-item"
                                                    style={{ marginLeft: 'var(--space-2)' }}
                                                    onClick={() => removeFromCart(item.id)}
                                                    title="Hapus produk"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="order-divider" />
                                <div className="order-totals">
                                    <div className="order-row">
                                        <span>Subtotal</span><span>{formatCurrency(total)}</span>
                                    </div>
                                    <div className="order-row">
                                        <span>Pajak (11%)</span><span>{formatCurrency(tax)}</span>
                                    </div>
                                    <div className="order-row total-row">
                                        <span>Total</span><span>{formatCurrency(grandTotal)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

