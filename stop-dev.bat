@echo off
echo ========================================
echo    ОСТАНОВКА СЕРВЕРОВ
echo ========================================
echo.

echo Завершение процессов Node.js...
taskkill /f /im node.exe >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Серверы остановлены
) else (
    echo [ИНФО] Серверы не были запущены
)
echo.
pause