from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import products, users, orders, cart, ai, search, auth, favorites, reviews, coupons, admin
from app.database.db import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI E-Commerce API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(cart.router, prefix="/api/cart", tags=["Cart"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(favorites.router, prefix="/api/favorites", tags=["Favorites"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(coupons.router, prefix="/api/coupons", tags=["Coupons"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
@app.get("/")

def root():
    return {"message": "AI E-Commerce API is running"}