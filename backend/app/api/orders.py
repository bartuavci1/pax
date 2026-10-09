from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database.db import get_db
from app.models.models import Order, OrderItem, CartItem, Product, UserBehavior, User
from app.api.auth import get_current_user

router = APIRouter()

class ShippingAddress(BaseModel):
    full_name: str
    address: str
    city: str
    postal_code: str
    country: str
    phone: str

class OrderCreate(BaseModel):
    shipping_address: ShippingAddress

@router.post("/checkout")
def checkout(data: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    total = 0
    order_items_data = []
    for item in cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name if product else 'product'}")
        subtotal = product.price * item.quantity
        total += subtotal
        order_items_data.append((product, item.quantity, product.price))
    order = Order(user_id=current_user.id, total_amount=total, shipping_address=data.shipping_address.dict())
    db.add(order)
    db.flush()
    for product, quantity, price in order_items_data:
        order_item = OrderItem(order_id=order.id, product_id=product.id, quantity=quantity, price_at_purchase=price)
        db.add(order_item)
        product.stock -= quantity
        behavior = UserBehavior(user_id=current_user.id, product_id=product.id, action="purchase")
        db.add(behavior)
    for item in cart_items:
        db.delete(item)
    db.commit()
    db.refresh(order)
    return {"order_id": order.id, "total": total, "status": "pending"}

@router.get("/")
def get_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders

@router.get("/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    return {
        "id": order.id,
        "status": order.status,
        "total_amount": order.total_amount,
        "shipping_address": order.shipping_address,
        "created_at": order.created_at,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price_at_purchase": item.price_at_purchase,
                "product_name": db.query(Product).filter(Product.id == item.product_id).first().name
            }
            for item in items
        ]
    }
