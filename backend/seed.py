from app.database.db import SessionLocal, engine, Base
from app.models.models import Category, Product

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Mevcut verileri temizle
db.query(Product).delete()
db.query(Category).delete()
db.commit()

# Kategoriler
c1 = Category(name="Elbise", description="Gunluk ve ozel gun elbiseleri")
c2 = Category(name="Ust Giyim", description="Bluz, gomlek, kazak ve sweatshirt")
c3 = Category(name="Alt Giyim", description="Pantolon, etek ve sort")
c4 = Category(name="Dis Giyim", description="Mont, kaban ve trench coat")
c5 = Category(name="Aksesuar", description="Canta, sal ve taki")
db.add_all([c1, c2, c3, c4, c5])
db.commit()

# Urunler
products = [
    Product(name="Cicekli Midi Elbise", description="Yazlik cicek desenli midi boy elbise. Hafif kumasıyla yaz aylarında konfor saglar.", price=849, stock=45, category_id=1, rating=4.8, review_count=124),
    Product(name="Siyah Gece Elbisesi", description="Ozel gunler icin sik siyah gece elbisesi. V yaka ve ince askili tasarim.", price=1299, stock=30, category_id=1, rating=4.9, review_count=89),
    Product(name="Keten Yazlik Elbise", description="Dogal keten kumassen uretilmis yazlik elbise. Nefes alan yapisiyla tum gun konfor.", price=699, stock=60, category_id=1, rating=4.7, review_count=156),
    Product(name="Cizgili Mini Elbise", description="Klasik cizgili desen mini elbise. Gundelik kullanim icin ideal.", price=549, stock=40, category_id=1, rating=4.5, review_count=98),
    Product(name="Saten Elbise", description="Saten dokusunda midi boy aksamustu elbisesi. Zarif ve sik gorunum.", price=1599, stock=25, category_id=1, rating=4.9, review_count=67),
    Product(name="Oversize Keten Gomlek", description="Rahat kesim oversize keten gomlek. Hem gundelik hem de sik kombinlere uyar.", price=449, stock=80, category_id=2, rating=4.6, review_count=203),
    Product(name="Crop Orgu Kazak", description="El orgusu gorunumlu crop kazak. Sonbahar ve kis kombinleri icin ideal.", price=599, stock=55, category_id=2, rating=4.7, review_count=145),
    Product(name="Sifon Bluz", description="Hafif sifon kumas bluz. Ofis ve gundelik kullanima uygun sik tasarim.", price=349, stock=70, category_id=2, rating=4.5, review_count=178),
    Product(name="Belden Baglamali Gomlek", description="Belden baglamali uzun kollu gomlek. Hem ust hem de elbise olarak kullanilabilir.", price=499, stock=50, category_id=2, rating=4.6, review_count=112),
    Product(name="Fitilli Kadife Sweatshirt", description="Yumusak fitilli kadife sweatshirt. Kis aylarinda sicacik tutar.", price=649, stock=45, category_id=2, rating=4.8, review_count=89),
    Product(name="Yuksek Bel Denim Pantolon", description="Klasik yuksek bel denim pantolon. Her kombine uyum saglar.", price=799, stock=65, category_id=3, rating=4.7, review_count=234),
    Product(name="Pileli Mini Etek", description="Pileli mini etek. Hem rahat hem sik bir gorunum sunar.", price=449, stock=55, category_id=3, rating=4.6, review_count=167),
    Product(name="Keten Genis Paca Pantolon", description="Yazlik keten genis paca pantolon. Serin ve havadar yapisiyla yaz icin ideal.", price=649, stock=48, category_id=3, rating=4.7, review_count=145),
    Product(name="Deri Gorunumlu Tayt", description="Deri gorunumlu yuksek bel tayt. Spor ve gundelik kombinler icin uygun.", price=399, stock=75, category_id=3, rating=4.5, review_count=198),
    Product(name="Midi Kalem Etek", description="Ofis ve ozel gunler icin midi kalem etek. Sik ve profesyonel gorunum.", price=549, stock=40, category_id=3, rating=4.8, review_count=123),
    Product(name="Kasmir Karisimli Uzun Kaban", description="Kasmir karisimli uzun kaban. Kis aylarinda hem sicak hem sik gorunum saglar.", price=2499, stock=20, category_id=4, rating=4.9, review_count=78),
    Product(name="Kapitone Mont", description="Su gecirmez kapitone mont. Soguk havalarda maksimum koruma saglar.", price=1899, stock=30, category_id=4, rating=4.7, review_count=112),
    Product(name="Klasik Trench Coat", description="Zamansiz klasik trench coat. Ilkbahar ve sonbahar icin vazgecilmez parca.", price=1699, stock=25, category_id=4, rating=4.8, review_count=95),
    Product(name="Yun Karisimli Kisa Kaban", description="Yun karisimli kisa kaban. Her kombine uyum saglayan zamansiz tasarim.", price=1299, stock=35, category_id=4, rating=4.6, review_count=87),
    Product(name="Deri Omuz Canta", description="El yapimi deri omuz cantasi. Genis ic hacmiyle gundelik kullanim icin ideal.", price=1199, stock=40, category_id=5, rating=4.8, review_count=156),
    Product(name="Hasir Yaz Cantasi", description="El orgusu hasir yaz cantasi. Plaj ve gundelik kullanim icin sik secim.", price=449, stock=60, category_id=5, rating=4.6, review_count=134),
    Product(name="Ipek Sal", description="Dogal ipek sal. Her mevsim kullanilabilir, sik ve zarif gorunum.", price=699, stock=50, category_id=5, rating=4.9, review_count=89),
    Product(name="Mini Zincir Askili Canta", description="Zincir askili mini canta. Ozel gunler ve aksam kombinleri icin ideal.", price=899, stock=35, category_id=5, rating=4.7, review_count=112),
]
db.add_all(products)
db.commit()
db.close()

print("Veriler basariyla eklendi!")
print(str(len(products)) + " urun eklendi.")