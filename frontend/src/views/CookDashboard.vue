<template>
  <div class="cook-dashboard">
    <div class="container">
      <h1><i class="fas fa-utensil-spoon"></i> Панель повара</h1>
      
      <!-- Статистика на сегодня -->
<div class="section">
  <h2><i class="fas fa-chart-simple"></i> Статистика на сегодня</h2>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon breakfast">
        <i class="fas fa-sun"></i>
      </div>
      <div class="stat-info">
        <span class="stat-label">Завтрак</span>
        <span class="stat-value">{{ meals.breakfast.ordered }} / {{ meals.breakfast.total }}</span>
        <span class="stat-detail">Заказано: {{ meals.breakfast.ordered }}</span>
        <span class="stat-detail">Выдано: {{ meals.breakfast.served }}</span>
        <span class="stat-detail">Осталось: {{ meals.breakfast.left }}</span>
        <span class="stat-detail" :class="{ 'text-danger': meals.breakfast.left < meals.breakfast.ordered }">
          Доступно порций: {{ meals.breakfast.left }}
        </span>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon lunch">
        <i class="fas fa-moon"></i>
      </div>
      <div class="stat-info">
        <span class="stat-label">Обед</span>
        <span class="stat-value">{{ meals.lunch.ordered }} / {{ meals.lunch.total }}</span>
        <span class="stat-detail">Заказано: {{ meals.lunch.ordered }}</span>
        <span class="stat-detail">Выдано: {{ meals.lunch.served }}</span>
        <span class="stat-detail">Осталось: {{ meals.lunch.left }}</span>
        <span class="stat-detail" :class="{ 'text-danger': meals.lunch.left < meals.lunch.ordered }">
          Доступно порций: {{ meals.lunch.left }}
        </span>
      </div>
    </div>
  </div>
</div>
      
      <!-- Ожидающие заказы с поиском -->
      <div class="section">
        <h2><i class="fas fa-clock"></i> Ожидающие заказы</h2>
        
        <!-- Панель поиска и фильтрации -->
        <div class="orders-controls">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Поиск по ФИО ученика..."
              class="form-control"
            >
          </div>
          
          <div class="filter-buttons">
            <button 
              :class="['filter-btn', { active: ordersFilter === 'all' }]"
              @click="ordersFilter = 'all'"
            >
              Все ({{ pendingOrders.length }})
            </button>
            <button 
              :class="['filter-btn', { active: ordersFilter === 'breakfast' }]"
              @click="ordersFilter = 'breakfast'"
            >
              Завтрак ({{ breakfastOrdersCount }})
            </button>
            <button 
              :class="['filter-btn', { active: ordersFilter === 'lunch' }]"
              @click="ordersFilter = 'lunch'"
            >
              Обед ({{ lunchOrdersCount }})
            </button>
          </div>
        </div>
        
        <!-- Результаты поиска -->
        <div v-if="searchQuery" class="search-results-info">
          Найдено заказов: {{ filteredOrders.length }}
          <button @click="clearSearch" class="clear-search">
            <i class="fas fa-times"></i> Очистить
          </button>
        </div>
        
        <!-- Список заказов -->
        <div class="orders-list">
          <div v-for="order in filteredOrders" :key="order.id" class="order-card">
            <div class="order-header">
              <div class="student-info">
                <i class="fas fa-user-graduate"></i>
                <div>
                  <strong>{{ order.student_name }}</strong>
                  <span class="student-class">{{ order.student_class }}</span>
                </div>
              </div>
              <span :class="'meal-badge ' + order.type">
                {{ order.type === 'breakfast' ? 'Завтрак' : 'Обед' }}
              </span>
            </div>
            
            <div class="order-details">
              <span class="dish-name">{{ order.dish_name }}</span>
              <span class="order-price">{{ order.price }} ₽</span>
              <span class="order-time">{{ formatTime(order.created_at) }}</span>
            </div>
            
            <div class="order-actions">
              <button @click="confirmOrder(order.id)" class="btn-confirm">
                <i class="fas fa-check"></i> Подтвердить выдачу
              </button>
            </div>
          </div>
          
          <div v-if="filteredOrders.length === 0" class="no-orders">
            <i class="fas fa-search"></i>
            <p v-if="searchQuery">Ничего не найдено по запросу "{{ searchQuery }}"</p>
            <p v-else>Нет ожидающих заказов</p>
          </div>
        </div>
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
          <button @click="showAddRequestModal = true" class="btn-add">
            <i class="fas fa-shopping-cart"></i> Заказать продукты
          </button>
        </div>
        
        <div v-if="inventory.length === 0" class="no-inventory">
          <i class="fas fa-box-open"></i>
          <p>Нет данных об остатках продуктов</p>
          <button @click="loadInventory" class="btn-refresh">
            <i class="fas fa-sync-alt"></i> Обновить
          </button>
        </div>
        
        <div v-else class="inventory-grid">
          <div v-for="item in filteredInventory" :key="item.id" class="inventory-card">
            <div class="inventory-header">
              <div>
                <h4>{{ item.name }}</h4>
                <span class="inventory-unit">{{ item.unit }}</span>
              </div>
              <span :class="'stock-badge ' + getStockStatusClass(item)">
                {{ item.stock }} / {{ item.max_stock }} {{ item.unit }}
              </span>
            </div>
            
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: getStockPercentage(item) + '%' }"
                :class="getStockStatusClass(item)"
              ></div>
            </div>
            
            <div class="inventory-details">
              <div class="detail-item">
                <span class="detail-label">Мин. запас:</span>
                <span class="detail-value">{{ item.min_stock }} {{ item.unit }}</span>
              </div>
              <div class="detail-item" v-if="item.expiry_date">
                <span class="detail-label">Годен до:</span>
                <span class="detail-value">{{ formatDate(item.expiry_date) }}</span>
              </div>
            </div>
            
            <div class="inventory-actions">
              <div class="stock-update">
                <div class="quantity-control">
                  <button 
                    @click="updateStock(item.id, -1)" 
                    class="btn-quantity-small"
                    :disabled="item.stock <= 0"
                  >
                    <i class="fas fa-minus"></i>
                  </button>
                  <div class="stock-input-group">
                    <input 
                      type="number" 
                      v-model.number="item.stock" 
                      @change="setExactStock(item.id, item.stock)"
                      class="stock-input"
                      min="0"
                      :max="item.max_stock"
                    >
                    <span class="stock-unit">{{ item.unit }}</span>
                  </div>
                  <button 
                    @click="updateStock(item.id, 1)" 
                    class="btn-quantity-small"
                    :disabled="item.stock >= item.max_stock"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              <button @click="openRequestModal(item)" class="btn-order">
                <i class="fas fa-truck"></i> Заказать
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Заявки на закупку -->
      <div class="section">
        <h2><i class="fas fa-shopping-cart"></i> Мои заявки на закупку</h2>
        
        <div class="requests-tabs">
          <button 
            :class="['tab-btn', { active: requestsTab === 'all' }]"
            @click="requestsTab = 'all'"
          >
            Все ({{ purchaseRequests.length }})
          </button>
          <button 
            :class="['tab-btn', { active: requestsTab === 'pending' }]"
            @click="requestsTab = 'pending'"
          >
            Ожидают ({{ pendingRequestsCount }})
          </button>
          <button 
            :class="['tab-btn', { active: requestsTab === 'approved' }]"
            @click="requestsTab = 'approved'"
          >
            Согласованы
          </button>
        </div>
        
        <div class="requests-list">
          <div 
            v-for="request in filteredRequests" 
            :key="request.id" 
            class="request-card"
          >
            <div class="request-info">
              <span class="product">{{ request.product }}</span>
              <span class="quantity">{{ request.quantity }} {{ request.unit }}</span>
              <span :class="'status-badge status-' + request.status">
                {{ getStatusText(request.status) }}
              </span>
            </div>
            <div class="request-meta">
              <span class="request-date">
                <i class="fas fa-clock"></i>
                {{ formatDate(request.created_at) }}
              </span>
              <span v-if="request.approved_at" class="request-approved">
                <i class="fas fa-check-circle"></i>
                Согласовано: {{ formatDate(request.approved_at) }}
              </span>
            </div>
          </div>
          <div v-if="filteredRequests.length === 0" class="no-requests">
            <i class="fas fa-inbox"></i>
            <p>Нет заявок</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно создания заявки -->
    <div v-if="showAddRequestModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showAddRequestModal = false">&times;</span>
        <h3><i class="fas fa-shopping-cart"></i> Создание заявки на закупку</h3>
        
        <form @submit.prevent="createRequest" class="request-form">
          <div class="form-group">
            <label>Наименование продукта</label>
            <div class="product-select">
              <select v-model="newRequest.product" class="form-control" required>
                <option value="">-- Выберите продукт --</option>
                <option v-for="item in inventory" :key="item.id" :value="item.name">
                  {{ item.name }} (текущий остаток: {{ item.stock }} {{ item.unit }})
                </option>
                <option value="custom">-- Другой продукт --</option>
              </select>
            </div>
            <input 
              v-if="newRequest.product === 'custom'"
              v-model="newRequest.customProduct" 
              type="text" 
              placeholder="Введите название продукта"
              class="form-control mt-2"
              required
            >
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Количество</label>
              <input 
                v-model.number="newRequest.quantity" 
                type="number" 
                min="0.1"
                step="0.1"
                placeholder="Количество"
                class="form-control"
                required
              >
            </div>
            
            <div class="form-group">
              <label>Единица измерения</label>
              <select v-model="newRequest.unit" class="form-control" required>
                <option value="кг">кг</option>
                <option value="л">л</option>
                <option value="шт">шт</option>
                <option value="уп">уп</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Комментарий</label>
            <textarea 
              v-model="newRequest.comment" 
              placeholder="Дополнительная информация..."
              class="form-control"
              rows="2"
            ></textarea>
          </div>
          
          <div class="modal-actions">
            <button type="submit" class="btn-save">
              <i class="fas fa-paper-plane"></i> Отправить заявку
            </button>
            <button type="button" @click="showAddRequestModal = false" class="btn-cancel">
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

export default {
  name: 'CookDashboard',
  data() {
    return {
      meals: {
        breakfast: { ordered: 0, served: 0, left: 0, total: 0 },
        lunch: { ordered: 0, served: 0, left: 0, total: 0 }
      },
      pendingOrders: [],
      inventory: [],
      purchaseRequests: [],
      searchQuery: '', // Поиск по ФИО
      inventorySearch: '',
      ordersFilter: 'all', // Фильтр по типу заказа
      requestsTab: 'all',
      showAddRequestModal: false,
      newRequest: {
        product: '',
        customProduct: '',
        quantity: '',
        unit: 'кг',
        comment: ''
      },
      currentYear: 2026,
      loading: {
        inventory: false,
        orders: false,
        requests: false
      }
    }
  },
  computed: {
    breakfastOrdersCount() {
      return this.pendingOrders.filter(o => o.type === 'breakfast').length
    },
    lunchOrdersCount() {
      return this.pendingOrders.filter(o => o.type === 'lunch').length
    },
    pendingRequestsCount() {
      return this.purchaseRequests.filter(r => r.status === 'pending').length
    },
    
    // Фильтрация заказов по поиску и типу
    filteredOrders() {
      let filtered = this.pendingOrders
      
      // Фильтр по типу заказа
      if (this.ordersFilter !== 'all') {
        filtered = filtered.filter(o => o.type === this.ordersFilter)
      }
      
      // Фильтр по поиску ФИО
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(o => 
          o.student_name.toLowerCase().includes(query)
        )
      }
      
      return filtered
    },
    
    filteredInventory() {
      if (!this.inventorySearch) return this.inventory
      const search = this.inventorySearch.toLowerCase()
      return this.inventory.filter(item => 
        item.name.toLowerCase().includes(search)
      )
    },
    
    filteredRequests() {
      if (this.requestsTab === 'all') {
        return this.purchaseRequests
      }
      return this.purchaseRequests.filter(r => r.status === this.requestsTab)
    }
  },
  async created() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const [stats, orders, inventory, requests] = await Promise.all([
          api.getMealStats().catch(err => {
            console.error('Ошибка загрузки статистики:', err)
            return { breakfast: { ordered: 0, served: 0, left: 0, total: 0 }, lunch: { ordered: 0, served: 0, left: 0, total: 0 } }
          }),
          api.getPendingOrders().catch(err => {
            console.error('Ошибка загрузки заказов:', err)
            return []
          }),
          api.getInventory().catch(err => {
            console.error('Ошибка загрузки инвентаря:', err)
            return []
          }),
          api.getPurchaseRequests().catch(err => {
            console.error('Ошибка загрузки заявок:', err)
            return []
          })
        ])
        
        this.meals = stats
        this.pendingOrders = orders
        this.inventory = inventory
        this.purchaseRequests = requests
        
        console.log('Загружено заказов:', this.pendingOrders.length)
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
        this.showError('Не удалось загрузить данные')
      }
    },
    
    clearSearch() {
      this.searchQuery = ''
    },
    
    async loadInventory() {
      try {
        this.loading.inventory = true
        this.inventory = await api.getInventory()
        console.log('Инвентарь обновлен:', this.inventory.length, 'позиций')
      } catch (error) {
        console.error('Ошибка загрузки инвентаря:', error)
        this.showError('Не удалось загрузить остатки продуктов')
      } finally {
        this.loading.inventory = false
      }
    },
    
    async confirmOrder(orderId) {
      try {
        await api.confirmOrder(orderId)
        await this.loadData()
        this.showSuccess('Заказ подтвержден, еда выдана ученику')
      } catch (error) {
        console.error('Ошибка подтверждения заказа:', error)
        this.showError(error.message || 'Ошибка при подтверждении заказа')
      }
    },
    
    async updateStock(productId, change) {
      try {
        const product = this.inventory.find(p => p.id === productId)
        const newStock = Math.max(0, Math.min(product.max_stock, product.stock + change))
        
        await api.updateProductStock(productId, newStock)
        await this.loadInventory()
        this.showSuccess('Остаток обновлен')
      } catch (error) {
        console.error('Ошибка обновления остатка:', error)
        this.showError(error.message || 'Ошибка обновления остатка')
      }
    },
    
    async setExactStock(productId, newStock) {
      try {
        const product = this.inventory.find(p => p.id === productId)
        
        if (newStock < 0) {
          this.showError('Количество не может быть отрицательным')
          await this.loadInventory()
          return
        }
        
        if (newStock > product.max_stock) {
          this.showError(`Максимальный запас: ${product.max_stock} ${product.unit}`)
          await this.loadInventory()
          return
        }
        
        await api.updateProductStock(productId, newStock)
        this.showSuccess(`Остаток установлен: ${newStock} ${product.unit}`)
      } catch (error) {
        console.error('Ошибка установки остатка:', error)
        this.showError(error.message || 'Ошибка установки остатка')
        await this.loadInventory()
      }
    },
    
    openRequestModal(item) {
      this.newRequest = {
        product: item.name,
        customProduct: '',
        quantity: Math.max(item.min_stock - item.stock, 10),
        unit: item.unit,
        comment: `Срочная заявка. Текущий остаток: ${item.stock} ${item.unit}`
      }
      this.showAddRequestModal = true
    },
    
    async createRequest() {
      if (!this.newRequest.quantity || this.newRequest.quantity <= 0) {
        this.showError('Введите корректное количество')
        return
      }
      
      const requestData = {
        product: this.newRequest.product === 'custom' ? this.newRequest.customProduct : this.newRequest.product,
        quantity: this.newRequest.quantity,
        unit: this.newRequest.unit,
        comment: this.newRequest.comment
      }
      
      if (!requestData.product) {
        this.showError('Введите название продукта')
        return
      }
      
      try {
        await api.createPurchaseRequest(requestData)
        this.showAddRequestModal = false
        this.newRequest = {
          product: '',
          customProduct: '',
          quantity: '',
          unit: 'кг',
          comment: ''
        }
        await this.loadData()
        this.showSuccess('✅ Заявка создана и отправлена на согласование!')
      } catch (error) {
        console.error('Ошибка создания заявки:', error)
        this.showError(error.message || 'Ошибка создания заявки')
      }
    },
    
    getStockStatusClass(item) {
      if (!item) return 'status-normal'
      const percentage = (item.stock / item.max_stock) * 100
      if (percentage < 20) return 'status-critical'
      if (percentage < 50) return 'status-low'
      return 'status-normal'
    },
    
    getStockPercentage(item) {
      if (!item || !item.max_stock) return 0
      return (item.stock / item.max_stock) * 100
    },
    
    getStatusText(status) {
      const statuses = {
        'pending': 'Ожидает',
        'approved': 'Согласовано',
        'rejected': 'Отклонено',
        'completed': 'Выполнено'
      }
      return statuses[status] || status
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
    
    formatTime(date) {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
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
.cook-dashboard {
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.stat-icon.breakfast {
  background: #ffd93d;
  color: #856404;
}

.stat-icon.lunch {
  background: #6c5ce7;
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin: 0.25rem 0;
}

.stat-detail {
  font-size: 0.875rem;
  color: #666;
}

/* Стили для поиска и фильтрации заказов */
.orders-controls {
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

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.filter-btn:hover {
  background: #f0f3ff;
  border-color: #667eea;
}

.filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.search-results-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #e3f2fd;
  border-radius: 5px;
  color: #1976d2;
}

.clear-search {
  padding: 0.25rem 0.75rem;
  background: none;
  border: 1px solid #1976d2;
  border-radius: 5px;
  color: #1976d2;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.clear-search:hover {
  background: #1976d2;
  color: white;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.order-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  transition: transform 0.3s;
  border-left: 4px solid #667eea;
}

.order-card:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.student-info i {
  font-size: 2rem;
  color: #667eea;
}

.student-class {
  display: block;
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.25rem;
}

.meal-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
}

.meal-badge.breakfast {
  background: #ffd93d;
  color: #000;
}

.meal-badge.lunch {
  background: #6c5ce7;
  color: white;
}

.order-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.dish-name {
  font-weight: 600;
  color: #333;
  flex: 1;
}

.order-price {
  font-weight: bold;
  color: #4CAF50;
  background: #e8f5e9;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
}

.order-time {
  color: #999;
  font-size: 0.875rem;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-confirm {
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

.btn-confirm:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
}

.no-orders {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.no-orders i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #4CAF50;
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

.btn-add {
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

.btn-add:hover {
  background: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
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

.btn-refresh {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-refresh:hover {
  background: #5a67d8;
  transform: translateY(-2px);
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.inventory-card {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.inventory-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  border-color: #667eea;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.inventory-header h4 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.inventory-unit {
  font-size: 0.75rem;
  color: #999;
  display: block;
  margin-top: 0.25rem;
}

.stock-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-critical {
  background: #ff4757;
  color: white;
}

.status-low {
  background: #ffa502;
  color: white;
}

.status-normal {
  background: #2ed573;
  color: white;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  margin: 1rem 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-fill.status-critical {
  background: #ff4757;
}

.progress-fill.status-low {
  background: #ffa502;
}

.progress-fill.status-normal {
  background: #2ed573;
}

.inventory-details {
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.75rem;
  color: #999;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
  margin-top: 0.25rem;
}

.inventory-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  gap: 0.5rem;
}

.stock-update {
  flex: 1;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-quantity-small {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #667eea;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-quantity-small:hover:not(:disabled) {
  background: #5a67d8;
  transform: scale(1.1);
}

.btn-quantity-small:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.stock-input-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
}

.stock-input {
  width: 70px;
  height: 36px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.875rem;
}

.stock-unit {
  font-size: 0.875rem;
  color: #666;
  min-width: 30px;
}

.btn-order {
  padding: 0.5rem 1rem;
  background: #ffa502;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  white-space: nowrap;
}

.btn-order:hover {
  background: #ff9f1a;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 165, 2, 0.3);
}

.requests-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.request-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
  border-left: 3px solid #667eea;
}

.request-card:hover {
  transform: translateX(5px);
  background: #f0f3ff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.request-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.product {
  font-weight: 600;
  color: #333;
}

.quantity {
  color: #666;
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-pending {
  background: #ffd93d;
  color: #000;
}

.status-approved {
  background: #2ed573;
  color: white;
}

.status-rejected {
  background: #ff4757;
  color: white;
}

.status-completed {
  background: #70a1ff;
  color: white;
}

.request-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.request-date {
  color: #999;
  font-size: 0.75rem;
}

.request-approved {
  color: #2ed573;
  font-size: 0.75rem;
}

.no-requests {
  text-align: center;
  padding: 2rem;
  color: #999;
  background: #f8f9fa;
  border-radius: 8px;
}

.no-requests i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #667eea;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.close {
  position: absolute;
  right: 1.5rem;
  top: 1rem;
  font-size: 1.8rem;
  cursor: pointer;
  color: #999;
  transition: all 0.3s;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close:hover {
  color: #333;
  background: #f0f0f0;
}

.request-form {
  margin-top: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.mt-2 {
  margin-top: 0.5rem;
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
  font-size: 1rem;
  font-weight: 600;
}

.btn-save:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
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
  font-size: 1rem;
  font-weight: 600;
}

.btn-cancel:hover {
  background: #ff6b81;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 71, 87, 0.3);
}

@media (max-width: 1024px) {
  .inventory-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .orders-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .filter-buttons {
    justify-content: center;
  }
  
  .inventory-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .order-details {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .inventory-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-order {
    width: 100%;
    justify-content: center;
  }
  
  .request-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .request-meta {
    align-items: flex-start;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
.text-danger {
  color: #ff4757;
  font-weight: bold;
}
</style>