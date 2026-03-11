import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import './Auth.css';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="auth-page">
            <Head title="Log in" />
            <div className="auth-bg-glow" />
            
            <div className="auth-card">
                <div className="auth-header">
                    <Link href="/" className="auth-brand">SAGA<span>Academy</span></Link>
                    <h1 className="auth-title">Selamat Datang</h1>
                    <p className="auth-subtitle">Masuk ke akun SAGA Academy Anda</p>
                </div>

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600 text-center">
                        {status}
                    </div>
                )}

                <div className="demo-credentials">
                    <p className="demo-title">Demo Akun:</p>
                    <div className="demo-accounts">
                        <button 
                            type="button"
                            onClick={() => setData({ ...data, email: 'user@saga.id', password: 'password' })} 
                            className="demo-btn"
                        >
                            👤 User Demo
                        </button>
                        <button 
                            type="button"
                            onClick={() => setData({ ...data, email: 'admin@saga.id', password: 'password' })} 
                            className="demo-btn"
                        >
                            🛡️ Admin Demo
                        </button>
                    </div>
                </div>

                <form className="auth-form" onSubmit={submit}>
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
                                placeholder="••••••••" 
                                value={data.password} 
                                onChange={e => setData('password', e.target.value)} 
                                required 
                                autoComplete="current-password"
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

                    <div className="flex items-center justify-between mt-1">
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="remember" 
                                checked={data.remember} 
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded bg-zinc-900 border-zinc-700 text-red-600 focus:ring-red-600 mr-2"
                            />
                            <span className="text-xs text-zinc-400">Ingat Saya</span>
                        </label>
                        
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-zinc-400 hover:text-red-400"
                            >
                                Lupa password?
                            </Link>
                        )}
                    </div>

                    <button type="submit" className="btn-auth" disabled={processing}>
                        {processing ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                <p className="auth-footer">
                    Belum punya akun? <Link href={route('register')}>Daftar sekarang</Link>
                </p>
                <p className="auth-footer">
                    Kembali ke halaman utama? <Link href="/">Kembali</Link>
                </p>
            </div>
        </div>
    );
}
