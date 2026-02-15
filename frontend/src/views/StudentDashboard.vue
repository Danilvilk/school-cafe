<template>
  <div class="student-dashboard">
    <div class="container">
      <!-- Профиль ученика -->
      <div class="profile-section">
        <div class="profile-card">
          <div class="profile-header">
            <i class="fas fa-user-graduate fa-3x"></i>
            <div>
              <h2>{{ user.name }}</h2>
              <p class="class-info">Класс: {{ user.class || 'Не указан' }}</p>
            </div>
          </div>
          
          <div class="balance-card">
            <h3>Баланс</h3>
            <div class="balance-amount">{{ balance }} ₽</div>
            <button @click="showPaymentModal = true" class="btn-pay">
              <i class="fas fa-credit-card"></i> Пополнить
            </button>
          </div>
          
          <div class="allergies-section">
            <h3>Пищевые особенности</h3>
            <div class="allergies-tags">
              <span 
                v-for="allergy in allergies" 
                :key="allergy"
                class="allergy-tag"
              >
                {{ allergy }}
                <i class="fas fa-times" @click.stop="removeAllergy(allergy)"></i>
              </span>
              <span v-if="allergies.length === 0" class="no-allergies">
                Нет указанных аллергий
              </span>
            </div>
            <button @click="showAllergiesModal = true" class="btn-edit">
              <i class="fas fa-edit"></i> Редактировать
            </button>
          </div>
        </div>
      </div>
      
      <!-- Меню на сегодня -->
      <div class="menu-section">
        <h2><i class="fas fa-calendar-day"></i> Меню на {{ formatDate(new Date()) }}</h2>
        
        <div class="menu-grid">
          <div class="menu-card breakfast">
            <div class="menu-header">
              <i class="fas fa-sun"></i>
              <h3>Завтрак</h3>
            </div>
            <div v-if="todayMenu.breakfast && todayMenu.breakfast.length > 0" class="menu-items">
              <div v-for="item in todayMenu.breakfast" :key="item.id" class="menu-item">
                <div class="item-info">
                  <h4>{{ item.name }}</h4>
                  <p>{{ item.description }}</p>
                  <span class="price">{{ item.price }} ₽</span>
                  <div v-if="hasAllergy(item)" class="allergy-warning-small">
                    <i class="fas fa-exclamation-triangle"></i> Содержит аллергены
                  </div>
                </div>
                <button 
                  @click="orderMeal(item.id, 'breakfast')"
                  :disabled="item.ordered"
                  class="btn-order"
                >
                  <i :class="item.ordered ? 'fas fa-check' : 'fas fa-shopping-cart'"></i>
                  {{ item.ordered ? 'Заказано' : 'Заказать' }}
                </button>
              </div>
            </div>
            <div v-else class="no-menu">
              <i class="fas fa-coffee"></i>
              <p>Нет блюд на завтрак</p>
            </div>
          </div>
          
          <div class="menu-card lunch">
            <div class="menu-header">
              <i class="fas fa-moon"></i>
              <h3>Обед</h3>
            </div>
            <div v-if="todayMenu.lunch && todayMenu.lunch.length > 0" class="menu-items">
              <div v-for="item in todayMenu.lunch" :key="item.id" class="menu-item">
                <div class="item-info">
                  <h4>{{ item.name }}</h4>
                  <p>{{ item.description }}</p>
                  <span class="price">{{ item.price }} ₽</span>
                  <div v-if="hasAllergy(item)" class="allergy-warning-small">
                    <i class="fas fa-exclamation-triangle"></i> Содержит аллергены
                  </div>
                </div>
                <button 
                  @click="orderMeal(item.id, 'lunch')"
                  :disabled="item.ordered"
                  class="btn-order"
                >
                  <i :class="item.ordered ? 'fas fa-check' : 'fas fa-shopping-cart'"></i>
                  {{ item.ordered ? 'Заказано' : 'Заказать' }}
                </button>
              </div>
            </div>
            <div v-else class="no-menu">
              <i class="fas fa-utensils"></i>
              <p>Нет блюд на обед</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Мои заказы -->
<div class="orders-section">
  <h2><i class="fas fa-clipboard-list"></i> Мои заказы на сегодня</h2>
  <div class="orders-list">
    <div v-if="todayOrders.breakfast" class="order-item">
      <i class="fas fa-sun"></i>
      <div class="order-details">
        <span class="order-dish">{{ todayOrders.breakfast.dish_name }}</span>
        <span class="order-price">{{ todayOrders.breakfast.price }} ₽</span>
      </div>
      <span class="order-status" :class="todayOrders.breakfast.status">
        {{ getOrderStatusText(todayOrders.breakfast.status) }}
      </span>
    </div>
    <div v-else class="order-item empty">
      <i class="fas fa-sun"></i>
      <span>Завтрак не заказан</span>
    </div>
    
    <div v-if="todayOrders.lunch" class="order-item">
      <i class="fas fa-moon"></i>
      <div class="order-details">
        <span class="order-dish">{{ todayOrders.lunch.dish_name }}</span>
        <span class="order-price">{{ todayOrders.lunch.price }} ₽</span>
      </div>
      <span class="order-status" :class="todayOrders.lunch.status">
        {{ getOrderStatusText(todayOrders.lunch.status) }}
      </span>
    </div>
    <div v-else class="order-item empty">
      <i class="fas fa-moon"></i>
      <span>Обед не заказан</span>
    </div>
  </div>
</div>
      
      <!-- История питания -->
      <div class="history-section">
        <h2><i class="fas fa-history"></i> История питания</h2>
        <div class="history-list">
          <div v-for="record in mealHistory" :key="record.id" class="history-item">
            <div class="history-date">{{ formatDate(record.date) }}</div>
            <div class="history-meal">
              <span :class="record.type === 'breakfast' ? 'badge-breakfast' : 'badge-lunch'">
                {{ record.type === 'breakfast' ? 'Завтрак' : 'Обед' }}
              </span>
              <span class="history-dish">{{ record.dish_name }}</span>
            </div>
            <div class="history-price">{{ record.price }} ₽</div>
          </div>
          <div v-if="mealHistory.length === 0" class="no-history">
            <i class="fas fa-utensils"></i>
            <p>История питания пуста</p>
          </div>
        </div>
      </div>
      
      <!-- Отзывы -->
      <div class="reviews-section">
        <h2><i class="fas fa-star"></i> Оставить отзыв</h2>
        <div class="review-form card">
          <div class="form-group">
            <label>Выберите блюдо</label>
            <select v-model="review.dishId" class="form-control">
              <option value="">-- Выберите блюдо --</option>
              <option v-for="dish in dishes" :key="dish.id" :value="dish.id">
                {{ dish.name }} ({{ dish.type === 'breakfast' ? 'Завтрак' : 'Обед' }})
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Оценка</label>
            <div class="rating">
              <span 
                v-for="star in 5" 
                :key="star"
                @click="review.rating = star"
                :class="{ active: star <= review.rating }"
              >
                <i class="fas fa-star"></i>
              </span>
              <span class="rating-value" v-if="review.rating > 0">
                {{ review.rating }}/5
              </span>
            </div>
          </div>
          
          <div class="form-group">
            <label>Комментарий</label>
            <textarea 
              v-model="review.comment" 
              placeholder="Ваш отзыв..."
              rows="3"
              class="form-control"
            ></textarea>
          </div>
          
          <button @click="submitReview" class="btn-submit" :disabled="!review.dishId || !review.rating">
            <i class="fas fa-paper-plane"></i> Отправить отзыв
          </button>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно оплаты -->
    <div v-if="showPaymentModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showPaymentModal = false">&times;</span>
        <h3>Пополнение баланса</h3>
        
        <div class="payment-options">
          <div 
            class="payment-option"
            :class="{ active: paymentType === 'one-time' }"
            @click="paymentType = 'one-time'"
          >
            <i class="fas fa-coins"></i>
            <h4>Разовый платёж</h4>
            <p>Оплата одного приёма пищи</p>
          </div>
          
          <div 
            class="payment-option"
            :class="{ active: paymentType === 'subscription' }"
            @click="paymentType = 'subscription'"
          >
            <i class="fas fa-calendar-check"></i>
            <h4>Абонемент</h4>
            <p>Оплата на месяц</p>
          </div>
        </div>
        
        <div v-if="paymentType === 'one-time'" class="payment-form">
          <div class="form-group">
            <label>Сумма пополнения</label>
            <div class="amount-presets">
              <button @click="paymentAmount = 100" :class="{ active: paymentAmount === 100 }">100 ₽</button>
              <button @click="paymentAmount = 500" :class="{ active: paymentAmount === 500 }">500 ₽</button>
              <button @click="paymentAmount = 1000" :class="{ active: paymentAmount === 1000 }">1000 ₽</button>
              <button @click="paymentAmount = 2000" :class="{ active: paymentAmount === 2000 }">2000 ₽</button>
            </div>
            <input 
              type="number" 
              v-model.number="paymentAmount" 
              min="10" 
              step="10"
              class="form-control mt-2"
              placeholder="Или введите сумму"
            >
          </div>
          <button @click="makePayment" class="btn-pay-modal">
            Оплатить {{ paymentAmount }} ₽
          </button>
        </div>
        
        <div v-if="paymentType === 'subscription'" class="payment-form">
          <div class="subscription-info">
            <p>Абонемент на {{ currentYear }} год:</p>
            <ul>
              <li><i class="fas fa-check"></i> Завтраки: 1500 ₽/мес</li>
              <li><i class="fas fa-check"></i> Обеды: 2000 ₽/мес</li>
              <li><i class="fas fa-check"></i> Завтраки + обеды: 3200 ₽/мес</li>
            </ul>
          </div>
          <select v-model="subscriptionType" class="form-control">
            <option value="breakfast">Только завтраки (1500 ₽/мес)</option>
            <option value="lunch">Только обеды (2000 ₽/мес)</option>
            <option value="both">Завтраки и обеды (3200 ₽/мес)</option>
          </select>
          <button @click="buySubscription" class="btn-pay-modal">
            Оформить абонемент
          </button>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно аллергий -->
    <div v-if="showAllergiesModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showAllergiesModal = false">&times;</span>
        <h3><i class="fas fa-allergies"></i> Пищевые особенности</h3>
        <p class="modal-description">Отметьте продукты, которые вызывают у вас аллергию или непереносимость</p>
        
        <div class="allergies-list">
          <div 
            v-for="option in allergyOptions" 
            :key="option"
            class="allergy-checkbox"
          >
            <label>
              <input 
                type="checkbox" 
                v-model="selectedAllergies" 
                :value="option"
              >
              {{ option }}
            </label>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="saveAllergies" class="btn-save">
            <i class="fas fa-save"></i> Сохранить
          </button>
          <button @click="showAllergiesModal = false" class="btn-cancel">
            <i class="fas fa-times"></i> Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api'

export default {
  name: 'StudentDashboard',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      balance: 0,
      allergies: [],
      todayMenu: {
        breakfast: [],
        lunch: []
      },
      todayOrders: {
        breakfast: null,
        lunch: null
      },
      mealHistory: [],
      dishes: [],
      showPaymentModal: false,
      showAllergiesModal: false,
      paymentType: 'one-time',
      paymentAmount: 100,
      subscriptionType: 'both',
      selectedAllergies: [],
      allergyOptions: [
        'Глютен', 'Лактоза', 'Яйца', 'Орехи', 
        'Рыба', 'Соя', 'Кунжут', 'Сельдерей',
        'Арахис', 'Моллюски', 'Горчица', 'Люпин'
      ],
      review: {
        dishId: '',
        rating: 0,
        comment: ''
      },
      currentYear: 2026
    }
  },
  async created() {
    await this.loadData()
    await this.loadAllergies()
    await this.checkTodayOrders()
  },
  methods: {
    async loadData() {
      try {
        this.user = JSON.parse(localStorage.getItem('user') || '{}')
        
        const [balance, menu, history, dishes] = await Promise.all([
          api.getBalance(),
          api.getTodayMenu(),
          api.getMealHistory(),
          api.getDishes()
        ])
        
        this.balance = balance
        this.todayMenu = menu
        this.mealHistory = history
        this.dishes = dishes
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
        this.showError('Не удалось загрузить данные')
      }
    },
    
    async checkTodayOrders() {
      try {
        const breakfastOrder = await api.getOrderForToday('breakfast')
        const lunchOrder = await api.getOrderForToday('lunch')
        
        this.todayOrders = {
          breakfast: breakfastOrder.hasOrder ? breakfastOrder.order : null,
          lunch: lunchOrder.hasOrder ? lunchOrder.order : null
        }
        
        // Отмечаем заказанные блюда в меню
        if (this.todayOrders.breakfast) {
          const breakfastItem = this.todayMenu.breakfast.find(
            item => item.id === this.todayOrders.breakfast.dish_id
          )
          if (breakfastItem) breakfastItem.ordered = true
        }
        
        if (this.todayOrders.lunch) {
          const lunchItem = this.todayMenu.lunch.find(
            item => item.id === this.todayOrders.lunch.dish_id
          )
          if (lunchItem) lunchItem.ordered = true
        }
      } catch (error) {
        console.error('Ошибка проверки заказов:', error)
      }
    },
    
    async loadAllergies() {
      try {
        this.allergies = await api.getAllergies() || []
        this.selectedAllergies = [...this.allergies]
      } catch (error) {
        console.error('Ошибка загрузки аллергий:', error)
      }
    },
    
    async orderMeal(dishId, type) {
  try {
    console.log('Заказ блюда:', { dishId, type });
    
    // Проверяем, не заказано ли уже
    if (type === 'breakfast' && this.todayOrders.breakfast) {
      this.showError('Вы уже заказали завтрак на сегодня');
      return;
    }
    if (type === 'lunch' && this.todayOrders.lunch) {
      this.showError('Вы уже заказали обед на сегодня');
      return;
    }
    
    const result = await api.createOrder(dishId, type);
    console.log('Результат заказа:', result);
    
    // Обновляем данные
    await this.checkTodayOrders();
    await this.loadData();
    
    this.showSuccess(result.message || 'Заказ создан! Ожидайте подтверждения повара.');
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    
    if (error.message && error.message.includes('уже заказали')) {
      this.showError('Вы уже заказали этот приём пищи на сегодня!');
    } else if (error.message && error.message.includes('Недостаточно средств')) {
      this.showError('Недостаточно средств на балансе!');
    } else {
      this.showError(error.message || 'Ошибка при создании заказа');
    }
  }
},
    
    async makePayment() {
      if (this.paymentAmount < 10) {
        this.showError('Минимальная сумма пополнения - 10 ₽')
        return
      }
      
      try {
        await api.makePayment(this.paymentAmount, 'one-time')
        this.balance += this.paymentAmount
        this.showPaymentModal = false
        this.showSuccess('Баланс успешно пополнен!')
        await this.loadData()
      } catch (error) {
        this.showError(error.message || 'Ошибка оплаты')
      }
    },
    
    async buySubscription() {
      try {
        await api.makePayment(0, 'subscription', { type: this.subscriptionType })
        this.showPaymentModal = false
        this.showSuccess('Абонемент успешно оформлен!')
        await this.loadData()
      } catch (error) {
        this.showError(error.message || 'Ошибка оформления абонемента')
      }
    },
    
    async saveAllergies() {
      try {
        await api.updateAllergies(this.selectedAllergies)
        this.allergies = [...this.selectedAllergies]
        this.showAllergiesModal = false
        this.showSuccess('Информация об аллергиях сохранена!')
        
        localStorage.setItem('userAllergies', JSON.stringify(this.allergies))
      } catch (error) {
        this.showError(error.message || 'Ошибка сохранения')
      }
    },
    
    removeAllergy(allergy) {
      this.selectedAllergies = this.selectedAllergies.filter(a => a !== allergy)
      this.saveAllergies()
    },
    
    async submitReview() {
      if (!this.review.dishId) {
        this.showError('Выберите блюдо!')
        return
      }
      
      if (!this.review.rating) {
        this.showError('Поставьте оценку!')
        return
      }
      
      try {
        await api.submitReview(this.review)
        this.review = { dishId: '', rating: 0, comment: '' }
        this.showSuccess('Спасибо за отзыв!')
      } catch (error) {
        this.showError(error.message || 'Ошибка отправки отзыва')
      }
    },
    
    hasAllergy(item) {
      if (!item?.allergens || !this.allergies?.length) return false
      const itemAllergens = item.allergens.split(',').map(a => a.trim())
      return itemAllergens.some(allergen => this.allergies.includes(allergen))
    },
    
    getOrderStatusText(status) {
      const statuses = {
        'pending': 'Ожидает подтверждения',
        'confirmed': 'Подтвержден',
        'cancelled': 'Отменен'
      }
      return statuses[status] || status
    },
    
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
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
.student-dashboard {
  padding: 2rem;
  background: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-section {
  margin-bottom: 2rem;
}

.profile-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-header i {
  color: #667eea;
  font-size: 2.5rem;
}

.class-info {
  color: #666;
  margin-top: 0.5rem;
  font-size: 1.1rem;
}

.balance-card {
  text-align: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
  min-width: 200px;
}

.balance-amount {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.btn-pay {
  padding: 0.5rem 1.5rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-pay:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.allergies-section {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
  min-width: 250px;
}

.allergies-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
  min-height: 40px;
}

.allergy-tag {
  padding: 0.5rem 1rem;
  background: #ff4757;
  color: white;
  border-radius: 20px;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.allergy-tag i {
  cursor: pointer;
  font-size: 0.75rem;
  opacity: 0.8;
}

.allergy-tag i:hover {
  opacity: 1;
}

.no-allergies {
  color: #999;
  font-style: italic;
  padding: 0.5rem 0;
}

.btn-edit {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.875rem;
}

.menu-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
}

.menu-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

.menu-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.menu-header i {
  font-size: 1.5rem;
  color: #667eea;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin-bottom: 0.25rem;
  color: #333;
}

.item-info p {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.price {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e8f5e9;
  color: #4CAF50;
  border-radius: 15px;
  font-weight: bold;
  font-size: 0.875rem;
}

.allergy-warning-small {
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: #fff3cd;
  color: #856404;
  border-radius: 15px;
  font-size: 0.75rem;
  display: inline-block;
}

.btn-order {
  padding: 0.5rem 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s;
  white-space: nowrap;
  margin-left: 1rem;
}

.btn-order:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
}

.btn-order:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.no-menu {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.no-menu i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.orders-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

.orders-list {
  margin-top: 1rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.order-item i {
  color: #667eea;
  font-size: 1.2rem;
}

.order-status {
  margin-left: auto;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
}

.order-status.pending {
  background: #ffd93d;
  color: #000;
}

.order-status.confirmed {
  background: #4CAF50;
  color: white;
}

.no-orders {
  text-align: center;
  padding: 1rem;
  color: #999;
}

.history-list {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-date {
  color: #666;
  font-size: 0.875rem;
  min-width: 100px;
}

.history-meal {
  flex: 1;
  margin: 0 1rem;
}

.badge-breakfast {
  background: #ffd93d;
  color: #000;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  margin-right: 1rem;
}

.badge-lunch {
  background: #6c5ce7;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  margin-right: 1rem;
}

.history-price {
  font-weight: bold;
  color: #667eea;
  min-width: 80px;
  text-align: right;
}

.no-history {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.review-form {
  margin: 1rem 0;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  color: #ddd;
  margin: 0.5rem 0;
}

.rating span {
  cursor: pointer;
  transition: color 0.2s;
}

.rating span:hover {
  color: #ffd700;
}

.rating span.active {
  color: #ffd700;
}

.rating-value {
  font-size: 1rem;
  color: #666;
  margin-left: 0.5rem;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.payment-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 2rem 0;
}

.payment-option {
  padding: 1.5rem;
  border: 2px solid #ddd;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-option:hover {
  border-color: #667eea;
  background: #f0f3ff;
}

.payment-option.active {
  border-color: #667eea;
  background: #f0f3ff;
}

.payment-option i {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.amount-presets {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.amount-presets button {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.amount-presets button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-pay-modal {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  margin-top: 1rem;
  cursor: pointer;
  font-size: 1rem;
}

.subscription-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
}

.subscription-info ul {
  list-style: none;
  margin-top: 0.5rem;
}

.subscription-info li {
  padding: 0.25rem 0;
  color: #666;
}

.subscription-info li i {
  color: #4CAF50;
  margin-right: 0.5rem;
}

.allergies-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
  max-height: 300px;
  overflow-y: auto;
}

.allergy-checkbox {
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 5px;
}

.allergy-checkbox label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-save {
  flex: 1;
  padding: 0.75rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-cancel {
  flex: 1;
  padding: 0.75rem;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
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
  max-width: 500px;
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
}

.close:hover {
  color: #333;
}

.modal-description {
  color: #666;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .profile-card {
    flex-direction: column;
    align-items: stretch;
  }
  
  .profile-header {
    justify-content: center;
  }
  
  .menu-grid {
    grid-template-columns: 1fr;
  }
  
  .payment-options {
    grid-template-columns: 1fr;
  }
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .history-meal {
    margin: 0;
  }
  
  .history-price {
    text-align: left;
  }
}
.orders-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

.orders-list {
  margin-top: 1rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.order-item.empty {
  background: #f8f9fa;
  color: #999;
  font-style: italic;
}

.order-item i {
  color: #667eea;
  font-size: 1.2rem;
  width: 24px;
}

.order-details {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-dish {
  font-weight: 500;
  color: #333;
}

.order-price {
  font-weight: bold;
  color: #4CAF50;
  background: #e8f5e9;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
  font-weight: 500;
}

.order-status.pending {
  background: #ffd93d;
  color: #000;
}

.order-status.confirmed {
  background: #4CAF50;
  color: white;
}
</style>