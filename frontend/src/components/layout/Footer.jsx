import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">PAX<span></span></div>
            <p>Yapay zeka destekli alışveriş deneyimi. Sana en uygun ürünleri buluyoruz.</p>
          </div>
          <div className="footer-col">
            <h4>Alışveriş</h4>
            <Link to="/products">Tüm Ürünler</Link>
            <Link to="/products?category=1">Elbise</Link>
            <Link to="/products?category=2">Üst Giyim</Link>
            <Link to="/products?category=3">Alt Giyim</Link>
            <Link to="/products?category=4">Dış Giyim</Link>
            <Link to="/products?category=5">Aksesuar</Link>
          </div>
          <div className="footer-col">
            <h4>Hesap</h4>
            <Link to="/login">Giriş Yap</Link>
            <Link to="/register">Kayıt Ol</Link>
            <Link to="/orders">Siparişlerim</Link>
            <Link to="/profile">Profilim</Link>
          </div>
          <div className="footer-col">
            <h4>Yardım</h4>
            <Link to="#">SSS</Link>
            <Link to="#">İade Politikası</Link>
            <Link to="#">Kargo Bilgisi</Link>
            <Link to="#">İletişim</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 PAX. Tüm hakları saklıdır. 🤖 YZ Destekli</p>
        </div>
      </div>
    </footer>
  );
}
