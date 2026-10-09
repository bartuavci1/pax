from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from google import genai
import os
import json
import uuid
import re 
from app.database.db import get_db
from app.models.models import Product, UserBehavior, AIRecommendation, ChatSession, User
from app.api.auth import get_current_user
from dotenv import load_dotenv

load_dotenv()

# Gemini istemcisini oluştur
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("UYARI: GEMINI_API_KEY ortam değişkeni bulunamadı!")
client = genai.Client(api_key=api_key)

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    session_token: Optional[str] = None

class RecommendationRequest(BaseModel):
    limit: int = 6

def get_product_catalog_summary(db: Session) -> str:
    products = db.query(Product).filter(Product.stock > 0).limit(50).all() 
    summary = []
    for p in products:
        summary.append(f"ID:{p.id} | {p.name} | Fiyat: {p.price}TL | Kategori ID:{p.category_id} | Stok:{p.stock}")
    return "\n".join(summary)

@router.post("/chat")
def chat_with_ai(data: ChatMessage, db: Session = Depends(get_db)):
    session_token = data.session_token or str(uuid.uuid4())
    session = db.query(ChatSession).filter(ChatSession.session_token == session_token).first()
    
    if not session:
        session = ChatSession(session_token=session_token, messages=json.dumps([]))
        db.add(session)
        db.flush()

    try:
        messages = json.loads(session.messages) if session.messages else []
    except (TypeError, json.JSONDecodeError):
        messages = []

    messages.append({"role": "user", "content": data.message})

    product_catalog = get_product_catalog_summary(db)

    system_prompt = f"""Sen bir kadin giyim e-ticaret platformunun yardımsever yapay zeka asistanısın.
Magaza adı: PaxAI.
Turkce konusuyorsun ve musterilere urun onerisi ve genel yardim konularında destek veriyorsun.

Mevcut urun katalogu:
{product_catalog}

Kurallar:
- Her zaman nazik, yardımsever ve kısa cevaplar ver
- Urun onerirken urun adını belirt
- Fiyatları TL cinsinden belirt
- Stokta olmayan urunleri onerme
- Moda ve stil onerileri konusunda da yardımcı ol
"""

    conversation_history = ""
    for msg in messages[-6:]:
        role = "Kullanici" if msg["role"] == "user" else "Asistan"
        conversation_history += f"{role}: {msg['content']}\n"

    full_prompt = f"{system_prompt}\n\nKonusma gecmisi:\n{conversation_history}\nAsistan:"

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash", # BURASI GÜNCELLENDİ
            contents=full_prompt
        )
        assistant_message = response.text
    except Exception as e:
        print(f"Gemini error: {e}")
        assistant_message = "Uzgunum, su an sistemde gecici bir baglanti sorunu yasiyorum. Lutfen birazdan tekrar deneyin."

    messages.append({"role": "assistant", "content": assistant_message})
    
    session.messages = json.dumps(messages)
    db.commit()

    return {"response": assistant_message, "session_token": session_token}

@router.post("/recommendations")
def get_recommendations(data: RecommendationRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    behaviors = db.query(UserBehavior).filter(UserBehavior.user_id == current_user.id).order_by(UserBehavior.created_at.desc()).limit(20).all()

    if not behaviors:
        products = db.query(Product).order_by(Product.rating.desc()).limit(data.limit).all()
        return {"recommendations": products, "reason": "Sizin icin en populer urunlerimiz."}

    behavior_summary = []
    for b in behaviors:
        product = db.query(Product).filter(Product.id == b.product_id).first()
        if product:
            behavior_summary.append(f"{b.action}: {product.name} (Kategori:{product.category_id})")

    all_products = db.query(Product).filter(Product.stock > 0).all()
    product_list = [f"ID:{p.id} | {p.name} | {p.price}TL | Kategori:{p.category_id} | Rating:{p.rating}" for p in all_products]

    prompt = f"""Kullanicinin davranis gecmisi:
{chr(10).join(behavior_summary)}

Mevcut urunler:
{chr(10).join(product_list)}

Bu kullaniciya tam olarak {data.limit} adet farkli urun oner. 
YANITIN SADECE AŞAĞIDAKİ GİBİ GEÇERLİ BİR JSON FORMATINDA OLMALIDIR (BAŞKA HİÇBİR METİN YAZMA):
{{"product_ids": [1, 2, 3], "reason": "Oneri sebebini kisaca acikla"}}"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",  # BURASI DA GÜNCELLENDİ
            contents=prompt
        )
        
        text = response.text.strip()
        
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
             clean_json = match.group(0)
             result = json.loads(clean_json)
        else:
             raise ValueError("Gelen yanit gecerli bir JSON icermiyor.")

        product_ids = result.get("product_ids", [])
        reason = result.get("reason", "")
        
        recommended_products = [db.query(Product).filter(Product.id == pid).first() for pid in product_ids]
        recommended_products = [p for p in recommended_products if p] 

        if not recommended_products:
             raise ValueError("Urun bulunamadi")

        rec = AIRecommendation(user_id=current_user.id, product_ids=json.dumps(product_ids), reason=reason)
        db.add(rec)
        db.commit()

        return {"recommendations": recommended_products, "reason": reason}
        
    except Exception as e:
        print(f"Recommendation error: {e}")
        products = db.query(Product).order_by(Product.rating.desc()).limit(data.limit).all()
        return {"recommendations": products, "reason": "Size ozel sectigimiz un populer urunler."}

@router.get("/users")
def get_users_placeholder():
    return []