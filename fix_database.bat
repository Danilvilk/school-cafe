@echo off
title Исправление базы данных
color 0B

echo ========================================
echo    ИСПРАВЛЕНИЕ БАЗЫ ДАННЫХ
echo ========================================
echo.

echo [1/3] Остановка серверов...
taskkill /f /im node.exe >nul 2>nul
echo [OK] Серверы остановлены
echo.

echo [2/3] Запуск скрипта исправления...
node fix_database.js
if %errorlevel% neq 0 (
    echo [ERROR] Ошибка при исправлении базы данных
    pause
    exit /b 1
)
echo.

echo [3/3] Готово!
echo.

echo ========================================
echo    ✅ ИСПРАВЛЕНИЕ ЗАВЕРШЕНО
echo ========================================
echo.
echo Запустите start.bat для запуска проекта
echo.
pause