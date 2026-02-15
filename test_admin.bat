@echo off
title Тест админского инвентаря
color 0B

echo ========================================
echo    ТЕСТИРОВАНИЕ АДМИНСКОГО ИНВЕНТАРЯ
echo ========================================
echo.

node test_admin_inventory.js

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Тест не пройден
    pause
    exit /b 1
)

echo.
pause