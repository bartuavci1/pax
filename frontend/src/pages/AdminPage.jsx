import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category_id: '1', image_url: '' });
  const [editProduct, setEditProduct] = useState(null);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchProducts = async () => {
    const res = await fetch('http://localhost:3000/api/admin/products', {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (res.status === 403) { navigate('/'); return; }
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  };

  const fetchStats = async () => {
    const res = await fetch('http://localhost:3000/api/admin/stats', {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    setStats(data);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate('/login'); return; }
    fetchProducts();
    fetchStats();
  }, []);

  const handleSubmit = async () => {
    const url = editProduct
      ? `http://localhost:3000/api/admin/products/${editProduct.id}`
      : 'http://localhost:3000/api/admin/products';
    const method = editProduct ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock), category_id: parseInt(form.category_id) })
    });
    if (res.ok) {
      showToast(editProduct ? '✅ Ürün güncellendi!' : '✅ Ürün eklendi!');
      setForm({ name: '', description: '', price: '', stock: '', category_id: '1', image_url: '' });
      setEditProduct(null);
      fetchProducts();
      fetchStats();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    await fetch(`http://localhost:3000/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    showToast('🗑️ Ürün silindi!');
    fetchProducts();
    fetchStats();
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id.toString(),
      image_url: product.image_url || ''
    });
    setActiveTab('add');
  };

  const categoryNames = { 1: 'Elbise', 2: 'Üst Giyim', 3: 'Alt Giyim', 4: 'Dış Giyim', 5: 'Aksesuar' };

  return (
    <div className="section">
      {toast && <div className="toast success">{toast}</div>}
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1>🛠️ Admin Paneli</h1>
        </div>

        {/* Sekmeler */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          <button className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('stats')}>📊 İstatistikler</button>
          <button className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('products')}>📦 Ürünler</button>
          <button className={`btn ${activeTab === 'add' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActiveTab('add'); setEditProduct(null); setForm({ name: '', description: '', price: '', stock: '', category_id: '1', image_url: '' }); }}>➕ Ürün Ekle</button>
        </div>

        {/* İstatistikler */}
        {activeTab === 'stats' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              { label: 'Toplam Ürün', value: stats.total_products, icon: '📦', color: '#6c63ff' },
              { label: 'Toplam Sipariş', value: stats.total_orders, icon: '🛒', color: '#22c55e' },
              { label: 'Toplam Kullanıcı', value: stats.total_users, icon: '👤', color: '#f59e0b' },
              { label: 'Toplam Gelir', value: stats.total_revenue?.toFixed(2) + ' ₺', icon: '💰', color: '#ef4444' },
            ].map((stat, i) => (
              <div key={i} className="card" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{stat.icon}</div>
                <h3 style={{ fontSize: '1.8rem', color: stat.color, marginBottom: '4px' }}>{stat.value}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Ürünler Listesi */}
        {activeTab === 'products' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {products.map(product => (
              <div key={product.id} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img
                  src={product.image_url || `https://picsum.photos/seed/${product.id}/80/80`}
                  alt={product.name}
                  style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700 }}>{product.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{categoryNames[product.category_id]} • Stok: {product.stock}</p>
                </div>
                <p style={{ fontWeight: 800, color: 'var(--accent)' }}>{product.price?.toFixed(2)} ₺</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => handleEdit(product)}>✏️ Düzenle</button>
                  <button className="btn btn-danger" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => handleDelete(product.id)}>🗑️ Sil</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ürün Ekle/Düzenle */}
        {activeTab === 'add' && (
          <div className="card" style={{ padding: '32px', maxWidth: '600px' }}>
            <h3 style={{ marginBottom: '24px' }}>{editProduct ? '✏️ Ürün Düzenle' : '➕ Yeni Ürün Ekle'}</h3>
            {[
              ['name', 'Ürün Adı', 'text'],
              ['description', 'Açıklama', 'text'],
              ['price', 'Fiyat (₺)', 'number'],
              ['stock', 'Stok', 'number'],
              ['image_url', 'Görsel URL (opsiyonel)', 'text'],
            ].map(([field, label, type]) => (
              <div key={field} className="form-group">
                <label className="form-label">{label}</label>
                <input
                  className="form-input"
                  type={type}
                  value={form[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select className="form-input" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                <option value="1">Elbise</option>
                <option value="2">Üst Giyim</option>
                <option value="3">Alt Giyim</option>
                <option value="4">Dış Giyim</option>
                <option value="5">Aksesuar</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} onClick={handleSubmit}>
              {editProduct ? '✅ Güncelle' : '➕ Ürün Ekle'}
            </button>
            {editProduct && (
              <button className="btn btn-outline" style={{ width: '100%', marginTop: '8px' }} onClick={() => { setEditProduct(null); setForm({ name: '', description: '', price: '', stock: '', category_id: '1', image_url: '' }); }}>
                İptal
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}