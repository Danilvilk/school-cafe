@echo off
cd C:\school-cafe
echo ========================================
echo    ЗАПУСК PM2 ПРОЦЕССОВ
echo ========================================
echo.

echo [1/3] Создание папки для логов...
if not exist logs mkdir logs
echo [OK] Папка логов создана
echo.

echo [2/3] Проверка файлов...
if not exist backend\server.js (
    echo [ОШИБКА] backend\server.js не найден!
    pause
    exit /b 1
)
if not exist frontend\node_modules\.bin\vite (
    echo [ОШИБКА] Vite не установлен в фронтенде!
    echo Запустите: cd frontend ^&^& npm install
    pause
    exit /b 1
)
echo [OK] Все файлы найдены
echo.

echo [3/3] Запуск PM2 процессов...
pm2 start ecosystem.config.js
if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось запустить PM2 процессы
    pause
    exit /b 1
)
echo [OK] PM2 процессы запущены
echo.

echo ========================================
echo    ✅ PM2 ПРОЦЕССЫ ЗАПУЩЕНЫ
echo ========================================
echo.
echo Бэкенд: http://localhost:3000
echo Фронтенд: http://localhost:5173
echo.
echo Для просмотра статуса: pm2 status
echo Для просмотра логов:   pm2 logs
echo Для остановки:         pm2 stop all
echo.
pause