from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.database.db import get_db
from app.models.models import Product, Category, UserBehavior
from app.api.auth import get_current_user
from app.models.models import User

router = APIRouter()

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    image_url: str = ""
    category_id: int
    tags: List[str] = []

@router.get("/")
def get_products(
    skip: int = 0,
    limit: int = 20,
    category_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = "created_at",
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "rating":
        query = query.order_by(Product.rating.desc())
    else:
        query = query.order_by(Product.created_at.desc())
    total = query.count()
    products = query.offset(skip).limit(limit).all()
    return {"total": total, "products": products}

@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/")
def create_product(data: ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    product = Product(**data.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.post("/{product_id}/view")
def track_view(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    behavior = UserBehavior(user_id=current_user.id, product_id=product_id, action="view")
    db.add(behavior)
    db.commit()
    return {"status": "tracked"}

@router.get("/categories/all")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()
