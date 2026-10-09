import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [form, setForm] = useState({ full_name: '', address: '', city: '', postal_code: '', country: 'Türkiye', phone: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate('/login'); return; }
    fetch('http://localhost:8000/api/cart/', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(d => setCart(d)).catch(() => {});
  }, []);

  const handleOrder = async () => {
    setLoading(true);
    const token = getToken();
    try {
      const res = await fetch('http://localhost:8000/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shipping_address: form })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/orders'), 2000);
      } else {
        alert(data.detail || 'Sipariş oluşturulamadı');
      }
    } catch {
      alert('Bağlantı hatası');
    }
    setLoading(false);
  };

  if (success) return (
    <div className="section container" style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: '4rem' }}>✅</div>
      <h2 style={{ marginTop: '20px' }}>Siparişiniz alındı!</h2>
      <p style={{ color: 'var(--text-muted)' }}>Siparişlerim sayfasına yönlendiriliyorsunuz...</p>
    </div>
  );

  return (
    <div className="section">
      <div className="container">
        <h1 style={{ marginBottom: '32px' }}>Ödeme</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px' }}>Teslimat Bilgileri</h3>
            {[
              ['full_name', 'Ad Soyad'],
              ['address', 'Adres'],
              ['city', 'Şehir'],
              ['postal_code', 'Posta Kodu'],
              ['country', 'Ülke'],
              ['phone', 'Telefon']
            ].map(([field, label]) => (
              <div key={field} className="form-group">
                <label className="form-label">{label}</label>
                <input
                  className="form-input"
                  value={form[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <div>
            <div className="order-summary">
              <h3>Sipariş Özeti</h3>
              {cart.items?.map(item => (
                <div key={item.id} className="summary-row">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span>{item.subtotal?.toFixed(2)} ₺</span>
                </div>
              ))}
              <div className="summary-row" style={{ color: 'var(--text-muted)' }}>
                <span>Kargo</span><span>Ücretsiz</span>
              </div>
              <div className="summary-row total">
                <span>Toplam</span>
                <span style={{ color: 'var(--accent)' }}>{cart.total?.toFixed(2)} ₺</span>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '16px' }}
                onClick={handleOrder}
                disabled={loading || !cart.items?.length}
              >
                {loading ? 'İşleniyor...' : '✅ Siparişi Tamamla'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}