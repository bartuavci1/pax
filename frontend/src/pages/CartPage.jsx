import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const productImages = {
  'Cicekli Midi Elbise': '/images/1.jpg',
  'Siyah Gece Elbisesi': '/images/2.jpg',
  'Keten Yazlik Elbise': '/images/3.jpg',
  'Cizgili Mini Elbise': '/images/4.jpg',
  'Saten Aksamustu Elbise': '/images/5.jpg',
  'Oversize Keten Gomlek': '/images/6.jpg',
  'Crop Orgu Kazak': '/images/7.jpg',
  'Sifon Bluz': '/images/8.jpg',
  'Belden Baglamali Gomlek': '/images/9.jpg',
  'Fitilli Kadife Sweatshirt': '/images/10.jpg',
  'Yuksek Bel Denim Pantolon': '/images/11.jpg',
  'Pileli Mini Etek': '/images/12.jpg',
  'Keten Genis Paca Pantolon': '/images/13.jpg',
  'Deri Gorunumlu Tayt': '/images/14.jpg',
  'Midi Kalem Etek': '/images/15.jpg',
  'Kasmir Karisimli Uzun Kaban': '/images/16.jpg',
  'Kapitone Mont': '/images/17.jpg',
  'Klasik Trench Coat': '/images/18.jpg',
  'Yun Karisimli Kisa Kaban': '/images/19.jpg',
  'Deri Omuz Canta': '/images/20.jpg',
  'Hasir Yaz Cantasi': '/images/21.jpg',
  'Ipek Sal': '/images/22.jpg',
  'Mini Zincir Askili Canta': '/images/23.jpg',
};

const getProductImage = (product) => {
  if (product.image_url) return product.image_url;
  for (const [key, url] of Object.entries(productImages)) {
    if (product.name.includes(key) || key.includes(product.name.split(' ')[0])) return url;
  }
  return `https://picsum.photos/seed/${product.id}/200/200`;
};

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  const fetchCart = async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch('http://localhost:8000/api/cart/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCart(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, []);

  const removeItem = async (itemId) => {
    const token = getToken();
    await fetch(`http://localhost:8000/api/cart/remove/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchCart();
  };

  const updateQty = async (itemId, quantity) => {
    const token = getToken();
    await fetch(`http://localhost:8000/api/cart/update/${itemId}?quantity=${quantity}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchCart();
  };

  const applyCoupon = async () => {
    setCouponError('');
    try {
      const res = await fetch('http://localhost:8000/api/coupons/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (res.ok) {
        setCoupon(data);
        setToast(`🎉 Kupon uygulandı! %${data.discount_percent} indirim kazandınız!`);
        setTimeout(() => setToast(''), 3000);
      } else {
        setCouponError(data.detail || 'Geçersiz kupon');
      }
    } catch {
      setCouponError('Bir hata oluştu');
    }
  };

  const discountedTotal = coupon ? cart.total * (1 - coupon.discount_percent / 100) : cart.total;

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  if (!cart.items || cart.items.length === 0) return (
    <div className="section container" style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛒</div>
      <h2>Sepetiniz boş</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Alışverişe başlamak için ürünlere göz atın.</p>
      <Link to="/products" className="btn btn-primary" style={{ marginTop: '24px' }}>Ürünlere Git</Link>
    </div>
  );

  return (
    <div className="section">
      {toast && <div className="toast success">{toast}</div>}
      <div className="container">
        <h1 style={{ marginBottom: '32px' }}>Sepetim</h1>
        <div className="cart-grid">
          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item.id} className="cart-item">
                <img
                  src={getProductImage(item.product)}
                  alt={item.product.name}
                  className="cart-item-img"
                />
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.product.name}</p>
                  <p className="cart-item-price">{item.product.price?.toFixed(2)} ₺</p>
                  <div className="quantity-control">
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <div>
                  <p style={{ fontWeight: 700, marginBottom: '8px' }}>{item.subtotal?.toFixed(2)} ₺</p>
                  <button className="btn btn-danger" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => removeItem(item.id)}>Sil</button>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="order-summary">
              <h3>Sipariş Özeti</h3>
              {cart.items.map(item => (
                <div key={item.id} className="summary-row">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span>{item.subtotal?.toFixed(2)} ₺</span>
                </div>
              ))}
              <div className="summary-row" style={{ color: 'var(--text-muted)' }}>
                <span>Kargo</span><span>Ücretsiz</span>
              </div>

              {/* Kupon */}
              <div style={{ margin: '16px 0', padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>🏷️ İndirim Kuponu</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className="form-input"
                    placeholder="Kupon kodunu girin"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.875rem' }}
                  />
                  <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }} onClick={applyCoupon}>
                    Uygula
                  </button>
                </div>
                {couponError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '6px' }}>{couponError}</p>}
                {coupon && <p style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '6px' }}>✅ %{coupon.discount_percent} indirim uygulandı!</p>}
              </div>

              {coupon && (
                <div className="summary-row" style={{ color: 'var(--danger)' }}>
                  <span>İndirim (%{coupon.discount_percent})</span>
                  <span>-{(cart.total - discountedTotal).toFixed(2)} ₺</span>
                </div>
              )}

              <div className="summary-row total">
                <span>Toplam</span>
                <span style={{ color: 'var(--accent)' }}>{discountedTotal.toFixed(2)} ₺</span>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '16px' }}
                onClick={() => navigate('/checkout')}
              >
                Ödemeye Geç →
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                Test kuponları: INDIRIM10, INDIRIM20, HOSGELDIN
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}