from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.database.db import get_db
from app.models.models import Product, Category, User
from app.api.auth import get_current_user

router = APIRouter()

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category_id: int
    image_url: Optional[str] = ""

@router.get("/products")
def get_all_products(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return db.query(Product).all()

@router.post("/products")
def create_product(data: ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    product = Product(**data.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    db.delete(product)
    db.commit()
    return {"status": "deleted"}

@router.put("/products/{product_id}")
def update_product(product_id: int, data: ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    for key, value in data.dict().items():
        setattr(product, key, value)
    db.commit()
    return product

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    from app.models.models import Order, User as UserModel
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    total_users = db.query(UserModel).count()
    total_revenue = db.query(Order).all()
    revenue = sum(o.total_amount for o in total_revenue)
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_users": total_users,
        "total_revenue": revenue
    }