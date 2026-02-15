<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <i class="fas fa-school fa-3x"></i>
        <h2>Вход в систему</h2>
        <p>Автоматизированная система школьного питания</p>
      </div>
      
      <div v-if="error" class="error-message">
        <i class="fas fa-exclamation-circle"></i> {{ error }}
      </div>
      
      <div v-if="success" class="success-message">
        <i class="fas fa-check-circle"></i> {{ success }}
      </div>
      
      <!-- Форма входа -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">
            <i class="fas fa-envelope"></i> Email
          </label>
          <input 
            type="email" 
            id="email" 
            v-model="form.email" 
            required
            placeholder="Введите email"
          >
        </div>
        
        <div class="form-group">
          <label for="password">
            <i class="fas fa-lock"></i> Пароль
          </label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            required
            placeholder="Введите пароль"
          >
        </div>
        
        <div class="form-group">
          <label for="role">
            <i class="fas fa-user-tag"></i> Роль
          </label>
          <select id="role" v-model="form.role" required>
            <option value="">Выберите роль</option>
            <option value="student">Ученик</option>
            <option value="cook">Повар</option>
            <option value="admin">Администратор</option>
          </select>
        </div>
        
        <button type="submit" class="btn-login" :disabled="loading">
          <i class="fas fa-sign-in-alt"></i>
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>
      </form>
      
      <div class="login-divider">
        <span>или</span>
      </div>
      
      <!-- Кнопка регистрации -->
      <button @click="showRegister = true" class="btn-register">
        <i class="fas fa-user-plus"></i> Зарегистрироваться
      </button>
    </div>
    
    <!-- Модальное окно регистрации -->
    <div v-if="showRegister" class="modal">
      <div class="modal-content">
        <span class="close" @click="showRegister = false">&times;</span>
        <div class="modal-header">
          <i class="fas fa-user-plus fa-2x"></i>
          <h3>Регистрация</h3>
          <p class="modal-description">Заполните форму для отправки заявки на регистрацию</p>
        </div>
        
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="reg-name">
              <i class="fas fa-user"></i> ФИО
            </label>
            <input 
              type="text" 
              id="reg-name" 
              v-model="registerForm.name" 
              required
              placeholder="Иванов Иван Иванович"
            >
          </div>
          
          <div class="form-group">
            <label for="reg-email">
              <i class="fas fa-envelope"></i> Email
            </label>
            <input 
              type="email" 
              id="reg-email" 
              v-model="registerForm.email" 
              required
              placeholder="ivanov@school.ru"
            >
          </div>
          
          <div class="form-group">
            <label for="reg-role">
              <i class="fas fa-user-tag"></i> Роль
            </label>
            <select id="reg-role" v-model="registerForm.role" required>
              <option value="">Выберите роль</option>
              <option value="student">Ученик</option>
              <option value="cook">Повар</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          
          <div class="form-group" v-if="registerForm.role === 'student'">
            <label for="reg-class">
              <i class="fas fa-graduation-cap"></i> Класс
            </label>
            <input 
              type="text" 
              id="reg-class" 
              v-model="registerForm.class" 
              required
              placeholder="10А"
            >
          </div>
          
          <div class="form-group">
            <label for="reg-password">
              <i class="fas fa-lock"></i> Пароль
            </label>
            <input 
              type="password" 
              id="reg-password" 
              v-model="registerForm.password" 
              required
              placeholder="Минимум 6 символов"
              minlength="6"
            >
          </div>
          
          <div class="form-group">
            <label for="reg-password-confirm">
              <i class="fas fa-lock"></i> Подтверждение пароля
            </label>
            <input 
              type="password" 
              id="reg-password-confirm" 
              v-model="registerForm.passwordConfirm" 
              required
              placeholder="Повторите пароль"
              minlength="6"
            >
          </div>
          
          <div class="form-info">
            <i class="fas fa-info-circle"></i>
            После отправки заявки администратор рассмотрит её и одобрит регистрацию
          </div>
          
          <div class="modal-actions">
            <button type="submit" class="btn-submit" :disabled="registerLoading">
              <i class="fas fa-paper-plane"></i>
              {{ registerLoading ? 'Отправка...' : 'Отправить заявку' }}
            </button>
            <button type="button" @click="showRegister = false" class="btn-cancel">
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
  name: 'Login',
  data() {
    return {
      form: {
        email: '',
        password: '',
        role: ''
      },
      registerForm: {
        name: '',
        email: '',
        role: '',
        class: '',
        password: '',
        passwordConfirm: ''
      },
      loading: false,
      registerLoading: false,
      showRegister: false,
      error: '',
      success: ''
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = '';
      this.success = '';
      
      try {
        console.log('Attempting login...', this.form);
        
        const response = await api.login(this.form.email, this.form.password, this.form.role);
        
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Перенаправление в зависимости от роли
          switch(response.user.role) {
            case 'student':
              this.$router.push('/student');
              break;
            case 'cook':
              this.$router.push('/cook');
              break;
            case 'admin':
              this.$router.push('/admin');
              break;
            default:
              this.$router.push('/login');
          }
        }
      } catch (error) {
        console.error('Login error:', error);
        this.error = error.response?.data?.error || 'Ошибка входа. Проверьте данные.';
      } finally {
        this.loading = false;
      }
    },
    
    async handleRegister() {
      // Валидация
      if (!this.registerForm.name || !this.registerForm.email || !this.registerForm.role || !this.registerForm.password) {
        this.error = 'Заполните все поля';
        return;
      }
      
      if (this.registerForm.password.length < 6) {
        this.error = 'Пароль должен быть не менее 6 символов';
        return;
      }
      
      if (this.registerForm.password !== this.registerForm.passwordConfirm) {
        this.error = 'Пароли не совпадают';
        return;
      }
      
      if (this.registerForm.role === 'student' && !this.registerForm.class) {
        this.error = 'Укажите класс';
        return;
      }
      
      this.registerLoading = true;
      this.error = '';
      this.success = '';
      
      try {
        const userData = {
          name: this.registerForm.name,
          email: this.registerForm.email,
          role: this.registerForm.role,
          password: this.registerForm.password
        };
        
        if (this.registerForm.role === 'student') {
          userData.class = this.registerForm.class;
        }
        
        const response = await api.register(userData);
        
        this.success = response.message || 'Заявка на регистрацию отправлена! Ожидайте подтверждения администратора.';
        this.showRegister = false;
        
        // Очищаем форму
        this.registerForm = {
          name: '',
          email: '',
          role: '',
          class: '',
          password: '',
          passwordConfirm: ''
        };
        
        // Показываем успех на главной форме
        setTimeout(() => {
          this.success = '';
        }, 5000);
        
      } catch (error) {
        console.error('Register error:', error);
        this.error = error.response?.data?.error || 'Ошибка регистрации. Попробуйте позже.';
      } finally {
        this.registerLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  padding: 2.5rem;
  width: 100%;
  max-width: 500px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header i {
  color: #667eea;
  margin-bottom: 1rem;
}

.login-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
}

.login-header p {
  color: #666;
  font-size: 0.95rem;
}

.error-message {
  background: #ff4757;
  color: white;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  animation: shake 0.5s ease;
}

.success-message {
  background: #2ed573;
  color: white;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  animation: fadeIn 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-group label i {
  margin-right: 0.5rem;
  color: #667eea;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s;
  background: #f8f9fa;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
}

.btn-login {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102,126,234,0.3);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.login-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e0e0e0;
  z-index: 1;
}

.login-divider span {
  position: relative;
  background: white;
  padding: 0 1rem;
  color: #999;
  font-size: 0.9rem;
  z-index: 2;
}

.btn-register {
  width: 100%;
  padding: 1rem;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-register:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102,126,234,0.2);
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
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
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

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
}

.modal-header i {
  color: #667eea;
  margin-bottom: 0.5rem;
}

.modal-header h3 {
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.modal-description {
  color: #666;
  font-size: 0.9rem;
}

.register-form {
  margin-top: 1rem;
}

.form-info {
  background: #e3f2fd;
  color: #1976d2;
  padding: 1rem;
  border-radius: 10px;
  margin: 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.form-info i {
  font-size: 1.2rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-submit {
  flex: 1;
  padding: 0.75rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.btn-submit:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76,175,80,0.3);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-cancel {
  flex: 1;
  padding: 0.75rem;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 10px;
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
  box-shadow: 0 5px 15px rgba(255,71,87,0.3);
}

@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-card {
    padding: 1.5rem;
  }
  
  .modal-content {
    padding: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>