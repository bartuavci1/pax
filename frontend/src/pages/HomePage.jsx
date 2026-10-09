import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

function Toast({ message, type }) {
  return message ? <div className={`toast ${type}`}>{message}</div> : null;
}

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recReason, setRecReason] = useState('');
  const [toast, setToast] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products/?limit=8&sort_by=rating').then(res => setFeatured(res.data.products)).catch(() => {});
    if (user) {
      api.post('/ai/recommendations', { limit: 6 })
        .then(res => { setRecommendations(res.data.recommendations); setRecReason(res.data.reason); })
        .catch(() => {});
    }
  }, [user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <>
      <Toast message={toast} type="success" />

      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-tag"> Yapay Zeka Destekli Alışveriş</div>
          <h1>Kadın Modasının <em>Akıllı</em> Adresi<br />PAX</h1>
          <p>Yapay zeka destekli stil önerileri, akıllı arama ve kişisel moda asistanınızla alışveriş deneyimini yeniden keşfedin.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              🛍️ Alışverişe Başla
            </Link>
            <button onClick={() => document.querySelector('.chat-toggle')?.click()} className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', padding: '14px 32px', borderRadius: '50px' }}>
              💬 AI ile Konuş
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              { icon: '🤖', title: 'AI Chatbot', desc: '7/24 akıllı asistan ile ürün önerisi, sipariş takibi ve sorularınız için destek alın.' },
              { icon: '✨', title: 'Kişisel Öneriler', desc: 'Davranışlarınıza göre size özel ürün önerileri sunan yapay zeka motoru.' },
              { icon: '🔍', title: 'Akıllı Arama', desc: 'Doğal dil ile arama yapın. "Koşu için hafif ayakkabı" gibi aramalar desteklenir.' },
            ].map((f, i) => (
              <div key={i} className="card" style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommendations */}
      {user && recommendations.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">🤖 <span>Senin İçin</span> Öneriler</h2>
              {recReason && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '300px', textAlign: 'right' }}>{recReason}</p>}
            </div>
            <div className="products-grid">
              {recommendations.map(p => <ProductCard key={p.id} product={p} onAddToast={showToast} />)}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">⭐ <span>Öne Çıkan</span> Ürünler</h2>
            <Link to="/products" className="btn btn-outline">Tümünü Gör</Link>
          </div>
          <div className="products-grid">
            {featured.map(p => <ProductCard key={p.id} product={p} onAddToast={showToast} />)}
          </div>
        </div>
      </section>
    </>
  );
}
