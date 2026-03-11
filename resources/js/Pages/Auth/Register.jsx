import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import './Auth.css';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="auth-page">
            <Head title="Register" />
            <div className="auth-bg-glow" />
            
            <div className="auth-card">
                <div className="auth-header">
                    <Link href="/" className="auth-brand">SAGA<span>Academy</span></Link>
                    <h1 className="auth-title">Buat Akun</h1>
                    <p className="auth-subtitle">Daftar dan mulai perjalanan belajar Anda</p>
                </div>

                <form className="auth-form" onSubmit={submit}>
                    <div className="form-group">
                        <label htmlFor="name">Nama Lengkap</label>
                        <input 
                            id="name"
                            type="text" 
                            className="form-input" 
                            placeholder="Nama lengkap Anda" 
                            value={data.name} 
                            onChange={e => setData('name', e.target.value)} 
                            required 
                            autoComplete="name"
                        />
                        {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            id="email"
                            type="email" 
                            className="form-input" 
                            placeholder="email@example.com" 
                            value={data.email} 
                            onChange={e => setData('email', e.target.value)} 
                            required 
                            autoComplete="username"
                        />
                        {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrap">
                            <input 
                                id="password"
                                type={showPass ? 'text' : 'password'} 
                                className="form-input" 
                                placeholder="Minimal 6 karakter" 
                                value={data.password} 
                                onChange={e => setData('password', e.target.value)} 
                                required 
                                autoComplete="new-password"
                            />
                            <button 
                                type="button" 
                                className="toggle-pass" 
                                onClick={() => setShowPass(!showPass)}
                            >
                                {showPass ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                        {errors.password && <span className="text-xs text-red-500 mt-1">{errors.password}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password_confirmation">Konfirmasi Password</label>
                        <input 
                            id="password_confirmation"
                            type="password" 
                            className="form-input" 
                            placeholder="Ketik ulang password" 
                            value={data.password_confirmation} 
                            onChange={e => setData('password_confirmation', e.target.value)} 
                            required 
                            autoComplete="new-password"
                        />
                        {errors.password_confirmation && <span className="text-xs text-red-500 mt-1">{errors.password_confirmation}</span>}
                    </div>

                    <button type="submit" className="btn-auth mt-4" disabled={processing}>
                        {processing ? 'Memproses...' : 'Daftar Sekarang'}
                    </button>
                </form>

                <p className="auth-footer">
                    Sudah punya akun? <Link href={route('login')}>Masuk</Link>
                </p>
                <p className="auth-footer">
                    Kembali ke halaman utama? <Link href="/">Kembali</Link>
                </p>
            </div>
        </div>
    );
}
