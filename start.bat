@echo off
title Школьная столовая - ЗАПУСК
color 0A

echo ========================================
echo    ЗАПУСК СИСТЕМЫ ШКОЛЬНОГО ПИТАНИЯ
echo ========================================
echo.

echo [1/3] Проверка наличия базы данных...
if not exist "database.db" (
    echo [ВНИМАНИЕ] База данных не найдена!
    echo [ИНФО] Будет создана новая база данных при запуске
) else (
    echo [OK] База данных найдена
)
echo.

echo [2/3] Запуск бэкенд сервера...
start "Бэкенд - Школьная столовая" cmd /k "cd backend && node server.js"
if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось запустить бэкенд сервер
    pause
    exit /b 1
)
echo [OK] Бэкенд сервер запущен на порту 3000
echo.

echo [3/3] Запуск фронтенд сервера...
start "Фронтенд - Школьная столовая" cmd /k "cd frontend && npm run serve"
if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось запустить фронтенд сервер
    pause
    exit /b 1
)
echo [OK] Фронтенд сервер запущен на порту 5173
echo.

echo ========================================
echo    ✅ ПРОЕКТ УСПЕШНО ЗАПУЩЕН!
echo ========================================
echo.
echo    🌐 Фронтенд: http://localhost:5173
echo    🔧 Бэкенд:   http://localhost:3000
echo.
echo    📋 ТЕСТОВЫЕ УЧЕТНЫЕ ЗАПИСИ:
echo    ----------------------------------------
echo    Ученик:     student@school.ru / password123
echo    Повар:      cook@school.ru / password123
echo    Админ:      admin@school.ru / password123
echo    ----------------------------------------
echo.
echo    ⚡ Для остановки закройте окна серверов
echo       или используйте stop.bat
echo.
pause