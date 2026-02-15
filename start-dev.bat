@echo off
cd C:\school-cafe
echo ========================================
echo    ЗАПУСК В РЕЖИМЕ РАЗРАБОТКИ
echo ========================================
echo.

echo [1/2] Запуск бэкенда...
start "Бэкенд - Школьная столовая" cmd /k "cd backend && node server.js"
timeout /t 2 /nobreak >nul
echo [OK] Бэкенд запущен
echo.

echo [2/2] Запуск фронтенда...
start "Фронтенд - Школьная столовая" cmd /k "cd frontend && npm run serve"
echo [OK] Фронтенд запущен
echo.

echo ========================================
echo    ✅ ПРОЕКТ ЗАПУЩЕН
echo ========================================
echo.
echo Фронтенд: http://localhost:5173
echo Бэкенд:   http://localhost:3000
echo.
echo Для остановки закройте окна серверов
echo.
pause