from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import anthropic
import os
import json
from app.database.db import get_db
from app.models.models import Product

router = APIRouter()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

@router.get("/")
def semantic_search(
    q: str = Query(..., min_length=1),
    limit: int = 12,
    db: Session = Depends(get_db)
):
    # First do basic keyword search
    keyword_results = db.query(Product).filter(
        Product.name.ilike(f"%{q}%") | Product.description.ilike(f"%{q}%")
    ).limit(limit).all()

    if len(keyword_results) >= limit:
        return {"results": keyword_results, "query": q, "mode": "keyword"}

    # Use AI for semantic understanding
    all_products = db.query(Product).filter(Product.stock > 0).all()
    product_list = [f"ID:{p.id} | {p.name} | {p.description[:100] if p.description else ''} | Etiketler:{p.tags}" for p in all_products]

    prompt = f"""Kullanıcı şunu arıyor: "{q}"

Ürün listesi:
{chr(10).join(product_list[:100])}

Bu aramaya en uygun ürünlerin ID'lerini listele. En fazla {limit} ürün seç.
Sadece JSON formatında cevap ver:
{{"product_ids": [1, 2, 3], "interpretation": "Aramanın yorumu"}}"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        )
        result = json.loads(response.content[0].text)
        product_ids = result.get("product_ids", [])
        interpretation = result.get("interpretation", "")

        semantic_results = [db.query(Product).filter(Product.id == pid).first() for pid in product_ids]
        semantic_results = [p for p in semantic_results if p]

        # Merge keyword + semantic, deduplicate
        all_ids = set()
        final = []
        for p in keyword_results + semantic_results:
            if p.id not in all_ids:
                all_ids.add(p.id)
                final.append(p)

        return {"results": final[:limit], "query": q, "interpretation": interpretation, "mode": "semantic"}
    except:
        return {"results": keyword_results, "query": q, "mode": "keyword"}
