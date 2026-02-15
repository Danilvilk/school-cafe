@echo off
title Инициализация базы данных - Школьная столовая
color 0B

echo ========================================
echo    ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ
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
    echo [INFO] База данных не найдена
)
echo.

echo [3/3] Создание новой базы данных...
node init_db.js
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Ошибка создания базы данных
    echo.
    pause
    exit /b 1
)
echo.

echo ========================================
echo    ✅ ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА
echo ========================================
echo.
echo Тестовые учетные записи:
echo ----------------------------------------
echo Ученик:     student@school.ru / password123
echo Повар:      cook@school.ru / password123
echo Админ:      admin@school.ru / password123
echo ----------------------------------------
echo.
echo Запустите start_simple.bat для запуска проекта
echo.
pause