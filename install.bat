@echo off
title Школьная столовая - УСТАНОВКА
color 0B

echo ========================================
echo    УСТАНОВКА ПРОЕКТА
echo ========================================
echo.

echo [1/5] Проверка Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Node.js не установлен!
    echo Скачайте и установите с: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo [OK] Node.js %%i
echo.

echo [2/5] Установка зависимостей бэкенда...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось установить зависимости бэкенда
    pause
    exit /b 1
)
cd ..
echo [OK] Зависимости бэкенда установлены
echo.

echo [3/5] Установка зависимостей фронтенда...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось установить зависимости фронтенда
    pause
    exit /b 1
)
echo [OK] Зависимости фронтенда установлены
cd ..
echo.

echo [4/5] Установка дополнительных пакетов...
cd frontend
call npm install chart.js@4.4.0 --save
call npm install @vitejs/plugin-vue@4.3.1 --save-dev
cd ..
echo [OK] Дополнительные пакеты установлены
echo.

echo [5/5] Инициализация базы данных...
cd backend
node -e "import('./db.js').then(db => db.initialize()).then(() => console.log('[OK] База данных создана')).catch(err => console.error('[ERROR]', err))"
cd ..
echo.

echo ========================================
echo    ✅ УСТАНОВКА ЗАВЕРШЕНА!
echo ========================================
echo.
echo Для запуска используйте: start.bat
echo.
pause