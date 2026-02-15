@echo off
title Сброс базы данных
color 0E

echo ========================================
echo    СБРОС БАЗЫ ДАННЫХ
echo ========================================
echo.

echo [1/3] Остановка серверов...
taskkill /f /im node.exe >nul 2>nul
echo [OK] Серверы остановлены
echo.

echo [2/3] Удаление старой базы данных...
if exist "database.db" (
    del /f /q "database.db" >nul 2>nul
    echo [OK] База данных удалена
) else (
    echo [ИНФО] База данных не найдена
)
echo.

echo [3/3] Перезапустите сервер вручную командой: cd backend ^&^& node server.js
echo.

echo ========================================
echo    ✅ БАЗА ДАННЫХ СБРОШЕНА
echo ========================================
echo.
pause