import { initialize, getDb } from './backend/db.js';

async function fixDatabase() {
  console.log('========================================');
  console.log('  ПРОВЕРКА И ИСПРАВЛЕНИЕ БАЗЫ ДАННЫХ');
  console.log('========================================');
  console.log();

  try {
    const db = await initialize();
    console.log('✅ База данных открыта');

    // Проверяем наличие продуктов
    const products = await db.all('SELECT * FROM products');
    console.log(`📦 Найдено продуктов: ${products.length}`);

    if (products.length === 0) {
      console.log('⚠️ Продукты не найдены, создаем тестовые...');
      
      const testProducts = [
        ['Картофель', 'кг', 50, 100, 20, '2026-12-31'],
        ['Молоко', 'л', 30, 60, 10, '2026-10-15'],
        ['Яйца', 'шт', 200, 300, 50, '2026-10-20'],
        ['Мясо куриное', 'кг', 25, 50, 10, '2026-10-25'],
        ['Мука', 'кг', 40, 80, 15, '2026-11-30']
      ];

      for (const product of testProducts) {
        await db.run(
          'INSERT INTO products (name, unit, stock, max_stock, min_stock, expiry_date) VALUES (?, ?, ?, ?, ?, ?)',
          product
        );
      }
      console.log('✅ Тестовые продукты созданы');
    }

    // Проверяем меню на сегодня
    const today = new Date().toISOString().split('T')[0];
    const dailyMenus = await db.all('SELECT * FROM daily_menus WHERE date = ?', [today]);
    console.log(`📅 Меню на сегодня: ${dailyMenus.length} позиций`);

    if (dailyMenus.length === 0) {
      console.log('⚠️ Меню на сегодня не найдено, создаем...');
      
      const dishes = await db.all('SELECT id, type FROM dishes WHERE is_active = 1');
      for (const dish of dishes) {
        await db.run(
          'INSERT INTO daily_menus (dish_id, date, type, total_servings, remaining_servings) VALUES (?, ?, ?, ?, ?)',
          [dish.id, today, dish.type, 50, 50]
        );
      }
      console.log('✅ Меню создано');
    }

    // Проверяем статистику
    const breakfastStats = await db.get(`
      SELECT 
        COUNT(DISTINCT mo.id) as ordered,
        COUNT(sm.id) as served,
        COALESCE(SUM(dm.remaining_servings), 0) as remaining
      FROM daily_menus dm
      LEFT JOIN meal_orders mo ON dm.dish_id = mo.dish_id AND mo.date = dm.date AND mo.type = 'breakfast' AND mo.status = 'confirmed'
      LEFT JOIN served_meals sm ON dm.dish_id = sm.dish_id AND sm.date = dm.date AND sm.type = 'breakfast'
      WHERE dm.date = ? AND dm.type = 'breakfast'
    `, [today]);

    console.log('📊 Статистика завтрак:', breakfastStats);

    const lunchStats = await db.get(`
      SELECT 
        COUNT(DISTINCT mo.id) as ordered,
        COUNT(sm.id) as served,
        COALESCE(SUM(dm.remaining_servings), 0) as remaining
      FROM daily_menus dm
      LEFT JOIN meal_orders mo ON dm.dish_id = mo.dish_id AND mo.date = dm.date AND mo.type = 'lunch' AND mo.status = 'confirmed'
      LEFT JOIN served_meals sm ON dm.dish_id = sm.dish_id AND sm.date = dm.date AND sm.type = 'lunch'
      WHERE dm.date = ? AND dm.type = 'lunch'
    `, [today]);

    console.log('📊 Статистика обед:', lunchStats);

    console.log();
    console.log('========================================');
    console.log('  ✅ ПРОВЕРКА ЗАВЕРШЕНА');
    console.log('========================================');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

fixDatabase();