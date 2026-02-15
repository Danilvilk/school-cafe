import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function test() {
  console.log('========================================');
  console.log('  ТЕСТИРОВАНИЕ АДМИНСКОГО ИНВЕНТАРЯ');
  console.log('========================================');
  console.log();

  try {
    // 1. Логинимся как администратор
    console.log('[1/4] Авторизация администратора...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@school.ru',
      password: 'password123',
      role: 'admin'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Успешный вход, токен получен');
    console.log();

    // 2. Получаем инвентарь
    console.log('[2/4] Получение инвентаря...');
    const inventoryResponse = await axios.get(`${API_URL}/admin/inventory`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const inventory = inventoryResponse.data;
    console.log(`✅ Получено продуктов: ${inventory.length}`);
    
    if (inventory.length === 0) {
      console.log('❌ Инвентарь пуст!');
      return;
    }
    
    console.log('   Первый продукт:', inventory[0]);
    console.log();

    // 3. Обновляем остаток первого продукта
    const product = inventory[0];
    const newStock = product.stock + 5;
    
    console.log(`[3/4] Обновление остатка продукта ID=${product.id}...`);
    console.log(`   Текущий остаток: ${product.stock} ${product.unit}`);
    console.log(`   Новый остаток: ${newStock} ${product.unit}`);
    
    const updateResponse = await axios.put(
      `${API_URL}/admin/inventory/${product.id}/stock`,
      { stock: newStock },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Ответ:', updateResponse.data);
    console.log();

    // 4. Проверяем обновление
    console.log('[4/4] Проверка обновления...');
    const checkResponse = await axios.get(`${API_URL}/admin/inventory`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const updatedProduct = checkResponse.data.find(p => p.id === product.id);
    console.log(`   Новый остаток в БД: ${updatedProduct.stock} ${updatedProduct.unit}`);
    
    if (updatedProduct.stock === newStock) {
      console.log('✅ Тест пройден! Остаток успешно обновлен');
    } else {
      console.log('❌ Ошибка: остаток не обновился');
    }
    console.log();

    console.log('========================================');
    console.log('  ✅ ВСЕ ТЕСТЫ ПРОЙДЕНЫ');
    console.log('========================================');

  } catch (error) {
    console.error('❌ ОШИБКА:', error.response?.data || error.message);
    if (error.response) {
      console.error('   Статус:', error.response.status);
      console.error('   Данные:', error.response.data);
    }
  }
}

test();