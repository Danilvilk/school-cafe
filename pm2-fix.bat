@echo off
cd C:\school-cafe
echo ========================================
echo    ИСПРАВЛЕНИЕ ПРОБЛЕМ PM2
echo ========================================
echo.

echo [1/6] Остановка всех PM2 процессов...
pm2 stop all >nul 2>nul
pm2 delete all >nul 2>nul
echo [OK] Процессы остановлены
echo.

echo [2/6] Очистка кэша PM2...
pm2 flush >nul 2>nul
echo [OK] Кэш очищен
echo.

echo [3/6] Удаление старой конфигурации...
del ecosystem.config.js.bak >nul 2>nul
echo [OK] Старая конфигурация удалена
echo.

echo [4/6] Создание папки для логов...
if not exist logs mkdir logs
echo [OK] Папка логов создана
echo.

echo [5/6] Переустановка зависимостей фронтенда...
cd frontend
call npm install
cd ..
echo [OK] Зависимости фронтенда установлены
echo.

echo [6/6] Переустановка зависимостей бэкенда...
cd backend
call npm install
cd ..
echo [OK] Зависимости бэкенда установлены
echo.

echo ========================================
echo    ✅ ИСПРАВЛЕНИЕ ЗАВЕРШЕНО
echo ========================================
echo.
echo Теперь запустите: pm2-start.bat
echo.
pause