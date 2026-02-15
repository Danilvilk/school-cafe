<template>
  <div id="app">
    <!-- Навигация только для авторизованных пользователей -->
    <nav v-if="isAuthenticated" class="navbar">
      <div class="nav-container">
        <div class="nav-logo">
          <i class="fas fa-utensils"></i>
          Школьная столовая
        </div>
        <div class="nav-menu">
          <router-link to="/menu" class="nav-link" v-if="user.role === 'student'">
            <i class="fas fa-book-open"></i> Меню
          </router-link>
          <span class="user-info">
            <i class="fas fa-user"></i> {{ userName }} ({{ userRole }})
          </span>
          <button @click="logout" class="btn-logout">
            <i class="fas fa-sign-out-alt"></i> Выйти
          </button>
        </div>
      </div>
    </nav>
    
    <!-- Основной контент -->
    <router-view @auth-changed="checkAuth" />
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isAuthenticated: false,
      user: {
        name: '',
        role: '',
        class: ''
      }
    }
  },
  computed: {
    userName() {
      return this.user.name || 'Пользователь';
    },
    userRole() {
      const roles = {
        'student': 'Ученик',
        'cook': 'Повар',
        'admin': 'Администратор'
      };
      return roles[this.user.role] || this.user.role;
    }
  },
  created() {
    console.log('App created');
    this.checkAuth();
  },
  mounted() {
    console.log('App mounted');
  },
  methods: {
    checkAuth() {
      console.log('Checking auth...');
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        console.log('Token exists:', !!token);
        console.log('User exists:', !!userStr);
        
        if (token && userStr) {
          this.user = JSON.parse(userStr);
          this.isAuthenticated = true;
          console.log('User authenticated:', this.user);
        } else {
          this.isAuthenticated = false;
          this.user = { name: '', role: '', class: '' };
          console.log('User not authenticated');
        }
      } catch (e) {
        console.error('Error in checkAuth:', e);
        this.isAuthenticated = false;
        this.user = { name: '', role: '', class: '' };
      }
    },
    
    logout() {
      console.log('Logging out...');
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.isAuthenticated = false;
        this.user = { name: '', role: '', class: '' };
        
        if (this.$router) {
          this.$router.push('/login');
        } else {
          window.location.href = '/login';
        }
      } catch (e) {
        console.error('Error in logout:', e);
        window.location.href = '/login';
      }
    }
  },
  watch: {
    '$route'() {
      this.checkAuth();
    }
  }
}
</script>

<style>
/* Глобальные стили */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

/* Навигация */
.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.nav-logo i {
  margin-right: 0.5rem;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: #666;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: all 0.3s;
}

.nav-link:hover {
  background: #f0f3ff;
  color: #667eea;
}

.user-info {
  color: #666;
  font-weight: 500;
}

.btn-logout {
  padding: 0.5rem 1rem;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 0.9rem;
}

.btn-logout:hover {
  background: #ff6b81;
}

/* Контейнер */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Кнопки */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: #4CAF50;
  color: white;
}

.btn-danger {
  background: #ff4757;
  color: white;
}

/* Формы */
.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
}

/* Карточки */
.card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

/* Утилиты */
.text-center {
  text-align: center;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 2rem;
}

.mb-4 {
  margin-bottom: 2rem;
}

/* Адаптивность */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-menu {
    flex-direction: column;
    width: 100%;
  }
  
  .btn-logout {
    width: 100%;
  }
}
</style>