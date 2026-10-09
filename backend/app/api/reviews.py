from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from pydantic import BaseModel
from app.database.db import get_db, Base
from app.models.models import User, Product
from app.api.auth import get_current_user

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    rating = Column(Float, nullable=False)
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ReviewCreate(BaseModel):
    rating: float
    comment: str = ""

router = APIRouter()

@router.get("/{product_id}")
def get_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.product_id == product_id).all()
    result = []
    for r in reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        result.append({
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at,
            "username": user.username if user else "Kullanıcı"
        })
    return result

@router.post("/{product_id}")
def add_review(product_id: int, data: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Review).filter(Review.user_id == current_user.id, Review.product_id == product_id).first()
    if existing:
        existing.rating = data.rating
        existing.comment = data.comment
        db.commit()
        return {"status": "updated"}
    review = Review(user_id=current_user.id, product_id=product_id, rating=data.rating, comment=data.comment)
    db.add(review)
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        all_reviews = db.query(Review).filter(Review.product_id == product_id).all()
        total = sum(r.rating for r in all_reviews) + data.rating
        product.rating = total / (len(all_reviews) + 1)
        product.review_count = len(all_reviews) + 1
    db.commit()
    return {"status": "added"}