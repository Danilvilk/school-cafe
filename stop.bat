@echo off
title Школьная столовая - ОСТАНОВКА
color 0C

echo ========================================
echo    ОСТАНОВКА СЕРВЕРОВ
echo ========================================
echo.

echo [1/2] Остановка процессов Node.js...
taskkill /f /im node.exe >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Серверы остановлены
) else (
    echo [ИНФО] Серверы не были запущены
)
echo.

echo [2/2] Закрытие окон...
for /f "tokens=2 delims=," %%a in ('tasklist /fi "windowtitle eq Бэкенд - Школьная столовая" /fo csv /nh 2^>nul') do (
    taskkill /f /pid %%a >nul 2>nul
)
for /f "tokens=2 delims=," %%a in ('tasklist /fi "windowtitle eq Фронтенд - Школьная столовая" /fo csv /nh 2^>nul') do (
    taskkill /f /pid %%a >nul 2>nul
)
echo [OK] Окна закрыты
echo.

echo ========================================
echo    ✅ СЕРВЕРЫ ОСТАНОВЛЕНЫ
echo ========================================
timeout /t 2 /nobreak >nul
exit