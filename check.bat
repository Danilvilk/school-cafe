@echo off
title Школьная столовая - ПРОВЕРКА
color 0F

echo ========================================
echo    ПРОВЕРКА УСТАНОВКИ
echo ========================================
echo.

echo [1/6] Проверка Node.js...
node --version >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Node.js не установлен!
) else (
    for /f "tokens=*" %%i in ('node --version') do echo [OK] Node.js %%i
)
echo.

echo [2/6] Проверка зависимостей бэкенда...
if exist "backend\node_modules" (
    echo [OK] Зависимости бэкенда установлены
) else (
    echo [ОШИБКА] Зависимости бэкенда не установлены
    echo        Запустите install.bat
)
echo.

echo [3/6] Проверка зависимостей фронтенда...
if exist "frontend\node_modules" (
    echo [OK] Зависимости фронтенда установлены
) else (
    echo [ОШИБКА] Зависимости фронтенда не установлены
    echo        Запустите install.bat
)
echo.

echo [4/6] Проверка базы данных...
if exist "database.db" (
    echo [OK] База данных найдена
    for %%i in (database.db) do echo    Размер: %%~zi байт
) else (
    echo [ПРЕДУПРЕЖДЕНИЕ] База данных не найдена
    echo        Будет создана при первом запуске
)
echo.

echo [5/6] Проверка портов...
netstat -an | find ":3000" >nul
if %errorlevel% equ 0 (
    echo [ПРЕДУПРЕЖДЕНИЕ] Порт 3000 занят
) else (
    echo [OK] Порт 3000 свободен
)

netstat -an | find ":5173" >nul
if %errorlevel% equ 0 (
    echo [ПРЕДУПРЕЖДЕНИЕ] Порт 5173 занят
) else (
    echo [OK] Порт 5173 свободен
)
echo.

echo [6/6] Проверка конфигурации...
if exist "backend\server.js" (
    echo [OK] Файл сервера найден
) else (
    echo [ОШИБКА] Файл сервера не найден
)

if exist "frontend\vite.config.js" (
    echo [OK] Конфигурация Vite найдена
) else (
    echo [ПРЕДУПРЕЖДЕНИЕ] Конфигурация Vite не найдена
)
echo.

echo ========================================
echo    ПРОВЕРКА ЗАВЕРШЕНА
echo ========================================
echo.
echo Для установки: install.bat
echo Для запуска:   start.bat
echo Для сброса БД: reset-db.bat
echo.
pause