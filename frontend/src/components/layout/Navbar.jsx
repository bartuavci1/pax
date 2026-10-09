import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

export default function Navbar() {
  const { itemCount } = useCart();
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const toggleDark = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
  };

  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">PAX<span></span></Link>
        <div className="navbar-search">
          <form onSubmit={handleSearch} className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text" placeholder="Ürün ara... (AI destekli)"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </form>
        </div>
        <div className="navbar-actions">
          <Link to="/products" className="nav-btn nav-btn-ghost">Ürünler</Link>
          <button onClick={toggleDark} className="nav-btn nav-btn-ghost">
            {darkMode ? '☀️' : '🌙'}
          </button>
          {user ? (
            <>
              <Link to="/cart" className="nav-btn nav-btn-ghost cart-btn">
                🛒 Sepet
                {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
              </Link>
              <Link to="/orders" className="nav-btn nav-btn-ghost">Siparişlerim</Link>
              <Link to="/profile?tab=favorites" className="nav-btn nav-btn-ghost">❤️ Favoriler</Link>
              <Link to="/profile" className="nav-btn nav-btn-ghost">👤 {user.username}</Link>
              <Link to="/admin" className="nav-btn nav-btn-ghost">🛠️ Admin</Link>
              <button onClick={logout} className="nav-btn nav-btn-ghost">Çıkış</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn nav-btn-ghost">Giriş Yap</Link>
              <Link to="/register" className="nav-btn nav-btn-primary">Kayıt Ol</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}