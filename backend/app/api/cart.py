from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.database.db import get_db
from app.models.models import CartItem, Order, OrderItem, Product, UserBehavior, User
from app.api.auth import get_current_user

router = APIRouter()

class CartAdd(BaseModel):
    product_id: int
    quantity: int = 1

@router.get("/")
def get_cart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    result = []
    total = 0
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            subtotal = product.price * item.quantity
            total += subtotal
            result.append({"id": item.id, "product": product, "quantity": item.quantity, "subtotal": subtotal})
    return {"items": result, "total": total}

@router.post("/add")
def add_to_cart(data: CartAdd, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    existing = db.query(CartItem).filter(CartItem.user_id == current_user.id, CartItem.product_id == data.product_id).first()
    if existing:
        existing.quantity += data.quantity
    else:
        cart_item = CartItem(user_id=current_user.id, product_id=data.product_id, quantity=data.quantity)
        db.add(cart_item)
    behavior = UserBehavior(user_id=current_user.id, product_id=data.product_id, action="add_to_cart")
    db.add(behavior)
    db.commit()
    return {"status": "added"}

@router.delete("/remove/{item_id}")
def remove_from_cart(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    return {"status": "removed"}

@router.put("/update/{item_id}")
def update_quantity(item_id: int, quantity: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    if quantity <= 0:
        db.delete(item)
    else:
        item.quantity = quantity
    db.commit()
    return {"status": "updated"}
