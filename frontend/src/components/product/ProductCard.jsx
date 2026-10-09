import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

const categoryNames = {
  1: 'Elbise',
  2: 'Üst Giyim',
  3: 'Alt Giyim',
  4: 'Dış Giyim',
  5: 'Aksesuar'
};

const productImages = {
  'Cicekli Midi Elbise': '/images/1.jpg',
  'Siyah Gece Elbisesi': '/images/2.jpg',
  'Keten Yazlik Elbise': '/images/3.jpg',
  'Cizgili Mini Elbise': '/images/4.jpg',
  'Saten Aksamustu Elbise': '/images/5.jpg',
  'Oversize Keten Gomlek':  '/images/6.jpg',
  'Crop Orgu Kazak':  '/images/7.jpg',
  'Sifon Bluz':  '/images/8.jpg',
  'Belden Baglamali Gomlek':  '/images/9.jpg',
  'Fitilli Kadife Sweatshirt':  '/images/10.jpg',
  'Yuksek Bel Denim Pantolon': '/images/11.jpg',
  'Pileli Mini Etek':  '/images/12.jpg',
  'Keten Genis Paca Pantolon':  '/images/13.jpg',
  'Deri Gorunumlu Tayt':  '/images/14.jpg',
  'Midi Kalem Etek':  '/images/15.jpg',
  'Kasmir Karisimli Uzun Kaban':  '/images/16.jpg',
  'Kapitone Mont':  '/images/17.jpg',
  'Klasik Trench Coat':  '/images/18.jpg',
  'Yun Karisimli Kisa Kaban':  '/images/19.jpg',
  'Deri Omuz Canta':  '/images/20.jpg',
  'Hasir Yaz Cantasi':  '/images/21.jpg',
  'Ipek Sal':  '/images/22.jpg',
  'Mini Zincir Askili Canta':  '/images/23.jpg',
};

export default function ProductCard({ product, onAddToast, favoriteIds = [], onFavoriteChange }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isFav, setIsFav] = useState(favoriteIds.includes(product.id));

  useEffect(() => {
    setIsFav(favoriteIds.includes(product.id));
  }, [favoriteIds, product.id]);

  const getImage = () => {
    if (product.image_url) return product.image_url;
    for (const [key, url] of Object.entries(productImages)) {
      if (product.name.includes(key) || key.includes(product.name.split(' ')[0])) return url;
    }
    return `https://picsum.photos/seed/${product.id}/400/400`;
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userStr) { navigate('/login'); return; }
    try {
      await addToCart(product.id);
      onAddToast?.('Ürün sepete eklendi! 🛒');
    } catch {}
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      const res = await fetch(`http://localhost:8000/api/favorites/${product.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setIsFav(data.status === 'added');
      onAddToast?.(data.status === 'added' ? '❤️ Favorilere eklendi!' : '💔 Favorilerden çıkarıldı');
      onFavoriteChange?.();
    } catch {}
  };

  return (
    <div className="card product-card" onClick={() => navigate(`/products/${product.id}`)}>
      <div className="product-card-image-wrap">
        <img src={getImage()} alt={product.name} className="product-card-image" />
        <button
          onClick={handleFavorite}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'white', border: 'none', borderRadius: '50%',
            width: '34px', height: '34px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'transform 0.2s'
          }}
        >
          {isFav ? '❤️' : '🤍'}
        </button>
        {product.stock <= 5 && product.stock > 0 && (
          <span className="product-card-badge">Son {product.stock} adet!</span>
        )}
        {product.stock === 0 && (
          <span className="product-card-badge" style={{ background: '#6b6b6b' }}>Tükendi</span>
        )}
      </div>
      <div className="product-card-body">
        <p className="product-card-category">{categoryNames[product.category_id] || `Kategori ${product.category_id}`}</p>
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-rating">
          <span className="stars">{'★'.repeat(Math.round(product.rating || 0))}</span>
          <span>({product.review_count || 0})</span>
        </div>
        <div className="product-card-footer">
          <span className="product-price">{product.price?.toFixed(2)} ₺</span>
          <button className="add-cart-btn" onClick={handleAddToCart} disabled={product.stock === 0}>+</button>
        </div>
      </div>
    </div>
  );
}