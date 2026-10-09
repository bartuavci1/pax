@echo off
echo PAX baslatiliyor...

set PATH=%PATH%;C:\Users\bartu.avci\Desktop\nodejs

echo Backend baslatiliyor...
start cmd /k "cd C:\Users\bartu.avci\Desktop\pax\pax\backend && python -m uvicorn app.main:app --reload"

echo Backend baslayana kadar bekleniyor...
timeout /t 8 /nobreak

echo Frontend baslatiliyor...
start cmd /k "cd C:\Users\bartu.avci\Desktop\pax\pax\frontend && set PATH=%PATH%;C:\Users\bartu.avci\Desktop\nodejs && set REACT_APP_API_URL=http://127.0.0.1:8000/api && npm start"

echo Tamamlandi!