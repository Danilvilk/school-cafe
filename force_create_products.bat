@echo off
title Принудительное создание продуктов
color 0B

echo ========================================
echo    ПРИНУДИТЕЛЬНОЕ СОЗДАНИЕ ПРОДУКТОВ
echo ========================================
echo.

echo [1/3] Остановка серверов...
taskkill /f /im node.exe >nul 2>nul
echo [OK] Серверы остановлены
echo.

echo [2/3] Запуск скрипта создания продуктов...
node force_create_products.js
if %errorlevel% neq 0 (
    echo [ERROR] Ошибка при создании продуктов
    pause
    exit /b 1
)
echo.

echo [3/3] Готово!
echo.

echo ========================================
echo    ✅ ПРОДУКТЫ УСПЕШНО СОЗДАНЫ
echo ========================================
echo.
echo Запустите start.bat для запуска проекта
echo.
pause


