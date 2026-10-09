import sqlite3

db_yolu = "ecommerce.db" 

try:
    conn = sqlite3.connect(db_yolu)
    cursor = conn.cursor()

    # Kullanıcı adını buraya tamamen küçük harflerle yazıyoruz
    kullanici_adin = "bartu" 

    # Hem kullanıcı adında hem de e-postada 'bartu' geçenleri admin yapar (büyük/küçük harf duyarsız)
    cursor.execute(
        "UPDATE users SET is_admin = 1 WHERE LOWER(username) LIKE ? OR LOWER(email) LIKE ?", 
        (f"%{kullanici_adin}%", f"%{kullanici_adin}%")
    )

    conn.commit()

    if cursor.rowcount > 0:
        print(f"🎉 Başarılı! İçinde '{kullanici_adin}' geçen {cursor.rowcount} kullanıcı artık ADMIN.")
    else:
        print("⚠️ Hâlâ bulunamadı. Kayıtlı kullanıcılara bir göz atalım:")
        
        # Eğer yine bulamazsa, veritabanında ne var ne yok ekrana basarız ki görebilelim:
        cursor.execute("SELECT id, username, email FROM users")
        kullanicilar = cursor.fetchall()
        for k in kullanicilar:
            print(f"ID: {k[0]} | Username: {k[1]} | Email: {k[2]}")

except sqlite3.Error as e:
    print(f"❌ Veritabanı hatası: {e}")

finally:
    if conn:
        conn.close()