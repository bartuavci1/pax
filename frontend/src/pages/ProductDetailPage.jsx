import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';



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

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  const fetchProduct = async () => {
    const res = await fetch(`http://localhost:8000/api/products/${id}`);
    const data = await res.json();
    setProduct(data);
    setLoading(false);
  };

  const fetchReviews = async () => {
    const res = await fetch(`http://localhost:8000/api/reviews/${id}`);
    const data = await res.json();
    setReviews(data);
  };

  const getImage = () => {
    if (product.image_url) return product.image_url;
    for (const [key, url] of Object.entries(productImages)) {
      if (product.name.includes(key) || key.includes(product.name.split(' ')[0])) return url;
    }
    // Detay sayfası olduğu için resmi biraz daha büyük (600x600) çekiyoruz
    return `https://picsum.photos/seed/${product.id}/600/600`;
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const handleAddToCart = async () => {
    const token = getToken();
    if (!token) { navigate('/login'); return; }
    await fetch('http://localhost:8000/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ product_id: product.id, quantity })
    });
    setToast('Sepete eklendi! 🛒');
    setTimeout(() => setToast(''), 3000);
  };

  const handleReview = async () => {
    const token = getToken();
    if (!token) { navigate('/login'); return; }
    await fetch(`http://localhost:8000/api/reviews/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ rating, comment })
    });
    setComment('');
    setRating(5);
    fetchReviews();
    fetchProduct();
    setToast('Değerlendirmeniz eklendi! ⭐');
    setTimeout(() => setToast(''), 3000);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!product) return <div className="container section"><h2>Ürün bulunamadı.</h2></div>;

  return (
    <div className="section">
      {toast && <div className="toast success">{toast}</div>}
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}>
          <div>
            <img
            src={getImage()}
            alt={product.name}
            style={{ width: '100%', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', objectFit: 'cover' }}
          />
          </div>
          <div>
            <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              {['Elektronik', 'Giyim', 'Ev & Yaşam', 'Spor'][product.category_id - 1]}
            </p>
            <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span style={{ color: 'var(--warning)', fontSize: '1.2rem' }}>{'★'.repeat(Math.round(product.rating || 0))}</span>
              <span style={{ color: 'var(--text-muted)' }}>({product.review_count || 0} değerlendirme)</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontFamily: 'Syne', fontWeight: 800, color: 'var(--accent)', marginBottom: '24px' }}>
              {product.price?.toFixed(2)} ₺
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '24px' }}>{product.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <span style={{ fontWeight: 600 }}>Adet:</span>
              <div className="quantity-control">
                <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {product.stock > 0 ? `${product.stock} adet mevcut` : 'Stokta yok'}
              </span>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1rem' }} onClick={handleAddToCart} disabled={product.stock === 0}>
              🛒 Sepete Ekle
            </button>
          </div>
        </div>

        {/* Değerlendirmeler */}
        <div style={{ marginTop: '60px' }}>
          <h2 style={{ marginBottom: '32px' }}>⭐ Değerlendirmeler ({reviews.length})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

            {/* Yorum Yaz */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '20px' }}>Değerlendirme Yaz</h3>
              <div className="form-group">
                <label className="form-label">Puanın</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.8rem', color: star <= rating ? '#f59e0b' : '#ddd' }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Yorumun</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Bu ürün hakkında ne düşünüyorsunuz?"
                  style={{ resize: 'none' }}
                />
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleReview}>
                ⭐ Değerlendirmeyi Gönder
              </button>
            </div>

            {/* Yorumlar Listesi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.length === 0 ? (
                <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Henüz değerlendirme yok. İlk değerlendiren siz olun!</p>
                </div>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700 }}>@{review.username}</span>
                      <span style={{ color: '#f59e0b' }}>{'★'.repeat(review.rating)}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{review.comment}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '8px' }}>
                      {new Date(review.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}