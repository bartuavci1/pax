import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });
      const data = await res.json();
      if (data.access_token) {
        document.cookie = `token=${data.access_token}; path=/`;
        document.cookie = `user=${JSON.stringify(data.user)}; path=/`;
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.setItem('token', data.access_token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('userLogin'));
        window.location.href = '/';
      } else {
        setError('Giriş başarısız');
      }
    } catch (e) {
      setError('Bağlantı hatası');
    }
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