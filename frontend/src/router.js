import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import StudentDashboard from './views/StudentDashboard.vue'
import CookDashboard from './views/CookDashboard.vue'
import AdminDashboard from './views/AdminDashboard.vue'
import Menu from './views/Menu.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/student',
    name: 'StudentDashboard',
    component: StudentDashboard,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/cook',
    name: 'CookDashboard',
    component: CookDashboard,
    meta: { requiresAuth: true, role: 'cook' }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/menu',
    name: 'Menu',
    component: Menu,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  let user = {}
  
  try {
    user = userStr ? JSON.parse(userStr) : {}
  } catch (e) {
    console.error('Ошибка парсинга пользователя:', e)
  }

  console.log('Router guard:', { to: to.path, token: !!token, user })

  // Если пользователь пытается зайти на страницу логина
  if (to.path === '/login') {
    // Если уже авторизован, перенаправляем на соответствующую страницу
    if (token && user.role) {
      switch(user.role) {
        case 'student':
          next('/student')
          break
        case 'cook':
          next('/cook')
          break
        case 'admin':
          next('/admin')
          break
        default:
          next()
      }
    } else {
      // Если не авторизован, показываем логин
      next()
    }
    return
  }

  // Для защищенных маршрутов
  if (to.meta.requiresAuth) {
    if (!token) {
      // Не авторизован - на логин
      next('/login')
    } else if (to.meta.role && to.meta.role !== user.role) {
      // Неправильная роль - на соответствующую страницу
      switch(user.role) {
        case 'student':
          next('/student')
          break
        case 'cook':
          next('/cook')
          break
        case 'admin':
          next('/admin')
          break
        default:
          next('/login')
      }
    } else {
      // Все хорошо - пропускаем
      next()
    }
  } else {
    next()
  }
})

export default router