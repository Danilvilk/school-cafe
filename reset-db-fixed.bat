@echo off
title Сброс базы данных - Школьная столовая
color 0E

echo ========================================
echo    СБРОС БАЗЫ ДАННЫХ
echo ========================================
echo.

echo [1/4] Остановка серверов...
taskkill /f /im node.exe >nul 2>nul
echo [OK] Серверы остановлены
echo.

echo [2/4] Удаление старой базы данных...
if exist "database.db" (
    del /f /q "database.db" >nul 2>nul
    echo [OK] База данных удалена
) else (
    echo [INFO] База данных не найдена
)
echo.

echo [3/4] Создание новой базы данных...
cd backend
node -e "
import('./db.js').then(db => {
  db.initialize()
    .then(() => {
      console.log('[OK] Новая база данных успешно создана');
      process.exit(0);
    })
    .catch(err => {
      console.error('[ERROR] Ошибка создания базы данных:', err);
      process.exit(1);
    });
}).catch(err => {
  console.error('[ERROR] Ошибка импорта:', err);
  process.exit(1);
});
"
cd ..
echo.

echo [4/4] Проверка базы данных...
cd backend
node -e "
import('./db.js').then(async db => {
  try {
    const users = await db.getUserByEmail('admin@school.ru');
    console.log('[OK] Проверка пройдена. Администратор:', users ? users.name : 'найден');
    process.exit(0);
  } catch (err) {
    console.error('[ERROR] Ошибка проверки:', err);
    process.exit(1);
  }
}).catch(err => {
  console.error('[ERROR] Ошибка импорта:', err);
  process.exit(1);
});
"
cd ..
echo.

echo ========================================
echo    ✅ БАЗА ДАННЫХ УСПЕШНО СБРОШЕНА!
echo ========================================
echo.
echo Запустите start.bat для запуска проекта
echo.
pause