import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import api from '../utils/api';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [interpretation, setInterpretation] = useState('');
  const [mode, setMode] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    api.get(`/search/?q=${encodeURIComponent(query)}&limit=12`)
      .then(res => { setResults(res.data.results); setInterpretation(res.data.interpretation || ''); setMode(res.data.mode); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [query]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  return (
    <div className="section">
      {toast && <div className="toast success">{toast}</div>}
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.75rem' }}>
            "<span style={{ color: 'var(--accent)' }}>{query}</span>" için sonuçlar
          </h1>
          {interpretation && (
            <div style={{ marginTop: '12px', padding: '12px 20px', background: 'rgba(108,99,255,0.08)', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
              <span>🤖</span>
              <span><strong>AI Yorumu:</strong> {interpretation}</span>
            </div>
          )}
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.875rem' }}>
            {results.length} sonuç bulundu {mode === 'semantic' ? '(AI destekli arama)' : '(anahtar kelime araması)'}
          </p>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '3rem' }}>🔍</div>
            <h3 style={{ marginTop: '16px' }}>Sonuç bulunamadı</h3>
            <p style={{ color: 'var(--text-muted)' }}>Farklı bir arama terimi deneyin.</p>
          </div>
        ) : (
          <div className="products-grid">
            {results.map(p => <ProductCard key={p.id} product={p} onAddToast={showToast} />)}
          </div>
        )}
      </div>
    </div>
  );
}
