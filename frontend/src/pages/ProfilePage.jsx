import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!savedUser) { navigate('/login'); return; }
    setUser(JSON.parse(savedUser));
    const params = new URLSearchParams(window.location.search);
const tab = params.get('tab');
if (tab) setActiveTab(tab);

   fetch('http://localhost:8000/api/orders/', {
  headers: { Authorization: `Bearer ${getToken()}` }
}).then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d : [])).catch(() => {});

    fetch('http://localhost:8000/api/favorites/', {
      headers: { Authorization: `Bearer ${getToken()}` }
    }).then(r => r.json()).then(d => setFavorites(d)).catch(() => {});
  }, []);

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Profil Başlık */}
        <div className="card" style={{ padding: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', flexShrink: 0 }}>
            {user.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ marginBottom: '4px' }}>{user.full_name || user.username}</h2>
            <p style={{ color: 'var(--text-muted)' }}>@{user.username}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user.email}</p>
          </div>
          <button className="btn btn-danger" onClick={logout}>Çıkış Yap</button>
        </div>

        {/* Sekmeler */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profilim
          </button>
          <button
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Siparişlerim ({orders.length})
          </button>
          <button
            className={`btn ${activeTab === 'favorites' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('favorites')}
          >
            ❤️ Favorilerim ({favorites.length})
          </button>
        </div>

        {/* Profil Bilgileri */}
        {activeTab === 'profile' && (
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px' }}>Hesap Bilgileri</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                ['Ad Soyad', user.full_name || '-'],
                ['Kullanıcı Adı', '@' + user.username],
                ['E-posta', user.email],
                ['Hesap ID', '#' + user.id],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Siparişler */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem' }}>📦</div>
                <h3 style={{ marginTop: '16px' }}>Henüz siparişiniz yok</h3>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/orders')}>
                  <div>
                    <p style={{ fontWeight: 700 }}>Sipariş #{order.id}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 800, color: 'var(--accent)' }}>{order.total_amount?.toFixed(2)} ₺</p>
                    <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>⏳ Beklemede</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Favoriler */}
        {activeTab === 'favorites' && (
          <div>
            {favorites.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem' }}>❤️</div>
                <h3 style={{ marginTop: '16px' }}>Henüz favori ürününüz yok</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Ürünlerdeki kalp ikonuna tıklayarak favorilere ekleyebilirsiniz.</p>
              </div>
            ) : (
              <div className="products-grid">
                {favorites.map(f => (
                  <ProductCard key={f.fav_id} product={f.product} onAddToast={() => {}} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}