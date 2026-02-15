<template>
  <div class="menu-page">
    <div class="container">
      <h1><i class="fas fa-book-open"></i> Меню школьной столовой</h1>
      
      <div class="menu-tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'daily' }]"
          @click="activeTab = 'daily'"
        >
          <i class="fas fa-calendar-day"></i> Меню на сегодня
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'weekly' }]"
          @click="activeTab = 'weekly'"
        >
          <i class="fas fa-calendar-week"></i> Недельное меню
        </button>
      </div>
      
      <!-- Меню на сегодня -->
      <div v-if="activeTab === 'daily'" class="daily-menu">
        <div class="menu-summary">
          <div class="summary-card">
            <h3>Завтрак</h3>
            <p class="total-price">{{ dailyTotal.breakfast }} ₽</p>
          </div>
          <div class="summary-card">
            <h3>Обед</h3>
            <p class="total-price">{{ dailyTotal.lunch }} ₽</p>
          </div>
        </div>
        
        <div class="daily-meals">
          <div class="meals-section">
            <h2><i class="fas fa-sun"></i> Завтрак</h2>
            <div v-if="dailyMenu.breakfast && dailyMenu.breakfast.length > 0">
              <div v-for="item in dailyMenu.breakfast" :key="item.id" class="meal-card">
                <div class="meal-header">
                  <h3>{{ item.name }}</h3>
                  <span class="price-tag">{{ item.price }} ₽</span>
                </div>
                <p>{{ item.description }}</p>
                <div class="meal-nutrition" v-if="item.calories">
                  <span>🔥 {{ item.calories }} ккал</span>
                  <span>🥩 Б: {{ item.protein }}г</span>
                  <span>🧈 Ж: {{ item.fat }}г</span>
                  <span>🍚 У: {{ item.carbs }}г</span>
                </div>
                <div class="allergy-warning" v-if="hasAllergy(item)">
                  <i class="fas fa-exclamation-triangle"></i>
                  Содержит аллергены: {{ getAllergens(item) }}
                </div>
              </div>
            </div>
            <div v-else class="no-menu">
              <i class="fas fa-coffee"></i>
              <p>Нет блюд на завтрак</p>
            </div>
          </div>
          
          <div class="meals-section">
            <h2><i class="fas fa-moon"></i> Обед</h2>
            <div v-if="dailyMenu.lunch && dailyMenu.lunch.length > 0">
              <div v-for="item in dailyMenu.lunch" :key="item.id" class="meal-card">
                <div class="meal-header">
                  <h3>{{ item.name }}</h3>
                  <span class="price-tag">{{ item.price }} ₽</span>
                </div>
                <p>{{ item.description }}</p>
                <div class="meal-nutrition" v-if="item.calories">
                  <span>🔥 {{ item.calories }} ккал</span>
                  <span>🥩 Б: {{ item.protein }}г</span>
                  <span>🧈 Ж: {{ item.fat }}г</span>
                  <span>🍚 У: {{ item.carbs }}г</span>
                </div>
                <div class="allergy-warning" v-if="hasAllergy(item)">
                  <i class="fas fa-exclamation-triangle"></i>
                  Содержит аллергены: {{ getAllergens(item) }}
                </div>
              </div>
            </div>
            <div v-else class="no-menu">
              <i class="fas fa-utensils"></i>
              <p>Нет блюд на обед</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Недельное меню -->
      <div v-if="activeTab === 'weekly'" class="weekly-menu">
        <div v-for="day in weeklyMenu" :key="day.date" class="day-card">
          <h3>{{ formatDay(day.date) }}</h3>
          
          <div class="day-meals">
            <div class="meal-block breakfast">
              <h4><i class="fas fa-sun"></i> Завтрак</h4>
              <div v-if="day.breakfast && day.breakfast.length > 0">
                <div v-for="item in day.breakfast" :key="item.id" class="meal-item">
                  <div class="meal-info">
                    <span class="meal-name">{{ item.name }}</span>
                    <span class="meal-price">{{ item.price }} ₽</span>
                  </div>
                  <p class="meal-description">{{ item.description }}</p>
                </div>
              </div>
              <div v-else class="no-items">Нет блюд</div>
            </div>
            
            <div class="meal-block lunch">
              <h4><i class="fas fa-moon"></i> Обед</h4>
              <div v-if="day.lunch && day.lunch.length > 0">
                <div v-for="item in day.lunch" :key="item.id" class="meal-item">
                  <div class="meal-info">
                    <span class="meal-name">{{ item.name }}</span>
                    <span class="meal-price">{{ item.price }} ₽</span>
                  </div>
                  <p class="meal-description">{{ item.description }}</p>
                </div>
              </div>
              <div v-else class="no-items">Нет блюд</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api'

export default {
  name: 'Menu',
  data() {
    return {
      activeTab: 'daily', // По умолчанию показываем меню на сегодня
      weeklyMenu: [],
      dailyMenu: {
        breakfast: [],
        lunch: []
      },
      userAllergies: []
    }
  },
  computed: {
    dailyTotal() {
      const breakfastTotal = this.dailyMenu.breakfast?.reduce((sum, item) => sum + (item.price || 0), 0) || 0
      const lunchTotal = this.dailyMenu.lunch?.reduce((sum, item) => sum + (item.price || 0), 0) || 0
      return {
        breakfast: breakfastTotal,
        lunch: lunchTotal
      }
    }
  },
  async created() {
    await this.loadData()
    await this.loadAllergies()
  },
  methods: {
    async loadData() {
      try {
        const [daily, weekly] = await Promise.all([
          api.getTodayMenu(),
          api.getWeeklyMenu()
        ])
        
        this.dailyMenu = daily || { breakfast: [], lunch: [] }
        this.weeklyMenu = weekly || []
      } catch (error) {
        console.error('Ошибка загрузки меню:', error)
      }
    },
    
    async loadAllergies() {
      try {
        this.userAllergies = await api.getAllergies() || []
      } catch (error) {
        console.error('Ошибка загрузки аллергий:', error)
        this.userAllergies = []
      }
    },
    
    formatDay(date) {
      if (!date) return ''
      const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
      const d = new Date(date)
      d.setFullYear(2026)
      return `${days[d.getDay()]}, ${d.toLocaleDateString('ru-RU')}`
    },
    
    hasAllergy(item) {
      if (!item?.allergens || !this.userAllergies?.length) return false
      const itemAllergens = item.allergens.split(',').map(a => a.trim())
      return itemAllergens.some(allergen => this.userAllergies.includes(allergen))
    },
    
    getAllergens(item) {
      if (!item?.allergens) return ''
      const itemAllergens = item.allergens.split(',').map(a => a.trim())
      return itemAllergens
        .filter(allergen => this.userAllergies.includes(allergen))
        .join(', ')
    }
  }
}
</script>

<style scoped>
.menu-page {
  padding: 2rem;
  background: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.menu-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 1rem 2rem;
  background: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.daily-menu {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.menu-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1rem;
}

.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

.total-price {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-top: 0.5rem;
}

.daily-meals {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.meals-section h2 {
  margin-bottom: 1.5rem;
  color: #444;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meal-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: transform 0.3s;
}

.meal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.price-tag {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-weight: 600;
}

.meal-nutrition {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
  font-size: 0.875rem;
  color: #666;
}

.allergy-warning {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 5px;
  color: #856404;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.weekly-menu {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.day-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

.day-card h3 {
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
  color: #333;
}

.day-meals {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.meal-block h4 {
  margin-bottom: 1rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meal-item {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.meal-item:last-child {
  border-bottom: none;
}

.meal-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.meal-name {
  font-weight: 600;
  color: #333;
}

.meal-price {
  font-weight: bold;
  color: #667eea;
}

.meal-description {
  color: #666;
  font-size: 0.875rem;
}

.no-menu, .no-items {
  text-align: center;
  padding: 2rem;
  color: #999;
  background: #f8f9fa;
  border-radius: 10px;
}

.no-menu i, .no-items i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .daily-meals,
  .day-meals,
  .menu-summary {
    grid-template-columns: 1fr;
  }
  
  .menu-tabs {
    flex-direction: column;
  }
}
</style>