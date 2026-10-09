from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from pydantic import BaseModel
from app.database.db import get_db, Base
from app.api.auth import get_current_user
from app.models.models import User

class Coupon(Base):
    __tablename__ = "coupons"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False)
    discount_percent = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CouponCheck(BaseModel):
    code: str

router = APIRouter()

@router.post("/check")
def check_coupon(data: CouponCheck, db: Session = Depends(get_db)):
    coupon = db.query(Coupon).filter(Coupon.code == data.code.upper(), Coupon.is_active == True).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Geçersiz veya süresi dolmuş kupon")
    return {"code": coupon.code, "discount_percent": coupon.discount_percent}