import { initialize, getDb } from './backend/db.js';

async function forceCreateProducts() {
  console.log('========================================');
  console.log('  ПРИНУДИТЕЛЬНОЕ СОЗДАНИЕ ПРОДУКТОВ');
  console.log('========================================');
  console.log();

  try {
    const db = await initialize();
    console.log('✅ База данных открыта');

    // Проверяем существование таблицы products
    const tableExists = await db.get(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='products'
    `);
    
    if (!tableExists) {
      console.log('⚠️ Таблица products не существует, создаем...');
      await db.exec(`
        CREATE TABLE products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          unit TEXT NOT NULL,
          stock REAL DEFAULT 0,
          max_stock REAL NOT NULL,
          min_stock REAL NOT NULL,
          expiry_date DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Таблица products создана');
    } else {
      console.log('✅ Таблица products существует');
    }

    // Удаляем все существующие продукты
    await db.run('DELETE FROM products');
    console.log('✅ Старые продукты удалены');

    // Создаем новые продукты
    console.log('📦 Создание новых продуктов...');
    
    const products = [
      ['Картофель', 'кг', 50, 100, 20, '2026-12-31'],
      ['Молоко', 'л', 30, 60, 10, '2026-10-15'],
      ['Яйца', 'шт', 200, 300, 50, '2026-10-20'],
      ['Мясо куриное', 'кг', 25, 50, 10, '2026-10-25'],
      ['Мука', 'кг', 40, 80, 15, '2026-11-30'],
      ['Масло подсолнечное', 'л', 15, 30, 5, '2026-12-31'],
      ['Сахар', 'кг', 20, 50, 10, '2026-12-31'],
      ['Соль', 'кг', 10, 20, 5, '2027-01-31'],
      ['Гречка', 'кг', 30, 60, 15, '2026-11-30'],
      ['Рис', 'кг', 35, 70, 15, '2026-11-30']
    ];
    
    for (const product of products) {
      await db.run(
        'INSERT INTO products (name, unit, stock, max_stock, min_stock, expiry_date) VALUES (?, ?, ?, ?, ?, ?)',
        product
      );
      console.log(`   ✅ Добавлен продукт: ${product[0]}`);
    }

    // Проверяем результат
    const newProducts = await db.all('SELECT * FROM products ORDER BY name');
    console.log(`\n✅ Всего создано продуктов: ${newProducts.length}`);
    
    console.log('\n📋 Список продуктов:');
    newProducts.forEach(p => {
      console.log(`   - ${p.name}: ${p.stock} ${p.unit} (мин: ${p.min_stock}, макс: ${p.max_stock})`);
    });

    console.log('\n========================================');
    console.log('✅ ПРОДУКТЫ УСПЕШНО СОЗДАНЫ');
    console.log('========================================');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

forceCreateProducts();