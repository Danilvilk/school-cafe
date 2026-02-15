<template>
  <div class="registration-requests">
    <h2><i class="fas fa-user-plus"></i> Заявки на регистрацию</h2>
    
    <div class="requests-tabs">
      <button 
        :class="['tab-btn', { active: activeTab === 'pending' }]"
        @click="activeTab = 'pending'"
      >
        Ожидают ({{ pendingCount }})
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'all' }]"
        @click="activeTab = 'all'"
      >
        Все заявки
      </button>
    </div>
    
    <div class="requests-list">
      <div v-for="request in filteredRequests" :key="request.id" class="request-card">
        <div class="request-header">
          <div class="user-info">
            <i class="fas fa-user-circle fa-2x"></i>
            <div>
              <h4>{{ request.name }}</h4>
              <p class="user-email">{{ request.email }}</p>
              <p class="user-role">
                <span :class="'role-badge role-' + request.role">
                  {{ getRoleName(request.role) }}
                </span>
              </p>
              <p class="user-class" v-if="request.class">Класс: {{ request.class }}</p>
            </div>
          </div>
          <span :class="'status-badge status-' + request.status">
            {{ getStatusText(request.status) }}
          </span>
        </div>
        
        <div class="request-meta">
          <span class="request-date">
            <i class="fas fa-clock"></i>
            Создана: {{ formatDate(request.created_at) }}
          </span>
          <span v-if="request.approved_at" class="request-approved">
            <i class="fas fa-check-circle"></i>
            Одобрена: {{ formatDate(request.approved_at) }}
          </span>
        </div>
        
        <div class="request-actions" v-if="request.status === 'pending'">
          <button @click="approveRequest(request.id)" class="btn-approve">
            <i class="fas fa-check"></i> Одобрить
          </button>
          <button @click="rejectRequest(request.id)" class="btn-reject">
            <i class="fas fa-times"></i> Отклонить
          </button>
        </div>
      </div>
      
      <div v-if="filteredRequests.length === 0" class="no-requests">
        <i class="fas fa-inbox"></i>
        <p>Нет заявок</p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api'

export default {
  name: 'RegistrationRequests',
  data() {
    return {
      activeTab: 'pending',
      pendingRequests: [],
      allRequests: []
    }
  },
  computed: {
    pendingCount() {
      return this.pendingRequests.length
    },
    filteredRequests() {
      return this.activeTab === 'pending' ? this.pendingRequests : this.allRequests
    }
  },
  async created() {
    await this.loadRequests()
  },
  methods: {
    async loadRequests() {
      try {
        const [pending, all] = await Promise.all([
          api.getRegistrationRequests(),
          api.getAllRegistrationRequests()
        ])
        this.pendingRequests = pending || []
        this.allRequests = all || []
      } catch (error) {
        console.error('Ошибка загрузки заявок:', error)
      }
    },
    
    async approveRequest(id) {
      if (!confirm('Вы уверены, что хотите одобрить эту заявку?')) return
      
      try {
        await api.approveRegistrationRequest(id)
        await this.loadRequests()
        this.$emit('success', 'Заявка одобрена, пользователь создан')
      } catch (error) {
        this.$emit('error', error.message || 'Ошибка при одобрении заявки')
      }
    },
    
    async rejectRequest(id) {
      if (!confirm('Вы уверены, что хотите отклонить эту заявку?')) return
      
      try {
        await api.rejectRegistrationRequest(id)
        await this.loadRequests()
        this.$emit('success', 'Заявка отклонена')
      } catch (error) {
        this.$emit('error', error.message || 'Ошибка при отклонении заявки')
      }
    },
    
    getRoleName(role) {
      const roles = {
        'student': 'Ученик',
        'cook': 'Повар',
        'admin': 'Администратор'
      }
      return roles[role] || role
    },
    
    getStatusText(status) {
      const statuses = {
        'pending': 'Ожидает',
        'approved': 'Одобрено',
        'rejected': 'Отклонено'
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.registration-requests {
  padding: 1rem;
}

.requests-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.95rem;
}

.tab-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 500px;
  overflow-y: auto;
}

.request-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  transition: transform 0.3s;
  border-left: 4px solid #667eea;
}

.request-card:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info i {
  color: #667eea;
}

.user-email {
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

.role-student {
  background: #4CAF50;
  color: white;
}

.role-cook {
  background: #ffa502;
  color: white;
}

.role-admin {
  background: #ff4757;
  color: white;
}

.user-class {
  font-weight: 600;
  color: #333;
  margin-top: 0.25rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
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

.request-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #999;
  font-size: 0.875rem;
}

.request-meta i {
  margin-right: 0.25rem;
}

.request-approved {
  color: #2ed573;
}

.request-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.btn-approve {
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
}

.btn-approve:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.btn-reject {
  padding: 0.75rem 1.5rem;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-reject:hover {
  background: #ff6b81;
  transform: translateY(-2px);
}

.no-requests {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.no-requests i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .request-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .request-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .request-actions {
    flex-direction: column;
  }
}
</style>