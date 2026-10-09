from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import User
from app.api.auth import get_current_user
from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database.db import Base

class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

router = APIRouter()

@router.get("/")
def get_favorites(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.models import Product
    favs = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    result = []
    for fav in favs:
        product = db.query(Product).filter(Product.id == fav.product_id).first()
        if product:
            result.append({"fav_id": fav.id, "product": product})
    return result

@router.post("/{product_id}")
def add_favorite(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Favorite).filter(Favorite.user_id == current_user.id, Favorite.product_id == product_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "removed"}
    fav = Favorite(user_id=current_user.id, product_id=product_id)
    db.add(fav)
    db.commit()
    return {"status": "added"}

@router.get("/ids")
def get_favorite_ids(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    favs = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    return [f.product_id for f in favs]