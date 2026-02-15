@echo off
cd C:\school-cafe
echo ========================================
echo    ПРОСТОЙ ЗАПУСК ЧЕРЕЗ PM2
echo ========================================
echo.

echo [1/2] Запуск бэкенда...
pm2 start backend/server.js --interpreter node --node-args="--es-module-specifier-resolution=node" --name "school-backend"
echo [OK] Бэкенд запущен
echo.

echo [2/2] Запуск фронтенда...
cd frontend
pm2 start npm --name "school-frontend" -- run serve
cd ..
echo [OK] Фронтенд запущен
echo.

echo ========================================
echo    ✅ ПРОЦЕССЫ ЗАПУЩЕНЫ
echo ========================================
echo.
pm2 status
echo.
pause