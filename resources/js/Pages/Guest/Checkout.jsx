import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Building2, CheckCircle2, ShoppingBag, Upload, Trash2, ArrowRight, Lock, CreditCard, Shield } from 'lucide-react';
import { useCart } from '../../Contexts/CartContext';
import { formatCurrency } from '../../Utils/helpers';
import MainLayout from '../../Layouts/MainLayout';
import toast from 'react-hot-toast';
import { useMetaPixel } from '../../Utils/useMetaPixel';
import './Checkout.css';

export default function Checkout({ auth, dbPaymentMethods = [] }) {
    const { midtrans } = usePage().props;
    const { cartItems, getTotal, clearCart, removeFromCart } = useCart();
    const { trackInitiateCheckout, trackPurchase } = useMetaPixel();
    const [step, setStep] = useState(1); // 1=form, 2=payment, 3=success
    const [form, setForm] = useState({ name: auth.user?.name || '', email: auth.user?.email || '', phone: auth.user?.phone || '' });
    const [processing, setProcessing] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [proofFile, setProofFile] = useState(null);
    const [activeTrxCode, setActiveTrxCode] = useState(null);

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
    const grandTotal = total;

    const handleOrder = () => {
        if (!form.name || !form.email || !form.phone) return toast.error('Lengkapi data diri termasuk Nomor HP');
        
        // Track InitiateCheckout
        trackInitiateCheckout(cartItems, grandTotal);

        setStep(2);
    };

    const handlePay = () => {
        if (!selectedMethod) return toast.error('Pilih metode pembayaran');
        const pm = activeMethods.find(m => m.id === selectedMethod);
        
        if (pm.isManual && !proofFile) {
            return toast.error('Silakan upload bukti pembayaran terlebih dahulu');
        }

        setProcessing(true);
        
        const payload = {
            phone: form.phone,
            payment_method_id: selectedMethod,
            cart: cartItems.map(item => ({ id: item.id, price: item.price, name: item.title })),
            _method: 'post',
        };
        
        if (activeTrxCode) {
            payload.active_trx = activeTrxCode;
        }
        
        if (pm.isManual && proofFile) {
            payload.proof = proofFile;
        }

        router.post(route('checkout.process'), payload, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                const { snap_token, trx_code } = page.props.flash || {};
                
                if (trx_code) {
                    setActiveTrxCode(trx_code);
                }
                
                if (snap_token && !pm.isManual) {
                    window.snap.pay(snap_token, {
                        onSuccess: (result) => {
                            router.post(route('checkout.verify', page.props.flash.trx_code), {}, {
                                onSuccess: () => {
                                    // Track Purchase with real transaction data
                                    trackPurchase(
                                        page.props.flash.trx_code,
                                        grandTotal,
                                        cartItems
                                    );
                                    clearCart();
                                    toast.success('Pembayaran Berhasil! Selamat belajar 🎉');
                                    router.visit(route('dashboard'));
                                }
                            });
                        },
                        onPending: (result) => {
                            router.post(route('checkout.verify', page.props.flash.trx_code), {}, {
                                onSuccess: () => {
                                    setProcessing(false);
                                    toast.success('Pembayaran Diproses, Silakan Selesaikan Pembayaran Anda.');
                                    router.visit(route('dashboard'));
                                }
                            });
                        },
                        onError: (result) => {
                            setProcessing(false);
                            toast.error('Pembayaran Gagal!');
                        },
                        onClose: () => {
                            setProcessing(false);
                            toast('Pembayaran ditunda. Pesanan Anda telah tersimpan, silakan pilih metode lain atau selesaikan nanti.');
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
        const pm = activeMethods.find(m => m.id === selectedMethod);
        const isManual = pm?.isManual;

        return (
            <MainLayout>
                <Head title={isManual ? "Pesanan Diproses! - JAGGAD ACADEMY" : "Pembayaran Berhasil! - JAGGAD ACADEMY"} />
                <div className="checkout-success">
                    <div className="success-card">
                        <div className="success-icon"><CheckCircle2 size={64} /></div>
                        <h2>{isManual ? 'Pesanan Diproses!' : 'Pembayaran Berhasil!'}</h2>
                        <p>{isManual ? 'Terima kasih telah berbelanja di JAGGAD ACADEMY. Pesanan Anda sedang kami verifikasi.' : 'Terima kasih telah berbelanja di JAGGAD ACADEMY. Akses produk Anda kini tersedia.'}</p>
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
                    <div className="checkout-steps section-dark" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
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
                                    <button className="btn-checkout-action w-full" onClick={handleOrder} disabled={processing}>
                                        {processing ? 'Memproses...' : 'Lanjutkan ke Pembayaran'} <ArrowRight size={20} />
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="checkout-card">
                                    <h2 className="checkout-card-title">Metode Pembayaran</h2>
                                    <div className="payment-methods-grid">
                                        {activeMethods.map(method => (
                                            <div 
                                                key={method.id} 
                                                className={`payment-option ${selectedMethod === method.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedMethod(method.id)}
                                            >
                                                <div className="payment-option__header">
                                                    <div className="payment-icon">
                                                        {method.icon ? <method.icon size={20} /> : <Building2 size={20} />}
                                                    </div>
                                                    <span className="payment-label">{method.label}</span>
                                                    <div className={`payment-radio ${selectedMethod === method.id ? 'checked' : ''}`} />
                                                </div>
                                                {selectedMethod === method.id && method.isManual && (
                                                    <div className="bank-details" style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Nomor Rekening</p>
                                                        <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '1px', color: 'var(--color-text)' }}>{method.accNo}</p>
                                                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 4 }}>Atas Nama: <strong>{method.accName}</strong></p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {selectedMethod && activeMethods.find(m => m.id === selectedMethod)?.isManual && (
                                        <div className="proof-upload-section">
                                            <h3 className="proof-upload-title">Upload Bukti Pembayaran</h3>
                                            <label className={`proof-upload-label ${proofFile ? 'has-file' : ''}`}>
                                                {proofFile ? (
                                                    <>
                                                        {proofFile.type.startsWith('image/') ? (
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
                                                        <span className="proof-upload-hint">JPG, JPEG, atau PNG (Max 5MB)</span>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
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

                                    <div className="form-actions" style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)' }}>
                                        <button className="btn-hero-secondary w-full" onClick={() => setStep(1)} disabled={processing}>
                                            Kembali
                                        </button>
                                        <button className={`btn-checkout-action w-full ${processing ? 'loading' : ''}`} onClick={handlePay} disabled={processing}>
                                            <Lock size={20} />
                                            {processing ? 'Memproses...' : `Konfirmasi (${formatCurrency(grandTotal)})`}
                                        </button>
                                    </div>
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

