// LoginPage
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch (e) { setError(e.response?.data?.detail || 'Giriş başarısız'); }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Hoş Geldin 👋</h1>
        <p className="auth-subtitle">Hesabına giriş yap</p>
        {error && <div className="form-error" style={{ marginBottom: '16px', padding: '10px', background: '#fef2f2', borderRadius: '8px' }}>{error}</div>}
        <div className="form-group">
          <label className="form-label">E-posta</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@email.com" />
        </div>
        <div className="form-group">
          <label className="form-label">Şifre</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
        <div className="auth-footer">Hesabın yok mu? <Link to="/register">Kayıt Ol</Link></div>
      </div>
    </div>
  );
}

// RegisterPage
export function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', password: '', full_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try { await register(form); navigate('/'); }
    catch (e) { setError(e.response?.data?.detail || 'Kayıt başarısız'); }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Hesap Oluştur 🚀</h1>
        <p className="auth-subtitle">ShopAI'a katıl</p>
        {error && <div className="form-error" style={{ marginBottom: '16px', padding: '10px', background: '#fef2f2', borderRadius: '8px' }}>{error}</div>}
        {['full_name', 'username', 'email', 'password'].map(field => (
          <div key={field} className="form-group">
            <label className="form-label">{{ full_name: 'Ad Soyad', username: 'Kullanıcı Adı', email: 'E-posta', password: 'Şifre' }[field]}</label>
            <input className="form-input" type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
          </div>
        ))}
        <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
        </button>
        <div className="auth-footer">Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link></div>
      </div>
    </div>
  );
}
