@echo off
cd C:\school-cafe
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

echo [2/6] Проверка PM2...
pm2 --version >nul 2>nul
if %errorlevel% neq 0 (
    echo [ПРЕДУПРЕЖДЕНИЕ] PM2 не установлен
    echo   Установите: npm install -g pm2
) else (
    for /f "tokens=*" %%i in ('pm2 --version') do echo [OK] PM2 %%i
)
echo.

echo [3/6] Проверка файлов проекта...
if exist backend\server.js (
    echo [OK] backend\server.js найден
) else (
    echo [ОШИБКА] backend\server.js не найден!
)

if exist frontend\package.json (
    echo [OK] frontend\package.json найден
) else (
    echo [ОШИБКА] frontend\package.json не найден!
)

if exist frontend\node_modules (
    echo [OK] Зависимости фронтенда установлены
) else (
    echo [ПРЕДУПРЕЖДЕНИЕ] Зависимости фронтенда не установлены
    echo   Запустите: cd frontend ^&^& npm install
)

if exist backend\node_modules (
    echo [OK] Зависимости бэкенда установлены
) else (
    echo [ПРЕДУПРЕЖДЕНИЕ] Зависимости бэкенда не установлены
    echo   Запустите: cd backend ^&^& npm install
)
echo.

echo [4/6] Проверка портов...
netstat -an | find ":3000" >nul
if %errorlevel% equ 0 (
    echo [ПРЕДУПРЕЖДЕНИЕ] Порт 3000 уже используется
) else (
    echo [OK] Порт 3000 свободен
)

netstat -an | find ":5173" >nul
if %errorlevel% equ 0 (
    echo [ПРЕДУПРЕЖДЕНИЕ] Порт 5173 уже используется
) else (
    echo [OK] Порт 5173 свободен
)
echo.

echo [5/6] Проверка базы данных...
if exist database.db (
    echo [OK] База данных найдена
) else (
    echo [ПРЕДУПРЕЖДЕНИЕ] База данных не найдена
    echo   Будет создана при первом запуске
)
echo.

echo [6/6] Проверка конфигурации Vite...
if exist frontend\vite.config.js (
    echo [OK] Vite конфигурация найдена
) else (
    echo [ПРЕДУПРЕЖДЕНИЕ] Vite конфигурация не найдена
)
echo.

echo ========================================
echo    ПРОВЕРКА ЗАВЕРШЕНА
echo ========================================
echo.
echo Рекомендации:
echo   - Для простого запуска: start-dev.bat
echo   - Для PM2: сначала запустите pm2-fix.bat, затем pm2-simple.bat
echo.
pause