@echo off
title Школьная столовая - ОЧИСТКА
color 0E

echo ========================================
echo    ОЧИСТКА ПРОЕКТА
echo ========================================
echo.
echo ВНИМАНИЕ: Будут удалены:
echo   - node_modules (бэкенд и фронтенд)
echo   - database.db
echo   - dist (сборка фронтенда)
echo.

set /p confirm="Продолжить? (y/n): "

if /i "%confirm%" neq "y" (
    echo Операция отменена
    pause
    exit /b 0
)

echo.
echo [1/4] Остановка серверов...
taskkill /f /im node.exe >nul 2>nul
echo [OK] Серверы остановлены
echo.

echo [2/4] Удаление зависимостей...
if exist "backend\node_modules" (
    rmdir /s /q "backend\node_modules" >nul 2>nul
    echo [OK] Удалены зависимости бэкенда
)
if exist "frontend\node_modules" (
    rmdir /s /q "frontend\node_modules" >nul 2>nul
    echo [OK] Удалены зависимости фронтенда
)
echo.

echo [3/4] Удаление базы данных...
if exist "database.db" (
    del /f /q "database.db" >nul 2>nul
    echo [OK] Удалена база данных
)
echo.

echo [4/4] Удаление сборки...
if exist "frontend\dist" (
    rmdir /s /q "frontend\dist" >nul 2>nul
    echo [OK] Удалена сборка фронтенда
)
echo.

echo ========================================
echo    ✅ ПРОЕКТ ОЧИЩЕН
echo ========================================
echo.
echo Для установки используйте: install.bat
echo.
pause