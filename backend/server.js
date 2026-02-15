import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import * as db from './db.js';
import * as auth from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Инициализация базы данных при запуске
db.initialize().catch(err => {
  console.error('Ошибка инициализации базы данных:', err);
});

// Middleware для проверки авторизации
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  
  const user = auth.verifyToken(token);
  if (!user) {
    return res.status(403).json({ error: 'Недействительный токен' });
  }
  
  req.user = user;
  next();
};

// Middleware для проверки роли
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }
    next();
  };
};

// Маршруты аутентификации
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await auth.login(email, password, role);
    res.json(user);
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const userData = req.body;
    const user = await auth.register(userData);
    res.json(user);
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для ученика
app.get('/api/student/balance', authenticateToken, checkRole(['student']), async (req, res) => {
  try {
    const balance = await db.getStudentBalance(req.user.id);
    res.json({ balance });
  } catch (error) {
    console.error('Ошибка получения баланса:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/student/meals', authenticateToken, checkRole(['student']), async (req, res) => {
  try {
    const meals = await db.getStudentMeals(req.user.id);
    res.json(meals);
  } catch (error) {
    console.error('Ошибка получения истории питания:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/student/order', authenticateToken, checkRole(['student']), async (req, res) => {
  try {
    const { dishId, type } = req.body;
    const result = await db.createMealOrder(req.user.id, dishId, type);
    res.json(result);
  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/student/order-today/:type', authenticateToken, checkRole(['student']), async (req, res) => {
  try {
    const { type } = req.params;
    const order = await db.getStudentOrderForToday(req.user.id, type);
    res.json({ hasOrder: !!order, order });
  } catch (error) {
    console.error('Ошибка проверки заказа:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/student/pay', authenticateToken, checkRole(['student']), async (req, res) => {
  try {
    const { amount, type, ...data } = req.body;
    const result = await db.processPayment(req.user.id, amount, type, data);
    res.json(result);
  } catch (error) {
    console.error('Ошибка оплаты:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/student/allergies', authenticateToken, checkRole(['student']), async (req, res) => {
  try {
    const { allergies } = req.body;
    await db.updateAllergies(req.user.id, allergies);
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления аллергий:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/student/allergies', authenticateToken, checkRole(['student']), async (req, res) => {
  try {
    const allergies = await db.getAllergies(req.user.id);
    res.json(allergies);
  } catch (error) {
    console.error('Ошибка получения аллергий:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/student/review', authenticateToken, checkRole(['student']), async (req, res) => {
  try {
    const { dishId, rating, comment } = req.body;
    await db.addReview(req.user.id, dishId, rating, comment);
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка добавления отзыва:', error);
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для повара
app.get('/api/cook/meals', authenticateToken, checkRole(['cook']), async (req, res) => {
  try {
    const stats = await db.getMealStats();
    res.json(stats);
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cook/pending-orders', authenticateToken, checkRole(['cook']), async (req, res) => {
  try {
    const orders = await db.getPendingOrders();
    res.json(orders);
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cook/confirm-order/:id', authenticateToken, checkRole(['cook']), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.confirmOrder(id, req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Ошибка подтверждения заказа:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/cook/inventory', authenticateToken, checkRole(['cook']), async (req, res) => {
  try {
    const inventory = await db.getInventory();
    console.log('Отправка инвентаря клиенту:', inventory.length);
    res.json(inventory);
  } catch (error) {
    console.error('Ошибка получения инвентаря:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cook/requests', authenticateToken, checkRole(['cook']), async (req, res) => {
  try {
    const requests = await db.getPurchaseRequests();
    res.json(requests);
  } catch (error) {
    console.error('Ошибка получения заявок:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cook/requests', authenticateToken, checkRole(['cook']), async (req, res) => {
  try {
    const request = req.body;
    const result = await db.createPurchaseRequest(request);
    res.json(result);
  } catch (error) {
    console.error('Ошибка создания заявки:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/cook/inventory/:id/stock', authenticateToken, checkRole(['cook']), async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    await db.updateProductStock(id, stock);
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления остатка:', error);
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для администратора
app.get('/api/admin/stats', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    res.json(stats);
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/requests/pending', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const requests = await db.getPendingRequests();
    res.json(requests);
  } catch (error) {
    console.error('Ошибка получения заявок:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/requests/:id/approve', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await db.approveRequest(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка одобрения заявки:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/admin/requests/:id/reject', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await db.rejectRequest(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка отклонения заявки:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/admin/stats/payments', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const stats = await db.getPaymentsStats();
    res.json(stats);
  } catch (error) {
    console.error('Ошибка получения статистики оплат:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/stats/attendance', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const stats = await db.getAttendanceStats();
    res.json(stats);
  } catch (error) {
    console.error('Ошибка получения статистики посещаемости:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/reports/meals', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const filters = req.body;
    const report = await db.generateMealReport(filters);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=meal_report.xlsx');
    res.send(report);
  } catch (error) {
    console.error('Ошибка генерации отчета:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/reports/costs', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const filters = req.body;
    const report = await db.generateCostsReport(filters);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=costs_report.xlsx');
    res.send(report);
  } catch (error) {
    console.error('Ошибка генерации отчета:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/reviews', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const reviews = await db.getAllReviews();
    res.json(reviews);
  } catch (error) {
    console.error('Ошибка получения отзывов:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/reviews/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteReview(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления отзыва:', error);
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для получения инвентаря администратором
app.get('/api/admin/inventory', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    console.log('Запрос инвентаря от администратора');
    const inventory = await db.getInventory();
    console.log(`Отправка инвентаря администратору: ${inventory.length} продуктов`);
    res.json(inventory);
  } catch (error) {
    console.error('Ошибка получения инвентаря для администратора:', error);
    res.status(500).json({ error: error.message });
  }
});

// Маршруты для управления инвентарем (админ)
app.put('/api/admin/inventory/:id/stock', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    console.log(`Обновление остатка продукта ID=${id}, новое значение=${stock}`);
    
    if (stock === undefined || stock === null) {
      return res.status(400).json({ error: 'Не указано новое значение остатка' });
    }
    
    await db.updateProductStock(id, stock);
    res.json({ success: true, message: 'Остаток обновлен' });
  } catch (error) {
    console.error('Ошибка обновления остатка:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/admin/inventory/:id/max-stock', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { maxStock } = req.body;
    await db.updateProductMaxStock(id, maxStock);
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления максимального запаса:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/admin/inventory/:id/min-stock', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { minStock } = req.body;
    await db.updateProductMinStock(id, minStock);
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления минимального запаса:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/admin/inventory/:id/expiry', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { expiryDate } = req.body;
    await db.updateProductExpiryDate(id, expiryDate);
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления срока годности:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/admin/inventory', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const product = await db.addProduct(req.body);
    res.json(product);
  } catch (error) {
    console.error('Ошибка добавления продукта:', error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/admin/inventory/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteProduct(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления продукта:', error);
    res.status(400).json({ error: error.message });
  }
});

// Заявки на регистрацию
app.get('/api/admin/registration-requests', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const requests = await db.getPendingRegistrationRequests();
    res.json(requests);
  } catch (error) {
    console.error('Ошибка получения заявок на регистрацию:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/registration-requests/all', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const requests = await db.getAllRegistrationRequests();
    res.json(requests);
  } catch (error) {
    console.error('Ошибка получения всех заявок:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/registration-requests/:id/approve', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await db.approveRegistrationRequest(id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка одобрения заявки:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/admin/registration-requests/:id/reject', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await db.rejectRegistrationRequest(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка отклонения заявки:', error);
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для меню
app.get('/api/menu/today', async (req, res) => {
  try {
    const menu = await db.getTodayMenu();
    res.json(menu);
  } catch (error) {
    console.error('Ошибка получения меню:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/menu/weekly', async (req, res) => {
  try {
    const menu = await db.getWeeklyMenu();
    res.json(menu);
  } catch (error) {
    console.error('Ошибка получения недельного меню:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/menu/dishes', async (req, res) => {
  try {
    const dishes = await db.getDishes();
    res.json(dishes);
  } catch (error) {
    console.error('Ошибка получения блюд:', error);
    res.status(500).json({ error: error.message });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`   Сервер запущен на порту ${PORT}`);
  console.log(`   API доступно: http://localhost:${PORT}/api`);
  console.log(`========================================`);
});

export default app;