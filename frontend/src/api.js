import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

const apiMethods = {
  // Аутентификация
  async login(email, password, role) {
    try {
      const response = await api.post('/auth/login', { email, password, role })
      return response.data
    } catch (error) {
      console.error('Ошибка входа:', error)
      throw error
    }
  },
  
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (error) {
      console.error('Ошибка регистрации:', error)
      throw error
    }
  },
  
  // Ученик
  async getBalance() {
    try {
      const response = await api.get('/student/balance')
      return response.data.balance
    } catch (error) {
      console.error('Ошибка получения баланса:', error)
      return 0
    }
  },
  
  async getTodayMenu() {
    try {
      const response = await api.get('/menu/today')
      return response.data
    } catch (error) {
      console.error('Ошибка получения меню:', error)
      return { breakfast: [], lunch: [] }
    }
  },
  
  async getMealHistory() {
    try {
      const response = await api.get('/student/meals')
      return response.data
    } catch (error) {
      console.error('Ошибка получения истории питания:', error)
      return []
    }
  },
  
  async getDishes() {
    try {
      const response = await api.get('/menu/dishes')
      return response.data
    } catch (error) {
      console.error('Ошибка получения блюд:', error)
      return []
    }
  },
  
  async createOrder(dishId, type) {
  try {
    console.log('Создание заказа:', { dishId, type });
    
    // Проверяем входные данные
    if (!dishId) {
      throw new Error('ID блюда не указан');
    }
    if (!type) {
      throw new Error('Тип приема пищи не указан');
    }
    
    const response = await api.post('/student/order', { 
      dishId: parseInt(dishId), // Преобразуем в число
      type: type 
    });
    
    console.log('Ответ сервера:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка в createOrder:', error);
    throw error;
  }
},
  
  async getOrderForToday(type) {
    try {
      const response = await api.get(`/student/order-today/${type}`)
      return response.data
    } catch (error) {
      console.error('Ошибка проверки заказа:', error)
      return { hasOrder: false, order: null }
    }
  },
  
  async makePayment(amount, type, data = {}) {
    const response = await api.post('/student/pay', { amount, type, ...data })
    return response.data
  },
  
  async updateAllergies(allergies) {
    const response = await api.put('/student/allergies', { allergies })
    return response.data
  },
  
  async getAllergies() {
    try {
      const response = await api.get('/student/allergies')
      return response.data
    } catch (error) {
      console.error('Ошибка получения аллергий:', error)
      return []
    }
  },
  
  async submitReview(review) {
    const response = await api.post('/student/review', review)
    return response.data
  },
  
  // Повар
  async getMealStats() {
    try {
      const response = await api.get('/cook/meals')
      return response.data
    } catch (error) {
      console.error('Ошибка получения статистики:', error)
      return { breakfast: { ordered: 0, served: 0, left: 0, total: 0 }, lunch: { ordered: 0, served: 0, left: 0, total: 0 } }
    }
  },
  
  async getPendingOrders() {
    try {
      const response = await api.get('/cook/pending-orders')
      return response.data
    } catch (error) {
      console.error('Ошибка получения заказов:', error)
      return []
    }
  },
  
  async confirmOrder(orderId) {
    try {
      console.log('Отправка запроса на подтверждение заказа:', orderId)
      const response = await api.post(`/cook/confirm-order/${orderId}`)
      console.log('Ответ от сервера:', response.data)
      return response.data
    } catch (error) {
      console.error('Ошибка в API confirmOrder:', error)
      throw error
    }
  },
  
  // Инвентарь - ИСПРАВЛЕННЫЙ МЕТОД
async getInventory() {
  try {
    console.log('Запрос инвентаря...')
    const response = await api.get('/cook/inventory')
    console.log('Ответ от сервера (инвентарь):', response.data)
    
    // Проверяем, что данные пришли
    if (!response.data) {
      console.warn('Пустой ответ от сервера')
      return []
    }
    
    // Если это массив, возвращаем как есть
    if (Array.isArray(response.data)) {
      return response.data
    }
    
    // Если это объект с данными, пытаемся извлечь массив
    if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data.products)) {
        return response.data.products
      }
      if (Array.isArray(response.data.data)) {
        return response.data.data
      }
    }
    
    console.warn('Неожиданный формат данных:', response.data)
    return []
  } catch (error) {
    console.error('Ошибка получения инвентаря:', error)
    return []
  }
},
  
  async getPurchaseRequests() {
    try {
      const response = await api.get('/cook/requests')
      return response.data
    } catch (error) {
      console.error('Ошибка получения заявок:', error)
      return []
    }
  },
  
  async createPurchaseRequest(request) {
    const response = await api.post('/cook/requests', request)
    return response.data
  },
  
  async updateProductStock(productId, stock) {
    const response = await api.put(`/cook/inventory/${productId}/stock`, { stock })
    return response.data
  },
  
  // Администратор
  async getAdminStats() {
    try {
      const response = await api.get('/admin/stats')
      return response.data
    } catch (error) {
      console.error('Ошибка получения статистики:', error)
      return { totalStudents: 0, totalMeals: 0, totalPayments: 0, attendance: 0 }
    }
  },
  
  // Администратор - обновление остатка продукта
async updateAdminProductStock(productId, stock) {
  try {
    console.log(`Обновление остатка продукта ${productId} на ${stock}`);
    const response = await api.put(`/admin/inventory/${productId}/stock`, { stock });
    return response.data;
  } catch (error) {
    console.error('Ошибка обновления остатка администратором:', error);
    throw error;
  }
},
  
  // Администратор - получение инвентаря (НОВЫЙ МЕТОД)
async getAdminInventory() {
  try {
    console.log('Запрос инвентаря администратором...')
    const response = await api.get('/admin/inventory')
    console.log('Ответ от сервера (админ инвентарь):', response.data)
    return response.data || []
  } catch (error) {
    console.error('Ошибка получения инвентаря администратором:', error)
    return []
  }
},
  
  async getPendingRequests() {
    try {
      const response = await api.get('/admin/requests/pending')
      return response.data
    } catch (error) {
      console.error('Ошибка получения заявок:', error)
      return []
    }
  },
  
  async approvePurchaseRequest(id) {
    const response = await api.put(`/admin/requests/${id}/approve`)
    return response.data
  },
  
  async rejectPurchaseRequest(id) {
    const response = await api.put(`/admin/requests/${id}/reject`)
    return response.data
  },
  
  async getPaymentsStats() {
    try {
      const response = await api.get('/admin/stats/payments')
      return response.data
    } catch (error) {
      console.error('Ошибка получения статистики оплат:', error)
      return { labels: [], values: [] }
    }
  },
  
  async getAttendanceStats() {
    try {
      const response = await api.get('/admin/stats/attendance')
      return response.data
    } catch (error) {
      console.error('Ошибка получения статистики посещаемости:', error)
      return { labels: [], values: [] }
    }
  },
  
  async generateMealReport(filters) {
    const response = await api.post('/admin/reports/meals', filters, {
      responseType: 'blob'
    })
    return response.data
  },
  
  async generateCostsReport(filters) {
    const response = await api.post('/admin/reports/costs', filters, {
      responseType: 'blob'
    })
    return response.data
  },
  
  async getAllReviews() {
    try {
      const response = await api.get('/admin/reviews')
      return response.data
    } catch (error) {
      console.error('Ошибка получения отзывов:', error)
      return []
    }
  },
  
  async deleteReview(reviewId) {
    const response = await api.delete(`/admin/reviews/${reviewId}`)
    return response.data
  },
  
  async updateProductMaxStock(productId, maxStock) {
    const response = await api.put(`/admin/inventory/${productId}/max-stock`, { maxStock })
    return response.data
  },
  
  async updateProductMinStock(productId, minStock) {
    const response = await api.put(`/admin/inventory/${productId}/min-stock`, { minStock })
    return response.data
  },
  
  async updateProductExpiryDate(productId, expiryDate) {
    const response = await api.put(`/admin/inventory/${productId}/expiry`, { expiryDate })
    return response.data
  },
  
  async addProduct(productData) {
    const response = await api.post('/admin/inventory', productData)
    return response.data
  },
  
  async deleteProduct(productId) {
    const response = await api.delete(`/admin/inventory/${productId}`)
    return response.data
  },
  
  // Заявки на регистрацию
  async getRegistrationRequests() {
    try {
      const response = await api.get('/admin/registration-requests')
      return response.data
    } catch (error) {
      console.error('Ошибка получения заявок на регистрацию:', error)
      return []
    }
  },
  
  async getAllRegistrationRequests() {
    try {
      const response = await api.get('/admin/registration-requests/all')
      return response.data
    } catch (error) {
      console.error('Ошибка получения всех заявок:', error)
      return []
    }
  },
  
  async approveRegistrationRequest(id) {
    const response = await api.put(`/admin/registration-requests/${id}/approve`)
    return response.data
  },
  
  async rejectRegistrationRequest(id) {
    const response = await api.put(`/admin/registration-requests/${id}/reject`)
    return response.data
  },
  
  // Меню
  async getWeeklyMenu() {
    try {
      const response = await api.get('/menu/weekly')
      return response.data
    } catch (error) {
      console.error('Ошибка получения недельного меню:', error)
      return []
    }
  }
}

export default apiMethods