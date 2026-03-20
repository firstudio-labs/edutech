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
    const [step, setStep] = useState(1); // 1=form, 2=success
    const [form, setForm] = useState({ name: auth.user?.name || '', email: auth.user?.email || '', phone: auth.user?.phone || '' });
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
        
        // 1. Check if Client Key is configured
        if (!midtrans.client_key) return toast.error('Midtrans Client Key belum diisi di Pengaturan!');

        // 2. Check if Payment Method record exists
        const midtransMethod = activeMethods.find(m => !m.isManual);
        if (!midtransMethod) return toast.error('Metode Pembayaran Midtrans tidak ditemukan di Database!');

        // 3. Track InitiateCheckout
        trackInitiateCheckout(cartItems, grandTotal);

        handlePay(midtransMethod.id);
    };

    const handlePay = (methodId) => {
        const targetId = methodId;
        const pm = activeMethods.find(m => m.id === targetId);
        
        if (!pm) return toast.error('Pilih metode pembayaran');

        setProcessing(true);
        
        router.post(route('checkout.process'), {
            phone: form.phone,
            payment_method_id: targetId,
            cart: cartItems.map(item => ({ id: item.id, price: item.price, name: item.title })),
            _method: 'post',
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                const { snap_token } = page.props.flash || {};
                
                if (snap_token) {
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
                                    setProcessing(false);
                                    clearCart();
                                    setStep(2);
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
                            toast('Pintu pembayaran ditutup.');
                        }
                    });
                } else {
                    setProcessing(false);
                    clearCart();
                    setStep(2);
                }
            },
            onError: (errors) => {
                setProcessing(false);
                Object.values(errors).forEach(err => toast.error(err));
            }
        });
    };

    if (step === 2) {
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

    if (cartItems.length === 0 && step !== 2) {
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
                        {['Data Diri', 'Selesai'].map((s, i) => (
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

