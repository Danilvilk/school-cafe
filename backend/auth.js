import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from './db.js';

const JWT_SECRET = 'school-cafe-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

export async function login(email, password, role) {
  try {
    const user = await db.getUserByEmail(email);
    
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    if (user.role !== role) {
      throw new Error('Неверная роль пользователя');
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Неверный пароль');
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        class: user.class,
        balance: user.balance
      }
    };
  } catch (error) {
    console.error('Ошибка входа:', error);
    throw error;
  }
}

export async function register(userData) {
  try {
    const { name, email, role, class: studentClass, password } = userData;
    
    console.log('Регистрация нового пользователя:', { name, email, role, class: studentClass });
    
    // Проверяем, существует ли уже пользователь
    const existing = await db.getUserByEmail(email);
    if (existing) {
      throw new Error('Пользователь с таким email уже существует');
    }
    
    // Проверяем, есть ли уже заявка
    const existingRequest = await db.getPendingRegistrationRequest(email);
    
    if (existingRequest) {
      throw new Error('Заявка на регистрацию уже отправлена и ожидает рассмотрения');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Создаем заявку на регистрацию
    const result = await db.createRegistrationRequest({
      name,
      email,
      password: hashedPassword,
      role,
      class: studentClass
    });
    
    console.log('✅ Заявка на регистрацию создана, ID:', result.id);
    
    return { 
      id: result.id, 
      name, 
      email, 
      role,
      class: studentClass,
      status: 'pending',
      message: '✅ Заявка на регистрацию отправлена! Администратор рассмотрит её в ближайшее время.' 
    };
  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    throw error;
  }
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export default {
  login,
  register,
  verifyToken
};