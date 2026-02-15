@echo off
title Диагностика проекта - Школьная столовая
color 0E

echo ========================================
echo    ДИАГНОСТИКА ПРОЕКТА
echo    Школьная столовая
echo ========================================
echo.

echo [1/7] Проверка Node.js...
node --version >nul 2>nul
if %errorlevel% neq 0 (
    echo [❌] Node.js НЕ УСТАНОВЛЕН!
    echo     Скачайте с: https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo [✅] Node.js %NODE_VER%
)
echo.

echo [2/7] Проверка портов...
set PORT3000_FREE=1
netstat -an | find ":3000" >nul
if %errorlevel% equ 0 (
    echo [⚠️] Порт 3000 ЗАНЯТ (может быть запущен другой сервер)
    set PORT3000_FREE=0
) else (
    echo [✅] Порт 3000 свободен
)

set PORT5173_FREE=1
netstat -an | find ":5173" >nul
if %errorlevel% equ 0 (
    echo [⚠️] Порт 5173 ЗАНЯТ (может быть запущен другой сервер)
    set PORT5173_FREE=0
) else (
    echo [✅] Порт 5173 свободен
)
echo.

echo [3/7] Проверка зависимостей бэкенда...
if exist "backend\node_modules" (
    echo [✅] Зависимости бэкенда установлены
) else (
    echo [❌] Зависимости бэкенда НЕ УСТАНОВЛЕНЫ
    echo     Запустите: cd backend ^&^& npm install
)
echo.

echo [4/7] Проверка зависимостей фронтенда...
if exist "frontend\node_modules" (
    echo [✅] Зависимости фронтенда установлены
) else (
    echo [❌] Зависимости фронтенда НЕ УСТАНОВЛЕНЫ
    echo     Запустите: cd frontend ^&^& npm install
)
echo.

echo [5/7] Проверка базы данных...
if exist "database.db" (
    echo [✅] База данных найдена
    REM Показываем размер файла
    for %%i in (database.db) do set DBSIZE=%%~zi
    echo     Размер: %DBSIZE% байт
) else (
    echo [⚠️] База данных НЕ НАЙДЕНА
    echo     Будет создана при первом запуске
)
echo.

echo [6/7] Проверка конфигурационных файлов...
if exist "backend\server.js" (
    echo [✅] Файл сервера: backend\server.js
) else (
    echo [❌] Файл сервера ОТСУТСТВУЕТ
)

if exist "frontend\vite.config.js" (
    echo [✅] Конфигурация Vite: frontend\vite.config.js
) else (
    echo [⚠️] Конфигурация Vite ОТСУТСТВУЕТ
)

if exist "frontend\src\main.js" (
    echo [✅] Точка входа: frontend\src\main.js
) else (
    echo [❌] Точка входа ОТСУТСТВУЕТ
)
echo.

echo [7/7] Тестирование бэкенда...
echo Запуск теста базы данных...
cd backend
node test.js
if %errorlevel% neq 0 (
    echo [❌] Тест бэкенда НЕ ПРОЙДЕН
) else (
    echo [✅] Тест бэкенда ПРОЙДЕН
)
cd ..
echo.

echo ========================================
echo    ДИАГНОСТИКА ЗАВЕРШЕНА
echo ========================================
echo.
echo Для запуска проекта используйте: start.bat
echo Для переустановки используйте: install.bat
echo.
pause