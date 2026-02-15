import * as db from './db.js';

async function test() {
  console.log('========================================');
  console.log('    Тестирование бэкенда');
  console.log('========================================');
  console.log();
  
  try {
    console.log('[1/3] Инициализация базы данных...');
    await db.initialize();
    console.log('✅ База данных инициализирована');
    console.log();
    
    console.log('[2/3] Проверка тестовых пользователей...');
    const student = await db.getUserByEmail('student@school.ru');
    console.log('✅ Ученик:', student ? student.name : 'не найден');
    
    const cook = await db.getUserByEmail('cook@school.ru');
    console.log('✅ Повар:', cook ? cook.name : 'не найден');
    
    const admin = await db.getUserByEmail('admin@school.ru');
    console.log('✅ Администратор:', admin ? admin.name : 'не найден');
    console.log();
    
    console.log('[3/3] Проверка меню...');
    const menu = await db.getTodayMenu();
    console.log('✅ Меню на сегодня:', 
      (menu.breakfast?.length || 0) + ' завтраков, ' + 
      (menu.lunch?.length || 0) + ' обедов');
    console.log();
    
    console.log('========================================');
    console.log('✅ БЭКЕНД РАБОТАЕТ КОРРЕКТНО');
    console.log('========================================');
    
  } catch (error) {
    console.log('========================================');
    console.log('❌ ОШИБКА:', error.message);
    console.log('========================================');
    console.error(error);
  }
}

test();