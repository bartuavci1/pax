# 🛒 PAX - Yapay Zeka Destekli E-Ticaret Platformu



## ✨ Özellikler
- 🤖 **AI Chatbot** — 7/24 müşteri desteği 
- ✨ **Kişisel Öneri Sistemi** — Kullanıcı davranışına göre YZ önerileri
- 🔍 **Semantik Arama** — Doğal dil ile akıllı ürün arama
- 👤 **Kullanıcı Yönetimi** — JWT tabanlı auth sistemi
- 🛒 **Sepet & Sipariş** — Tam e-ticaret akışı
- 📦 **Sipariş Takibi** — Gerçek zamanlı sipariş durumu

## 🏗️ Teknoloji Stack

| Katman | Teknoloji |
|---|---|
| Frontend | React 18, React Router v6, Axios |
| Backend | Python 3.11, FastAPI, SQLAlchemy |
| Veritabanı | PostgreSQL 15 |
| YZ | Anthropic API |
| Auth | JWT (python-jose), bcrypt |
| Container | Docker, Docker Compose |

## 🗄️ Veritabanı Şeması
```
Users ──────────────┐
  │                 │
  ├── Orders ────── OrderItems ──── Products ──── Categories
  │                                     │
  ├── CartItems ─────────────────────────┘
  │
  ├── UserBehaviors ──────────────── Products
  │
  ├── AIRecommendations
  └── ChatSessions
```

## 🚀 Kurulum

### Gereksinimler
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Anthropic API Anahtarı

### 1. Repoyu Klonla
```bash
git clone <repo-url>
cd pax
```

### 2. Backend Kurulum
```bash
cd backend
cp .env.example .env
# .env dosyasını düzenle: ANTHROPIC_API_KEY ekle
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend Kurulum
```bash
cd frontend
npm install
npm start
```

### 4. Docker ile Kurulum (Önerilen)
```bash
cp backend/.env.example backend/.env
# ANTHROPIC_API_KEY değerini .env'e ekle
docker-compose up --build
```

## 📡 API Endpoints

| Method | Endpoint | Açıklama |
|---|---|---|
| POST | /api/auth/register | Kullanıcı kaydı |
| POST | /api/auth/login | Giriş |
| GET | /api/products/ | Ürün listesi |
| GET | /api/products/{id} | Ürün detayı |
| POST | /api/cart/add | Sepete ekle |
| GET | /api/cart/ | Sepeti görüntüle |
| POST | /api/orders/checkout | Sipariş oluştur |
| POST | /api/ai/chat | AI chatbot |
| POST | /api/ai/recommendations | YZ önerileri |
| GET | /api/search/?q=... | Semantik arama |

## 📁 Proje Yapısı
```
ecommerce-ai/
├── backend/
│   ├── app/
│   │   ├── api/           # API endpoint'leri
│   │   ├── models/        # Veritabanı modelleri
│   │   ├── database/      # DB bağlantısı
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/    # React bileşenleri
│   │   ├── pages/         # Sayfalar
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Yardımcı fonksiyonlar
│   │   └── styles/        # CSS
│   └── package.json
├── docker-compose.yml
└── README.md
```

##  Geliştirici Notları
- API dokümantasyonu: http://localhost:8000/docs
- Veritabanı tabloları uygulama başlangıcında otomatik oluşturulur
- Admin kullanıcısı için `is_admin=True` veritabanında manuel ayarlanmalı
