<template>
  <div class="admin-dashboard">
    <div class="container">
      <h1><i class="fas fa-user-cog"></i> Панель администратора</h1>
      
      <!-- Статистика -->
      <div class="stats-grid">
        <div class="stat-card">
          <i class="fas fa-users"></i>
          <div class="stat-info">
            <h3>{{ stats.totalStudents }}</h3>
            <p>Учеников</p>
          </div>
        </div>
        
        <div class="stat-card">
          <i class="fas fa-utensils"></i>
          <div class="stat-info">
            <h3>{{ stats.totalMeals }}</h3>
            <p>Питаний сегодня</p>
          </div>
        </div>
        
        <div class="stat-card">
          <i class="fas fa-ruble-sign"></i>
          <div class="stat-info">
            <h3>{{ stats.totalPayments }} ₽</h3>
            <p>Оплат сегодня</p>
          </div>
        </div>
        
        <div class="stat-card">
          <i class="fas fa-clock"></i>
          <div class="stat-info">
            <h3>{{ stats.attendance }}%</h3>
            <p>Посещаемость</p>
          </div>
        </div>
      </div>
      
      <!-- Графики оплат и посещаемости -->
      <div class="charts-section">
        <div class="chart-container">
          <h2><i class="fas fa-chart-line"></i> Статистика оплат</h2>
          <div class="simple-chart">
            <div v-for="(value, index) in paymentsData.values" :key="index" class="chart-bar-container">
              <div class="chart-bar-label">{{ paymentsData.labels[index] }}</div>
              <div class="chart-bar-wrapper">
                <div 
                  class="chart-bar" 
                  :style="{ width: (value / maxPaymentValue * 100) + '%', backgroundColor: '#667eea' }"
                ></div>
                <span class="chart-bar-value">{{ value }} ₽</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chart-container">
          <h2><i class="fas fa-chart-bar"></i> Посещаемость столовой</h2>
          <div class="simple-chart">
            <div v-for="(value, index) in attendanceData.values" :key="index" class="chart-bar-container">
              <div class="chart-bar-label">{{ attendanceData.labels[index] }}</div>
              <div class="chart-bar-wrapper">
                <div 
                  class="chart-bar" 
                  :style="{ width: (value / maxAttendanceValue * 100) + '%', backgroundColor: '#4CAF50' }"
                ></div>
                <span class="chart-bar-value">{{ value }} чел.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Заявки на регистрацию -->
      <div class="section">
        <h2><i class="fas fa-user-plus"></i> Заявки на регистрацию</h2>
        <registration-requests 
          @success="showSuccess" 
          @error="showError"
        />
      </div>
      
      <!-- Контроль остатков продуктов -->
      <div class="section">
        <h2><i class="fas fa-boxes"></i> Контроль остатков продуктов</h2>
        
        <div class="inventory-controls">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              v-model="inventorySearch" 
              type="text" 
              placeholder="Поиск продуктов..."
              class="form-control"
            >
          </div>
          <button @click="loadInventory" class="btn-refresh" :disabled="loading.inventory">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading.inventory }"></i> 
            {{ loading.inventory ? 'Загрузка...' : 'Обновить' }}
          </button>
          <button @click="showAddProductModal = true" class="btn-add">
            <i class="fas fa-plus"></i> Добавить продукт
          </button>
        </div>
        
        <!-- Индикатор загрузки -->
        <div v-if="loading.inventory" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Загрузка остатков продуктов...</p>
        </div>
        
        <!-- Сообщение если нет продуктов -->
        <div v-else-if="inventory.length === 0" class="no-inventory">
          <i class="fas fa-box-open"></i>
          <p>Нет данных об остатках продуктов</p>
          <button @click="createTestProducts" class="btn-test">
            <i class="fas fa-flask"></i> Создать тестовые продукты
          </button>
        </div>
        
        <!-- Таблица с продуктами -->
        <div v-else class="inventory-table">
          <table>
            <thead>
              <tr>
                <th>Продукт</th>
                <th>Ед.</th>
                <th>Текущий остаток</th>
                <th>Макс. запас</th>
                <th>Мин. запас</th>
                <th>Годен до</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredInventory" :key="item.id">
                <td><strong>{{ item.name }}</strong></td>
                <td>{{ item.unit }}</td>
                <td>
                  <div class="stock-control">
                    <button 
                      @click="updateProductStock(item.id, -1)" 
                      class="btn-stock-mini"
                      :disabled="item.stock <= 0"
                    >
                      <i class="fas fa-minus"></i>
                    </button>
                    <span :class="'stock-value ' + getStockStatusClass(item)">
                      {{ item.stock }}
                    </span>
                    <button 
                      @click="updateProductStock(item.id, 1)" 
                      class="btn-stock-mini"
                      :disabled="item.stock >= item.max_stock"
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </td>
                <td>
                  <div class="max-stock-control">
                    <input 
                      type="number" 
                      v-model.number="item.max_stock" 
                      @change="updateMaxStock(item.id, item.max_stock)"
                      class="form-control-sm"
                      min="1"
                    >
                  </div>
                </td>
                <td>
                  <div class="min-stock-control">
                    <input 
                      type="number" 
                      v-model.number="item.min_stock" 
                      @change="updateMinStock(item.id, item.min_stock)"
                      class="form-control-sm"
                      min="0"
                    >
                  </div>
                </td>
                <td>
                  <input 
                    type="date" 
                    v-model="item.expiry_date" 
                    @change="updateExpiryDate(item.id, item.expiry_date)"
                    class="form-control-sm"
                  >
                </td>
                <td>
                  <span :class="'status-badge ' + getStockStatusClass(item)">
                    {{ getStockStatusText(item) }}
                  </span>
                </td>
                <td>
                  <button @click="deleteProduct(item.id)" class="btn-delete" title="Удалить">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Отзывы учеников -->
      <div class="section">
        <h2><i class="fas fa-star"></i> Отзывы учеников</h2>
        
        <div class="reviews-filters">
          <select v-model="reviewsFilter.dish" class="form-control">
            <option value="">Все блюда</option>
            <option v-for="dish in dishes" :key="dish.id" :value="dish.id">
              {{ dish.name }}
            </option>
          </select>
          
          <select v-model="reviewsFilter.rating" class="form-control">
            <option value="">Все оценки</option>
            <option value="5">5 звезд</option>
            <option value="4">4 звезды</option>
            <option value="3">3 звезды</option>
            <option value="2">2 звезды</option>
            <option value="1">1 звезда</option>
          </select>
          
          <input 
            type="text" 
            v-model="reviewsFilter.search" 
            placeholder="Поиск по ученикам..."
            class="form-control"
          >
        </div>
        
        <div class="reviews-list">
          <div v-for="review in filteredReviews" :key="review.id" class="review-card">
            <div class="review-header">
              <div class="reviewer-info">
                <i class="fas fa-user-circle"></i>
                <div>
                  <strong>{{ review.student_name }}</strong>
                  <span class="reviewer-class">{{ review.student_class }}</span>
                </div>
              </div>
              <div class="review-rating">
                <div class="stars-container">
                  <span v-for="star in 5" :key="star" class="star">
                    <i 
                      class="fas fa-star" 
                      :class="{ active: star <= review.rating }"
                      :style="{ color: star <= review.rating ? '#ffd700' : '#ddd' }"
                    ></i>
                  </span>
                </div>
                <span class="rating-value">{{ review.rating }}/5</span>
                <span class="review-date">{{ formatDate(review.created_at) }}</span>
              </div>
            </div>
            
            <div class="review-dish">
              <span :class="'dish-badge ' + review.dish_type">
                {{ review.dish_type === 'breakfast' ? 'Завтрак' : 'Обед' }}
              </span>
              <span class="dish-name">{{ review.dish_name }}</span>
            </div>
            
            <div class="review-comment" v-if="review.comment">
              "{{ review.comment }}"
            </div>
            <div class="review-comment no-comment" v-else>
              Без комментария
            </div>
            
            <div class="review-actions">
              <button @click="deleteReview(review.id)" class="btn-delete-review">
                <i class="fas fa-trash"></i> Удалить
              </button>
            </div>
          </div>
          
          <div v-if="filteredReviews.length === 0" class="no-reviews">
            <i class="fas fa-star"></i>
            <p>Нет отзывов</p>
          </div>
        </div>
        
        <div class="reviews-summary" v-if="reviews.length > 0">
          <h3>Сводка по отзывам</h3>
          <div class="summary-stats">
            <div class="summary-stat">
              <span class="stat-label">Средняя оценка:</span>
              <span class="stat-value">{{ averageRating.toFixed(1) }} / 5</span>
            </div>
            <div class="summary-stat">
              <span class="stat-label">Всего отзывов:</span>
              <span class="stat-value">{{ reviews.length }}</span>
            </div>
            <div class="summary-stat">
              <span class="stat-label">С комментариями:</span>
              <span class="stat-value">{{ reviewsWithComments }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Заявки на закупку -->
      <div class="section">
        <h2><i class="fas fa-clipboard-check"></i> Согласование заявок</h2>
        <div class="requests-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Продукт</th>
                <th>Количество</th>
                <th>Дата</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in pendingRequests" :key="request.id">
                <td>{{ request.id }}</td>
                <td>{{ request.product }}</td>
                <td>{{ request.quantity }} {{ request.unit }}</td>
                <td>{{ formatDate(request.created_at) }}</td>
                <td>
                  <span class="status-pending">Ожидает</span>
                </td>
                <td>
                  <button @click="approveRequest(request.id)" class="btn-approve">
                    <i class="fas fa-check"></i>
                  </button>
                  <button @click="rejectRequest(request.id)" class="btn-reject">
                    <i class="fas fa-times"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="pendingRequests.length === 0">
                <td colspan="6" class="text-center">Нет ожидающих заявок</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Отчеты -->
      <div class="section">
        <h2><i class="fas fa-file-alt"></i> Формирование отчетов</h2>
        
        <div class="reports-grid">
          <div class="report-card">
            <h3>Отчет по питанию</h3>
            <div class="report-filters">
              <select v-model="reportFilters.meal.month" class="form-control">
                <option value="">Все месяцы</option>
                <option v-for="month in months" :key="month.value" :value="month.value">
                  {{ month.name }}
                </option>
              </select>
              <select v-model="reportFilters.meal.year" class="form-control">
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
            <button @click="generateMealReport" class="btn-generate">
              <i class="fas fa-download"></i> Скачать отчет
            </button>
          </div>
          
          <div class="report-card">
            <h3>Отчет по затратам</h3>
            <div class="report-filters">
              <input 
                type="date" 
                v-model="reportFilters.costs.startDate"
                class="form-control"
              >
              <input 
                type="date" 
                v-model="reportFilters.costs.endDate"
                class="form-control"
              >
            </div>
            <button @click="generateCostsReport" class="btn-generate">
              <i class="fas fa-download"></i> Скачать отчет
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно добавления продукта -->
    <div v-if="showAddProductModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showAddProductModal = false">&times;</span>
        <h3>Добавление нового продукта</h3>
        
        <form @submit.prevent="addProduct" class="add-product-form">
          <div class="form-group">
            <label>Наименование продукта</label>
            <input v-model="newProduct.name" type="text" class="form-control" required>
          </div>
          
          <div class="form-group">
            <label>Единица измерения</label>
            <select v-model="newProduct.unit" class="form-control" required>
              <option value="кг">кг</option>
              <option value="л">л</option>
              <option value="шт">шт</option>
              <option value="уп">уп</option>
            </select>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Начальный остаток</label>
              <input v-model.number="newProduct.stock" type="number" min="0" class="form-control" required>
            </div>
            
            <div class="form-group">
              <label>Максимальный запас</label>
              <input v-model.number="newProduct.max_stock" type="number" min="1" class="form-control" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Минимальный запас</label>
              <input v-model.number="newProduct.min_stock" type="number" min="0" class="form-control" required>
            </div>
            
            <div class="form-group">
              <label>Срок годности</label>
              <input v-model="newProduct.expiry_date" type="date" class="form-control">
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="submit" class="btn-save">
              <i class="fas fa-save"></i> Добавить
            </button>
            <button type="button" @click="showAddProductModal = false" class="btn-cancel">
              <i class="fas fa-times"></i> Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api'
import RegistrationRequests from './RegistrationRequests.vue'

export default {
  name: 'AdminDashboard',
  components: {
    RegistrationRequests
  },
  data() {
    return {
      stats: {
        totalStudents: 0,
        totalMeals: 0,
        totalPayments: 0,
        attendance: 0
      },
      pendingRequests: [],
      paymentsData: {
        labels: [],
        values: []
      },
      attendanceData: {
        labels: [],
        values: []
      },
      inventory: [],
      inventorySearch: '',
      loading: {
        inventory: false
      },
      showAddProductModal: false,
      newProduct: {
        name: '',
        unit: 'кг',
        stock: 0,
        max_stock: 100,
        min_stock: 20,
        expiry_date: '2026-12-31'
      },
      dishes: [],
      reviews: [],
      reviewsFilter: {
        dish: '',
        rating: '',
        search: ''
      },
      months: [
        { value: 1, name: 'Январь' },
        { value: 2, name: 'Февраль' },
        { value: 3, name: 'Март' },
        { value: 4, name: 'Апрель' },
        { value: 5, name: 'Май' },
        { value: 6, name: 'Июнь' },
        { value: 7, name: 'Июль' },
        { value: 8, name: 'Август' },
        { value: 9, name: 'Сентябрь' },
        { value: 10, name: 'Октябрь' },
        { value: 11, name: 'Ноябрь' },
        { value: 12, name: 'Декабрь' }
      ],
      reportFilters: {
        meal: {
          month: '',
          year: '2026'
        },
        costs: {
          startDate: '',
          endDate: ''
        }
      }
    }
  },
  computed: {
    maxPaymentValue() {
      return Math.max(...this.paymentsData.values, 1)
    },
    maxAttendanceValue() {
      return Math.max(...this.attendanceData.values, 1)
    },
    filteredInventory() {
      if (!this.inventorySearch) return this.inventory
      const search = this.inventorySearch.toLowerCase()
      return this.inventory.filter(item => 
        item.name.toLowerCase().includes(search)
      )
    },
    filteredReviews() {
      let filtered = this.reviews
      
      if (this.reviewsFilter.dish) {
        filtered = filtered.filter(r => r.dish_id === parseInt(this.reviewsFilter.dish))
      }
      
      if (this.reviewsFilter.rating) {
        filtered = filtered.filter(r => r.rating === parseInt(this.reviewsFilter.rating))
      }
      
      if (this.reviewsFilter.search) {
        const search = this.reviewsFilter.search.toLowerCase()
        filtered = filtered.filter(r => 
          r.student_name.toLowerCase().includes(search) ||
          (r.student_class && r.student_class.toLowerCase().includes(search))
        )
      }
      
      return filtered
    },
    averageRating() {
      if (this.reviews.length === 0) return 0
      const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0)
      return sum / this.reviews.length
    },
    reviewsWithComments() {
      return this.reviews.filter(r => r.comment && r.comment.trim() !== '').length
    }
  },
  async created() {
    console.log('AdminDashboard created')
    await this.loadData()
    await this.loadInventory() // Явно загружаем инвентарь
    await this.loadDishes()
    await this.loadReviews()
  },
  methods: {
    async loadData() {
      try {
        const [stats, requests, paymentsStats, attendanceStats] = await Promise.all([
          api.getAdminStats(),
          api.getPendingRequests(),
          api.getPaymentsStats(),
          api.getAttendanceStats()
        ])
        
        this.stats = stats || { totalStudents: 0, totalMeals: 0, totalPayments: 0, attendance: 0 }
        this.pendingRequests = requests || []
        this.paymentsData = paymentsStats || { labels: [], values: [] }
        this.attendanceData = attendanceStats || { labels: [], values: [] }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
        this.showError('Не удалось загрузить данные')
      }
    },
    
    async loadInventory() {
  try {
    this.loading.inventory = true
    console.log('Загрузка инвентаря администратором...')
    
    // Используем новый метод для администратора
    const inventory = await api.getAdminInventory()
    console.log('Инвентарь загружен администратором:', inventory)
    
    this.inventory = inventory || []
    
    if (this.inventory.length === 0) {
      console.log('Инвентарь пуст после загрузки')
    } else {
      console.log('Загружено продуктов:', this.inventory.length)
      console.log('Первый продукт:', this.inventory[0])
    }
  } catch (error) {
    console.error('Ошибка загрузки остатков:', error)
    this.showError('Не удалось загрузить остатки продуктов: ' + (error.message || 'неизвестная ошибка'))
    this.inventory = []
  } finally {
    this.loading.inventory = false
  }
},
    
    async createTestProducts() {
      try {
        this.loading.inventory = true
        const testProducts = [
          { name: 'Картофель', unit: 'кг', stock: 50, max_stock: 100, min_stock: 20, expiry_date: '2026-12-31' },
          { name: 'Молоко', unit: 'л', stock: 30, max_stock: 60, min_stock: 10, expiry_date: '2026-10-15' },
          { name: 'Яйца', unit: 'шт', stock: 200, max_stock: 300, min_stock: 50, expiry_date: '2026-10-20' },
          { name: 'Мясо куриное', unit: 'кг', stock: 25, max_stock: 50, min_stock: 10, expiry_date: '2026-10-25' },
          { name: 'Мука', unit: 'кг', stock: 40, max_stock: 80, min_stock: 15, expiry_date: '2026-11-30' }
        ]
        
        for (const product of testProducts) {
          await api.addProduct(product)
        }
        
        await this.loadInventory()
        this.showSuccess('Тестовые продукты созданы!')
      } catch (error) {
        console.error('Ошибка создания тестовых продуктов:', error)
        this.showError('Ошибка создания тестовых продуктов: ' + error.message)
      } finally {
        this.loading.inventory = false
      }
    },
    
    async loadDishes() {
      try {
        this.dishes = await api.getDishes() || []
      } catch (error) {
        console.error('Ошибка загрузки блюд:', error)
      }
    },
    
    async loadReviews() {
      try {
        this.reviews = await api.getAllReviews() || []
        console.log('Отзывы загружены:', this.reviews.length)
      } catch (error) {
        console.error('Ошибка загрузки отзывов:', error)
      }
    },
    
    async approveRequest(id) {
      try {
        await api.approvePurchaseRequest(id)
        await this.loadData()
        this.showSuccess('Заявка одобрена!')
      } catch (error) {
        this.showError('Ошибка: ' + error.message)
      }
    },
    
    async rejectRequest(id) {
      try {
        await api.rejectPurchaseRequest(id)
        await this.loadData()
        this.showSuccess('Заявка отклонена!')
      } catch (error) {
        this.showError('Ошибка: ' + error.message)
      }
    },
    
    async generateMealReport() {
      try {
        const response = await api.generateMealReport(this.reportFilters.meal)
        this.downloadReport(response, 'meal_report.xlsx')
        this.showSuccess('Отчет по питанию сгенерирован!')
      } catch (error) {
        this.showError('Ошибка генерации отчета: ' + error.message)
      }
    },
    
    async generateCostsReport() {
      try {
        const response = await api.generateCostsReport(this.reportFilters.costs)
        this.downloadReport(response, 'costs_report.xlsx')
        this.showSuccess('Отчет по затратам сгенерирован!')
      } catch (error) {
        this.showError('Ошибка генерации отчета: ' + error.message)
      }
    },
    
    downloadReport(data, filename) {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    },
    
    async updateProductStock(productId, change) {
  try {
    console.log(`Обновление остатка продукта ${productId}, изменение: ${change}`);
    
    const product = this.inventory.find(p => p.id === productId);
    if (!product) {
      this.showError('Продукт не найден');
      return;
    }
    
    const newStock = product.stock + change;
    console.log(`Текущий остаток: ${product.stock}, новый остаток: ${newStock}`);
    
    if (newStock < 0) {
      this.showError('Остаток не может быть отрицательным');
      return;
    }
    
    if (newStock > product.max_stock) {
      this.showError(`Максимальный запас: ${product.max_stock} ${product.unit}`);
      return;
    }
    
    // Используем новый метод для админа
    await api.updateAdminProductStock(productId, newStock);
    
    // Обновляем локальное состояние
    product.stock = newStock;
    
    this.showSuccess(`Остаток обновлен: ${newStock} ${product.unit}`);
  } catch (error) {
    console.error('Ошибка обновления остатка:', error);
    this.showError(error.message || 'Ошибка обновления остатка');
    
    // Перезагружаем инвентарь для синхронизации
    await this.loadInventory();
  }
},
    
    async updateMaxStock(productId, newMax) {
      if (newMax < 1) {
        this.showError('Максимальный запас должен быть больше 0')
        await this.loadInventory()
        return
      }
      
      try {
        await api.updateProductMaxStock(productId, newMax)
        this.showSuccess('Максимальный запас обновлен')
      } catch (error) {
        console.error('Ошибка обновления максимального запаса:', error)
        this.showError(error.message || 'Ошибка обновления максимального запаса')
        await this.loadInventory()
      }
    },
    
    async updateMinStock(productId, newMin) {
      if (newMin < 0) {
        this.showError('Минимальный запас должен быть неотрицательным')
        await this.loadInventory()
        return
      }
      
      try {
        await api.updateProductMinStock(productId, newMin)
        this.showSuccess('Минимальный запас обновлен')
      } catch (error) {
        console.error('Ошибка обновления минимального запаса:', error)
        this.showError(error.message || 'Ошибка обновления минимального запаса')
        await this.loadInventory()
      }
    },
    
    async updateExpiryDate(productId, newDate) {
      try {
        await api.updateProductExpiryDate(productId, newDate)
        this.showSuccess('Срок годности обновлен')
      } catch (error) {
        console.error('Ошибка обновления срока годности:', error)
        this.showError(error.message || 'Ошибка обновления срока годности')
        await this.loadInventory()
      }
    },
    
    async deleteProduct(productId) {
      if (!confirm('Вы уверены, что хотите удалить этот продукт?')) {
        return
      }
      
      try {
        await api.deleteProduct(productId)
        await this.loadInventory()
        this.showSuccess('Продукт удален')
      } catch (error) {
        console.error('Ошибка удаления продукта:', error)
        this.showError(error.message || 'Ошибка удаления продукта')
      }
    },
    
    async addProduct() {
      try {
        await api.addProduct(this.newProduct)
        this.showAddProductModal = false
        this.newProduct = {
          name: '',
          unit: 'кг',
          stock: 0,
          max_stock: 100,
          min_stock: 20,
          expiry_date: '2026-12-31'
        }
        await this.loadInventory()
        this.showSuccess('Продукт добавлен')
      } catch (error) {
        console.error('Ошибка добавления продукта:', error)
        this.showError(error.message || 'Ошибка добавления продукта')
      }
    },
    
    async deleteReview(reviewId) {
      if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) {
        return
      }
      
      try {
        await api.deleteReview(reviewId)
        await this.loadReviews()
        this.showSuccess('Отзыв удален')
      } catch (error) {
        console.error('Ошибка удаления отзыва:', error)
        this.showError(error.message || 'Ошибка удаления отзыва')
      }
    },
    
    getStockStatusClass(item) {
      if (!item) return 'status-normal'
      const percentage = (item.stock / item.max_stock) * 100
      if (percentage < 20) return 'status-critical'
      if (percentage < 50) return 'status-low'
      return 'status-normal'
    },
    
    getStockStatusText(item) {
      if (!item) return 'Нормальный'
      const percentage = (item.stock / item.max_stock) * 100
      if (percentage < 20) return 'Критический'
      if (percentage < 50) return 'Низкий'
      return 'Нормальный'
    },
    
    formatDate(date) {
      if (!date) return '-'
      const d = new Date(date)
      d.setFullYear(2026)
      return d.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },
    
    showSuccess(message) {
      alert(message)
    },
    
    showError(message) {
      alert('Ошибка: ' + message)
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem;
  background: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

.section h2 {
  margin-bottom: 1.5rem;
  color: #444;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

.stat-card i {
  font-size: 2.5rem;
  color: #667eea;
}

.stat-info h3 {
  font-size: 1.8rem;
  margin-bottom: 0.25rem;
}

.stat-info p {
  color: #666;
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-container {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

.simple-chart {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chart-bar-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chart-bar-label {
  width: 80px;
  font-size: 0.875rem;
  color: #666;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chart-bar {
  height: 30px;
  border-radius: 4px;
  transition: width 0.3s;
}

.chart-bar-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
  min-width: 80px;
}

/* Стили для инвентаря */
.inventory-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-box i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-box input {
  padding-left: 35px;
  width: 100%;
}

.btn-refresh {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.btn-refresh:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.btn-refresh:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-add {
  padding: 0.75rem 1.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.btn-add:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #667eea;
}

.loading-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.no-inventory {
  text-align: center;
  padding: 3rem;
  color: #999;
  background: #f8f9fa;
  border-radius: 10px;
}

.no-inventory i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #667eea;
}

.btn-test {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #ffa502;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.btn-test:hover {
  background: #ff9f1a;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 165, 2, 0.3);
}

.inventory-table {
  overflow-x: auto;
}

.inventory-table table {
  width: 100%;
  border-collapse: collapse;
}

.inventory-table th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
}

.inventory-table td {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.stock-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-stock-mini {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: #f0f0f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-stock-mini:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.btn-stock-mini:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stock-value {
  font-weight: 600;
  min-width: 40px;
  text-align: center;
}

.stock-value.status-critical {
  color: #ff4757;
}

.stock-value.status-low {
  color: #ffa502;
}

.stock-value.status-normal {
  color: #2ed573;
}

.form-control-sm {
  width: 100px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
}

.btn-delete {
  padding: 0.5rem;
  background: none;
  border: none;
  color: #ff4757;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.1rem;
}

.btn-delete:hover {
  transform: scale(1.1);
  color: #ff6b81;
}

.reviews-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 600px;
  overflow-y: auto;
}

.review-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  transition: transform 0.3s;
}

.review-card:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.reviewer-info i {
  font-size: 2rem;
  color: #667eea;
}

.reviewer-class {
  display: block;
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.25rem;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.stars-container {
  display: flex;
  gap: 0.25rem;
}

.star i {
  font-size: 1.1rem;
  transition: color 0.2s;
}

.star i.active {
  color: #ffd700 !important;
}

.rating-value {
  font-weight: 600;
  color: #666;
  font-size: 0.875rem;
}

.review-date {
  color: #999;
  font-size: 0.875rem;
}

.review-dish {
  margin-bottom: 1rem;
}

.dish-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  margin-right: 0.5rem;
}

.dish-badge.breakfast {
  background: #ffd93d;
  color: #000;
}

.dish-badge.lunch {
  background: #6c5ce7;
  color: white;
}

.dish-name {
  font-weight: 600;
  color: #333;
}

.review-comment {
  padding: 1rem;
  background: white;
  border-radius: 5px;
  margin-bottom: 1rem;
  font-style: italic;
  color: #666;
}

.review-comment.no-comment {
  color: #999;
  font-style: normal;
}

.review-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-delete-review {
  padding: 0.5rem 1rem;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-delete-review:hover {
  background: #ff6b81;
  transform: translateY(-2px);
}

.no-reviews {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.no-reviews i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.reviews-summary {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.summary-stat {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-top: 0.5rem;
}

.requests-table {
  overflow-x: auto;
}

.requests-table table {
  width: 100%;
  border-collapse: collapse;
}

.requests-table th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
}

.requests-table td {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.status-pending {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #ffd93d;
  border-radius: 15px;
  font-size: 0.875rem;
}

.btn-approve,
.btn-reject {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  margin: 0 0.25rem;
  cursor: pointer;
  color: white;
  transition: all 0.3s;
}

.btn-approve {
  background: #4CAF50;
}

.btn-approve:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.btn-reject {
  background: #ff4757;
}

.btn-reject:hover {
  background: #ff6b81;
  transform: translateY(-2px);
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.report-card {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
}

.report-filters {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
}

.btn-generate {
  width: 100%;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-generate:hover {
  background: #5a67d8;
  transform: translateY(-2px);
}

.form-control {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.875rem;
  width: 100%;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102,126,234,0.1);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.875rem;
  font-weight: 500;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge.status-critical {
  background: #ff4757;
  color: white;
}

.status-badge.status-low {
  background: #ffa502;
  color: white;
}

.status-badge.status-normal {
  background: #2ed573;
  color: white;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close {
  position: absolute;
  right: 1.5rem;
  top: 1rem;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
}

.close:hover {
  color: #333;
}

.add-product-form {
  margin-top: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-save {
  flex: 1;
  padding: 0.75rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-save:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.btn-cancel {
  flex: 1;
  padding: 0.75rem;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-cancel:hover {
  background: #ff6b81;
  transform: translateY(-2px);
}

.text-center {
  text-align: center;
}

.mt-2 {
  margin-top: 0.5rem;
}

.fa-spin {
  animation: fa-spin 2s infinite linear;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(359deg);
  }
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .inventory-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .reviews-filters {
    flex-direction: column;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .reports-grid {
    grid-template-columns: 1fr;
  }
  
  .review-header {
    flex-direction: column;
  }
  
  .review-rating {
    width: 100%;
    justify-content: space-between;
  }
}
</style>