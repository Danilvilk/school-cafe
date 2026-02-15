import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import ExcelJS from 'exceljs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database.db');

let db;

export async function initialize() {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log('📦 База данных открыта');
    
    await createTables();
    await seedData();
    
    console.log('✅ База данных инициализирована');
    return db;
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error);
    throw error;
  }
}

export function getDb() {
  return db;
}

async function createTables() {
  console.log('🏗️ Создание таблиц...');
  
  // 1. Таблица users
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      class TEXT,
      balance INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Таблица users создана');

  // 2. Таблица registration_requests - с правильной структурой
  await db.exec(`
    CREATE TABLE IF NOT EXISTS registration_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      class TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME,
      approved_by INTEGER,
      FOREIGN KEY (approved_by) REFERENCES users (id)
    )
  `);
  console.log('✅ Таблица registration_requests создана');

  // 3. Таблица dishes
  await db.exec(`
    CREATE TABLE IF NOT EXISTS dishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('breakfast', 'lunch')),
      calories INTEGER,
      protein INTEGER,
      fat INTEGER,
      carbs INTEGER,
      allergens TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Таблица dishes создана');

  // 4. Таблица daily_menus
  await db.exec(`
    CREATE TABLE IF NOT EXISTS daily_menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dish_id INTEGER NOT NULL,
      date DATE NOT NULL,
      type TEXT NOT NULL,
      total_servings INTEGER NOT NULL,
      remaining_servings INTEGER NOT NULL,
      FOREIGN KEY (dish_id) REFERENCES dishes (id),
      UNIQUE(dish_id, date)
    )
  `);
  console.log('✅ Таблица daily_menus создана');

  // 5. Таблица allergies
  await db.exec(`
    CREATE TABLE IF NOT EXISTS allergies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      allergy TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(user_id, allergy)
    )
  `);
  console.log('✅ Таблица allergies создана');

  // 6. Таблица meal_orders
  await db.exec(`
    CREATE TABLE IF NOT EXISTS meal_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      dish_id INTEGER NOT NULL,
      dish_name TEXT NOT NULL,
      date DATE NOT NULL,
      type TEXT NOT NULL,
      price INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      confirmed_at DATETIME,
      confirmed_by INTEGER,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (dish_id) REFERENCES dishes (id),
      FOREIGN KEY (confirmed_by) REFERENCES users (id),
      UNIQUE(user_id, date, type)
    )
  `);
  console.log('✅ Таблица meal_orders создана');

  // 7. Таблица served_meals
  await db.exec(`
    CREATE TABLE IF NOT EXISTS served_meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      dish_id INTEGER NOT NULL,
      dish_name TEXT NOT NULL,
      date DATE NOT NULL,
      type TEXT NOT NULL,
      price INTEGER NOT NULL,
      order_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (dish_id) REFERENCES dishes (id),
      FOREIGN KEY (order_id) REFERENCES meal_orders (id)
    )
  `);
  console.log('✅ Таблица served_meals создана');

  // 8. Таблица payments
  await db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('one-time', 'subscription')),
      subscription_type TEXT,
      status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  console.log('✅ Таблица payments создана');

  // 9. Таблица reviews
  await db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      dish_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (dish_id) REFERENCES dishes (id),
      UNIQUE(user_id, dish_id)
    )
  `);
  console.log('✅ Таблица reviews создана');

  // 10. Таблица products
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
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

  // 11. Таблица purchase_requests
  await db.exec(`
    CREATE TABLE IF NOT EXISTS purchase_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_by INTEGER,
      approved_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME,
      FOREIGN KEY (created_by) REFERENCES users (id),
      FOREIGN KEY (approved_by) REFERENCES users (id)
    )
  `);
  console.log('✅ Таблица purchase_requests создана');
}

async function seedData() {
  console.log('🌱 Заполнение тестовыми данными...');
  
  try {
    // Проверяем пользователей
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count === 0) {
      console.log('   Создание тестовых пользователей...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await db.run(
        'INSERT INTO users (email, password, name, role, class, balance) VALUES (?, ?, ?, ?, ?, ?)',
        ['student@school.ru', hashedPassword, 'Иванов Иван', 'student', '10А', 500]
      );
      
      await db.run(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['cook@school.ru', hashedPassword, 'Петрова Мария', 'cook']
      );
      
      await db.run(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin@school.ru', hashedPassword, 'Сидоров Алексей', 'admin']
      );
      console.log('   ✅ Тестовые пользователи созданы');
    }

    // Проверяем продукты
    const productCount = await db.get('SELECT COUNT(*) as count FROM products');
    if (productCount.count === 0) {
      console.log('   Создание тестовых продуктов...');
      
      const products = [
        ['Картофель', 'кг', 50, 100, 20, '2026-12-31'],
        ['Молоко', 'л', 30, 60, 10, '2026-10-15'],
        ['Яйца', 'шт', 200, 300, 50, '2026-10-20'],
        ['Мясо куриное', 'кг', 25, 50, 10, '2026-10-25'],
        ['Мука', 'кг', 40, 80, 15, '2026-11-30']
      ];
      
      for (const product of products) {
        await db.run(
          'INSERT INTO products (name, unit, stock, max_stock, min_stock, expiry_date) VALUES (?, ?, ?, ?, ?, ?)',
          product
        );
      }
      console.log('   ✅ Тестовые продукты созданы');
    }

    // Проверяем блюда
    const dishCount = await db.get('SELECT COUNT(*) as count FROM dishes');
    if (dishCount.count === 0) {
      console.log('   Создание тестовых блюд...');
      
      const dishes = [
        ['Овсяная каша', 'Овсяная каша с фруктами', 80, 'breakfast', 250, 8, 4, 40, 'Глютен,Лактоза'],
        ['Сырники', 'Сырники со сметаной', 90, 'breakfast', 300, 12, 15, 25, 'Лактоза,Яйца'],
        ['Омлет', 'Омлет с сыром', 85, 'breakfast', 280, 15, 18, 5, 'Яйца,Лактоза'],
        ['Борщ', 'Борщ со сметаной', 120, 'lunch', 180, 6, 8, 20, 'Глютен,Лактоза'],
        ['Котлета с пюре', 'Куриная котлета с картофельным пюре', 150, 'lunch', 350, 20, 15, 30, 'Глютен'],
        ['Салат Цезарь', 'Салат с курицей и соусом', 130, 'lunch', 220, 18, 12, 8, 'Яйца,Рыба']
      ];
      
      for (const dish of dishes) {
        await db.run(
          'INSERT INTO dishes (name, description, price, type, calories, protein, fat, carbs, allergens) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          dish
        );
      }
      console.log('   ✅ Тестовые блюда созданы');
      
      const today = new Date().toISOString().split('T')[0];
      const dishesForToday = await db.all('SELECT id, type FROM dishes WHERE is_active = 1');
      
      for (const dish of dishesForToday) {
        await db.run(
          'INSERT INTO daily_menus (dish_id, date, type, total_servings, remaining_servings) VALUES (?, ?, ?, ?, ?)',
          [dish.id, today, dish.type, 50, 50]
        );
      }
      console.log('   ✅ Меню создано');
    }

    console.log('✅ Тестовые данные успешно добавлены');
  } catch (error) {
    console.error('❌ Ошибка при заполнении тестовыми данными:', error);
    throw error;
  }
}

// Пользователи
export async function getUserByEmail(email) {
  return await db.get('SELECT * FROM users WHERE email = ?', email);
}

export async function createUser(userData) {
  const { name, email, password, role, class: studentClass, balance = 0 } = userData;
  
  let query = 'INSERT INTO users (email, password, name, role';
  let values = [email, password, name, role];
  let placeholders = '?, ?, ?, ?';
  
  if (role === 'student' && studentClass) {
    query += ', class, balance';
    values.push(studentClass, balance);
    placeholders += ', ?, ?';
  } else {
    query += ', balance';
    values.push(balance);
    placeholders += ', ?';
  }
  
  query += ') VALUES (' + placeholders + ')';
  
  const result = await db.run(query, values);
  return { id: result.lastID, email, name, role, balance };
}

// Регистрационные заявки
export async function createRegistrationRequest(userData) {
  const { name, email, password, role, class: studentClass } = userData;
  
  let query = 'INSERT INTO registration_requests (name, email, password, role';
  let values = [name, email, password, role];
  let placeholders = '?, ?, ?, ?';
  
  if (role === 'student' && studentClass) {
    query += ', class';
    values.push(studentClass);
    placeholders += ', ?';
  }
  
  query += ', status) VALUES (' + placeholders + ', ?)';
  values.push('pending');
  
  const result = await db.run(query, values);
  return { 
    id: result.lastID, 
    name, 
    email, 
    role,
    class: studentClass,
    status: 'pending' 
  };
}

export async function getPendingRegistrationRequest(email) {
  return await db.get(
    'SELECT id FROM registration_requests WHERE email = ? AND status = ?',
    [email, 'pending']
  );
}

export async function getPendingRegistrationRequests() {
  return await db.all(`
    SELECT * FROM registration_requests 
    WHERE status = 'pending' 
    ORDER BY created_at ASC
  `);
}

export async function getAllRegistrationRequests() {
  return await db.all(`
    SELECT * FROM registration_requests 
    ORDER BY created_at DESC
  `);
}

export async function approveRegistrationRequest(requestId, adminId) {
  const request = await db.get(
    'SELECT * FROM registration_requests WHERE id = ?',
    requestId
  );
  
  if (!request) {
    throw new Error('Заявка не найдена');
  }
  
  // Создаем пользователя
  const userData = {
    name: request.name,
    email: request.email,
    password: request.password,
    role: request.role,
    balance: 0
  };
  
  if (request.role === 'student') {
    userData.class = request.class;
  }
  
  await createUser(userData);
  
  await db.run(
    'UPDATE registration_requests SET status = ?, approved_at = CURRENT_TIMESTAMP, approved_by = ? WHERE id = ?',
    ['approved', adminId, requestId]
  );
  
  return { success: true };
}

export async function rejectRegistrationRequest(requestId) {
  await db.run(
    'UPDATE registration_requests SET status = ? WHERE id = ?',
    ['rejected', requestId]
  );
  return { success: true };
}

// Баланс
export async function getStudentBalance(userId) {
  const user = await db.get('SELECT balance FROM users WHERE id = ?', userId);
  return user ? user.balance : 0;
}

// Заказы учеников
export async function createMealOrder(userId, dishId, type) {
  try {
    console.log(`Создание заказа: userId=${userId}, dishId=${dishId}, type=${type}`);
    
    const today = new Date().toISOString().split('T')[0];
    
    const existing = await db.get(
      'SELECT id, status FROM meal_orders WHERE user_id = ? AND date = ? AND type = ?',
      [userId, today, type]
    );
    
    if (existing) {
      throw new Error('Вы уже заказали этот приём пищи на сегодня');
    }
    
    const dish = await db.get('SELECT id, name, price FROM dishes WHERE id = ?', dishId);
    
    if (!dish) {
      throw new Error('Блюдо не найдено');
    }
    
    const user = await db.get('SELECT balance FROM users WHERE id = ?', userId);
    
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    if (user.balance < dish.price) {
      throw new Error('Недостаточно средств на балансе');
    }
    
    await db.run(
      'UPDATE users SET balance = balance - ? WHERE id = ?',
      [dish.price, userId]
    );
    
    const result = await db.run(
      'INSERT INTO meal_orders (user_id, dish_id, dish_name, date, type, price, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, dish.id, dish.name, today, type, dish.price, 'pending']
    );
    
    return { 
      id: result.lastID, 
      message: 'Заказ создан, ожидайте подтверждения повара' 
    };
  } catch (error) {
    console.error('Ошибка в createMealOrder:', error);
    throw error;
  }
}

export async function getPendingOrders() {
  const orders = await db.all(`
    SELECT 
      mo.*,
      u.name as student_name,
      u.class as student_class
    FROM meal_orders mo
    JOIN users u ON mo.user_id = u.id
    WHERE mo.status = 'pending' AND mo.date = date('now')
    ORDER BY mo.created_at ASC
  `);
  return orders;
}

export async function confirmOrder(orderId, cookId) {
  try {
    const order = await db.get(
      'SELECT * FROM meal_orders WHERE id = ? AND status = ?',
      [orderId, 'pending']
    );
    
    if (!order) {
      throw new Error('Заказ не найден или уже подтвержден');
    }
    
    const menuItem = await db.get(
      'SELECT id, remaining_servings FROM daily_menus WHERE dish_id = ? AND date = ?',
      [order.dish_id, order.date]
    );
    
    if (!menuItem) {
      throw new Error('Блюдо не найдено в меню на сегодня');
    }
    
    if (menuItem.remaining_servings <= 0) {
      throw new Error('Блюдо закончилось');
    }
    
    await db.run(
      'UPDATE daily_menus SET remaining_servings = remaining_servings - 1 WHERE id = ?',
      menuItem.id
    );
    
    await db.run(
      'UPDATE meal_orders SET status = ?, confirmed_at = CURRENT_TIMESTAMP, confirmed_by = ? WHERE id = ?',
      ['confirmed', cookId, orderId]
    );
    
    await db.run(
      'INSERT INTO served_meals (user_id, dish_id, dish_name, date, type, price, order_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [order.user_id, order.dish_id, order.dish_name, order.date, order.type, order.price, orderId]
    );
    
    return { success: true, message: 'Заказ подтвержден' };
  } catch (error) {
    console.error('Ошибка в confirmOrder:', error);
    throw error;
  }
}

export async function getStudentOrderForToday(userId, type) {
  const today = new Date().toISOString().split('T')[0];
  const order = await db.get(
    'SELECT * FROM meal_orders WHERE user_id = ? AND date = ? AND type = ?',
    [userId, today, type]
  );
  return order;
}

export async function getStudentMeals(userId) {
  const meals = await db.all(`
    SELECT * FROM served_meals 
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  `, userId);
  return meals;
}

// Платежи
export async function processPayment(userId, amount, type, data = {}) {
  if (type === 'one-time') {
    await db.run(
      'UPDATE users SET balance = balance + ? WHERE id = ?',
      [amount, userId]
    );
    
    await db.run(
      'INSERT INTO payments (user_id, amount, type) VALUES (?, ?, ?)',
      [userId, amount, type]
    );
  } else if (type === 'subscription') {
    let subscriptionAmount = 0;
    if (data.type === 'breakfast') subscriptionAmount = 1500;
    else if (data.type === 'lunch') subscriptionAmount = 2000;
    else if (data.type === 'both') subscriptionAmount = 3200;
    
    await db.run(
      'UPDATE users SET balance = balance + ? WHERE id = ?',
      [subscriptionAmount, userId]
    );
    
    await db.run(
      'INSERT INTO payments (user_id, amount, type, subscription_type) VALUES (?, ?, ?, ?)',
      [userId, subscriptionAmount, type, data.type]
    );
  }
  
  return { success: true };
}

// Аллергии
export async function updateAllergies(userId, allergies) {
  await db.run('DELETE FROM allergies WHERE user_id = ?', userId);
  
  for (const allergy of allergies) {
    await db.run(
      'INSERT INTO allergies (user_id, allergy) VALUES (?, ?)',
      [userId, allergy]
    );
  }
}

export async function getAllergies(userId) {
  const allergies = await db.all(
    'SELECT allergy FROM allergies WHERE user_id = ?',
    userId
  );
  return allergies.map(a => a.allergy);
}

// Отзывы
export async function addReview(userId, dishId, rating, comment) {
  await db.run(
    `INSERT INTO reviews (user_id, dish_id, rating, comment) 
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, dish_id) 
     DO UPDATE SET rating = ?, comment = ?, created_at = CURRENT_TIMESTAMP`,
    [userId, dishId, rating, comment, rating, comment]
  );
}

export async function getAllReviews() {
  try {
    const reviews = await db.all(`
      SELECT 
        r.*,
        u.name as student_name,
        u.class as student_class,
        d.name as dish_name,
        d.type as dish_type
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN dishes d ON r.dish_id = d.id
      ORDER BY r.created_at DESC
    `);
    return reviews || [];
  } catch (error) {
    console.error('Ошибка получения отзывов:', error);
    return [];
  }
}

export async function deleteReview(reviewId) {
  await db.run('DELETE FROM reviews WHERE id = ?', reviewId);
}

// Статистика для повара
export async function getMealStats() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const breakfastTotal = await db.get(`
      SELECT COALESCE(SUM(total_servings), 0) as total,
             COALESCE(SUM(remaining_servings), 0) as remaining
      FROM daily_menus 
      WHERE date = ? AND type = 'breakfast'
    `, [today]);
    
    const lunchTotal = await db.get(`
      SELECT COALESCE(SUM(total_servings), 0) as total,
             COALESCE(SUM(remaining_servings), 0) as remaining
      FROM daily_menus 
      WHERE date = ? AND type = 'lunch'
    `, [today]);
    
    const breakfastOrders = await db.get(`
      SELECT COUNT(*) as count
      FROM meal_orders 
      WHERE date = ? AND type = 'breakfast' AND status = 'confirmed'
    `, [today]);
    
    const lunchOrders = await db.get(`
      SELECT COUNT(*) as count
      FROM meal_orders 
      WHERE date = ? AND type = 'lunch' AND status = 'confirmed'
    `, [today]);
    
    const breakfastServed = await db.get(`
      SELECT COUNT(*) as count
      FROM served_meals 
      WHERE date = ? AND type = 'breakfast'
    `, [today]);
    
    const lunchServed = await db.get(`
      SELECT COUNT(*) as count
      FROM served_meals 
      WHERE date = ? AND type = 'lunch'
    `, [today]);
    
    return {
      breakfast: { 
        ordered: breakfastOrders?.count || 0,
        served: breakfastServed?.count || 0, 
        total: breakfastTotal?.total || 0, 
        left: breakfastTotal?.remaining || 0 
      },
      lunch: { 
        ordered: lunchOrders?.count || 0,
        served: lunchServed?.count || 0, 
        total: lunchTotal?.total || 0, 
        left: lunchTotal?.remaining || 0 
      }
    };
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    return {
      breakfast: { ordered: 0, served: 0, left: 0, total: 0 },
      lunch: { ordered: 0, served: 0, left: 0, total: 0 }
    };
  }
}

// Инвентарь
export async function getInventory() {
  try {
    const inventory = await db.all('SELECT * FROM products ORDER BY name');
    console.log(`📦 Загружено продуктов: ${inventory.length}`);
    return inventory || [];
  } catch (error) {
    console.error('❌ Ошибка получения инвентаря:', error);
    return [];
  }
}

export async function updateProductStock(productId, stock) {
  await db.run(
    'UPDATE products SET stock = ? WHERE id = ?',
    [stock, productId]
  );
}

export async function updateProductMaxStock(productId, maxStock) {
  await db.run(
    'UPDATE products SET max_stock = ? WHERE id = ?',
    [maxStock, productId]
  );
}

export async function updateProductMinStock(productId, minStock) {
  await db.run(
    'UPDATE products SET min_stock = ? WHERE id = ?',
    [minStock, productId]
  );
}

export async function updateProductExpiryDate(productId, expiryDate) {
  await db.run(
    'UPDATE products SET expiry_date = ? WHERE id = ?',
    [expiryDate, productId]
  );
}

export async function addProduct(productData) {
  const { name, unit, stock, max_stock, min_stock, expiry_date } = productData;
  const result = await db.run(
    'INSERT INTO products (name, unit, stock, max_stock, min_stock, expiry_date) VALUES (?, ?, ?, ?, ?, ?)',
    [name, unit, stock, max_stock, min_stock, expiry_date]
  );
  return { id: result.lastID, ...productData };
}

export async function deleteProduct(productId) {
  await db.run('DELETE FROM products WHERE id = ?', productId);
}

// Заявки на закупку
export async function getPurchaseRequests() {
  const requests = await db.all(`
    SELECT * FROM purchase_requests 
    ORDER BY created_at DESC 
    LIMIT 50
  `);
  return requests;
}

export async function createPurchaseRequest(request) {
  const result = await db.run(
    'INSERT INTO purchase_requests (product, quantity, unit) VALUES (?, ?, ?)',
    [request.product, request.quantity, request.unit]
  );
  return { id: result.lastID, ...request, status: 'pending' };
}

// Статистика для администратора
export async function getAdminStats() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const totalStudents = await db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', 'student');
    const totalMeals = await db.get('SELECT COUNT(*) as count FROM served_meals WHERE date = ?', today);
    const totalPayments = await db.get('SELECT COALESCE(SUM(amount), 0) as sum FROM payments WHERE date(created_at) = ?', today);
    const totalStudentsCount = await db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', 'student');
    const studentsAte = await db.get('SELECT COUNT(DISTINCT user_id) as count FROM served_meals WHERE date = ?', today);
    
    const attendance = totalStudentsCount.count > 0 
      ? Math.round((studentsAte.count / totalStudentsCount.count) * 100) 
      : 0;
    
    return {
      totalStudents: totalStudents.count || 0,
      totalMeals: totalMeals.count || 0,
      totalPayments: totalPayments.sum || 0,
      attendance: attendance || 0
    };
  } catch (error) {
    console.error('Ошибка получения статистики администратора:', error);
    return {
      totalStudents: 0,
      totalMeals: 0,
      totalPayments: 0,
      attendance: 0
    };
  }
}

export async function getPendingRequests() {
  const requests = await db.all(`
    SELECT * FROM purchase_requests 
    WHERE status = 'pending' 
    ORDER BY created_at ASC
  `);
  return requests;
}

export async function approveRequest(id) {
  await db.run(
    'UPDATE purchase_requests SET status = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?',
    ['approved', id]
  );
}

export async function rejectRequest(id) {
  await db.run(
    'UPDATE purchase_requests SET status = ? WHERE id = ?',
    ['rejected', id]
  );
}

export async function getPaymentsStats() {
  const payments = await db.all(`
    SELECT 
      date(created_at) as date,
      SUM(amount) as total
    FROM payments
    WHERE created_at >= date('now', '-7 days')
    GROUP BY date(created_at)
    ORDER BY date ASC
  `);
  
  const labels = payments.map(p => {
    const d = new Date(p.date);
    return `${d.getDate()}.${d.getMonth() + 1}`;
  });
  const values = payments.map(p => p.total);
  
  return { labels, values };
}

export async function getAttendanceStats() {
  const attendance = await db.all(`
    SELECT 
      date,
      COUNT(DISTINCT user_id) as count
    FROM served_meals
    WHERE date >= date('now', '-7 days')
    GROUP BY date
    ORDER BY date ASC
  `);
  
  const labels = attendance.map(a => {
    const d = new Date(a.date);
    return `${d.getDate()}.${d.getMonth() + 1}`;
  });
  const values = attendance.map(a => a.count);
  
  return { labels, values };
}

// Меню
export async function getTodayMenu() {
  const today = new Date().toISOString().split('T')[0];
  
  const breakfast = await db.all(`
    SELECT d.*, COALESCE(dm.remaining_servings, 0) as remaining_servings
    FROM dishes d
    LEFT JOIN daily_menus dm ON d.id = dm.dish_id AND dm.date = ?
    WHERE d.type = 'breakfast' AND d.is_active = 1
  `, today);
  
  const lunch = await db.all(`
    SELECT d.*, COALESCE(dm.remaining_servings, 0) as remaining_servings
    FROM dishes d
    LEFT JOIN daily_menus dm ON d.id = dm.dish_id AND dm.date = ?
    WHERE d.type = 'lunch' AND d.is_active = 1
  `, today);
  
  return { breakfast, lunch };
}

export async function getWeeklyMenu() {
  const weeklyMenu = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    const breakfast = await db.all(`
      SELECT d.*
      FROM dishes d
      WHERE d.type = 'breakfast' AND d.is_active = 1
      LIMIT 3
    `);
    
    const lunch = await db.all(`
      SELECT d.*
      FROM dishes d
      WHERE d.type = 'lunch' AND d.is_active = 1
      LIMIT 3
    `);
    
    weeklyMenu.push({
      date: dateStr,
      breakfast,
      lunch
    });
  }
  
  return weeklyMenu;
}

export async function getDishes() {
  const dishes = await db.all(
    'SELECT * FROM dishes WHERE is_active = 1 ORDER BY type, name'
  );
  return dishes;
}

// Отчеты
export async function generateMealReport(filters) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Питание');
  
  worksheet.columns = [
    { header: 'Дата', key: 'date', width: 15 },
    { header: 'Ученик', key: 'student', width: 30 },
    { header: 'Класс', key: 'class', width: 15 },
    { header: 'Блюдо', key: 'dish', width: 35 },
    { header: 'Тип', key: 'type', width: 15 },
    { header: 'Цена', key: 'price', width: 12 },
    { header: 'Время', key: 'time', width: 10 }
  ];
  
  worksheet.addRow([]);
  worksheet.addRow([`Отчет по питанию за ${filters.month || 'все месяцы'} ${filters.year || '2026'} года`]);
  worksheet.addRow([`Сгенерировано: ${new Date().toLocaleDateString('ru-RU')}`]);
  worksheet.addRow([]);
  
  let query = `
    SELECT 
      sm.date,
      u.name as student,
      u.class,
      sm.dish_name as dish,
      CASE WHEN sm.type = 'breakfast' THEN 'Завтрак' ELSE 'Обед' END as type,
      sm.price,
      strftime('%H:%M', sm.created_at) as time
    FROM served_meals sm
    JOIN users u ON sm.user_id = u.id
    WHERE 1=1
  `;
  const params = [];
  
  if (filters.month) {
    query += ` AND strftime('%m', sm.date) = ?`;
    params.push(String(filters.month).padStart(2, '0'));
  }
  
  if (filters.year) {
    query += ` AND strftime('%Y', sm.date) = ?`;
    params.push(filters.year || '2026');
  }
  
  query += ` ORDER BY sm.date DESC, sm.created_at DESC LIMIT 1000`;
  
  const meals = await db.all(query, params);
  
  if (meals.length === 0) {
    worksheet.addRow(['Нет данных за выбранный период']);
  } else {
    worksheet.addRows(meals);
    worksheet.addRow([]);
    const totalSum = meals.reduce((sum, meal) => sum + meal.price, 0);
    worksheet.addRow(['', '', '', '', 'ИТОГО:', totalSum + ' ₽', '']);
  }
  
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

export async function generateCostsReport(filters) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Затраты');
  
  worksheet.columns = [
    { header: 'Дата', key: 'date', width: 15 },
    { header: 'Продукт', key: 'product', width: 25 },
    { header: 'Количество', key: 'quantity', width: 15 },
    { header: 'Ед.', key: 'unit', width: 8 },
    { header: 'Статус', key: 'status', width: 15 },
    { header: 'Стоимость', key: 'cost', width: 15 }
  ];
  
  let query = `
    SELECT 
      date(created_at) as date,
      product,
      quantity,
      unit,
      status,
      quantity * 100 as cost
    FROM purchase_requests
    WHERE 1=1
  `;
  const params = [];
  
  if (filters.startDate) {
    query += ` AND date(created_at) >= ?`;
    params.push(filters.startDate);
  }
  
  if (filters.endDate) {
    query += ` AND date(created_at) <= ?`;
    params.push(filters.endDate);
  }
  
  query += ` ORDER BY created_at DESC LIMIT 1000`;
  
  const requests = await db.all(query, params);
  worksheet.addRows(requests);
  
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

export default {
  initialize,
  getDb,
  getUserByEmail,
  createUser,
  createRegistrationRequest,
  getPendingRegistrationRequest,
  getPendingRegistrationRequests,
  getAllRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest,
  getStudentBalance,
  createMealOrder,
  getPendingOrders,
  confirmOrder,
  getStudentOrderForToday,
  getStudentMeals,
  processPayment,
  updateAllergies,
  getAllergies,
  addReview,
  getAllReviews,
  deleteReview,
  getMealStats,
  getInventory,
  updateProductStock,
  updateProductMaxStock,
  updateProductMinStock,
  updateProductExpiryDate,
  addProduct,
  deleteProduct,
  getPurchaseRequests,
  createPurchaseRequest,
  getAdminStats,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getPaymentsStats,
  getAttendanceStats,
  getTodayMenu,
  getWeeklyMenu,
  getDishes,
  generateMealReport,
  generateCostsReport
};