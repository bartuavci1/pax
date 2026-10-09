import React, { useState, useEffect } from 'react';
import ProductCard from '../components/product/ProductCard';
import api from '../utils/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [toast, setToast] = useState('');
  const limit = 12;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ skip: page * limit, limit, sort_by: sortBy });
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      const res = await api.get(`/products/?${params}`);
      setProducts(res.data.products);
      setTotal(res.data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [page, sortBy]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  return (
    <div className="section">
      {toast && <div className="toast success">{toast}</div>}
      <div className="container">
        <div style={{ display: 'flex', gap: '32px' }}>
          {/* Filters */}
          <aside style={{ width: '240px', flexShrink: 0 }}>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '20px' }}>Filtreler</h3>
              <div className="form-group">
                <label className="form-label">Sıralama</label>
                <select className="form-input" value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(0); }}>
                  <option value="created_at">En Yeni</option>
                  <option value="price_asc">Fiyat: Artan</option>
                  <option value="price_desc">Fiyat: Azalan</option>
                  <option value="rating">En Yüksek Puan</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Min Fiyat (₺)</label>
                <input type="number" className="form-input" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Max Fiyat (₺)</label>
                <input type="number" className="form-input" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="99999" />
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setPage(0); fetchProducts(); }}>Uygula</button>
            </div>
          </aside>

          {/* Products */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '1.75rem' }}>Tüm Ürünler <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 400 }}>({total} ürün)</span></h1>
            </div>
            {loading ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map(p => <ProductCard key={p.id} product={p} onAddToast={showToast} />)}
                </div>
                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
                  <button className="btn btn-outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Önceki</button>
                  <span style={{ padding: '12px 20px', fontWeight: 600 }}>{page + 1} / {Math.ceil(total / limit) || 1}</span>
                  <button className="btn btn-outline" disabled={(page + 1) * limit >= total} onClick={() => setPage(p => p + 1)}>Sonraki →</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
