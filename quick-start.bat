@echo off
echo ========================================
echo    Школьная столовая - Быстрый запуск
echo ========================================
echo.

echo [1/6] Проверка Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ОШИБКА: Node.js не установлен!
    echo Скачайте с https://nodejs.org
    pause
    exit /b
)
echo Node.js найден!
echo.

echo [2/6] Установка зависимостей бэкенда...
cd backend
call npm install
echo.
echo Зависимости бэкенда установлены!
echo.

echo [3/6] Запуск бэкенда...
start /B node server.js
echo Бэкенд запущен на http://localhost:3000
cd ..
echo.

echo [4/6] Установка зависимостей фронтенда...
cd frontend
call npm install
echo.
echo Установка Chart.js...
call npm install chart.js@4.4.0 --save
echo Зависимости фронтенда установлены!
echo.

echo [5/6] Запуск фронтенда...
start http://localhost:5173
call npm run serve