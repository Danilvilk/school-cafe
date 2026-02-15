# 🍽️ Автоматизированная информационная система школьного питания

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org)
[![Vue.js](https://img.shields.io/badge/vue-3.x-42b883)](https://vuejs.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Веб-приложение для учёта и контроля питания в школьной столовой с тремя уровнями доступа: ученик, повар, администратор.

## 📁 Структура проекта<br>

school-cafe/<br>
├── backend/ # Серверная часть<br>
│ ├── server.js # Главный файл сервера<br>
│ ├── db.js # Работа с базой данных<br>
│ ├── auth.js # Аутентификация<br>
│ └── package.json # Зависимости бэкенда<br>
├── frontend/ # Клиентская часть<br>
│ ├── index.html # Главная HTML страница<br>
│ ├── src/ # Исходный код<br>
│ │ ├── main.js # Точка входа<br>
│ │ ├── App.vue # Корневой компонент<br>
│ │ ├── router.js # Маршрутизация<br>
│ │ ├── api.js # API клиент<br>
│ │ └── views/ # Компоненты страниц<br>
│ │ ├── Login.vue<br>
│ │ ├── StudentDashboard.vue<br>
│ │ ├── CookDashboard.vue <br>
│ │ ├── AdminDashboard.vue <br>
│ │ ├── RegistrationRequests.vue <br>
│ │ └── Menu.vue <br>
│ ├── package.json # Зависимости фронтенда <br>
│ └── vite.config.js # Конфигурация Vite <br>
├── database.db # Файл базы данных <br>
├── .gitignore # Игнорируемые файлы Git <br>
├── README.md # Документация <br>
└── *.bat # Скрипты запуска <br>


 💻 Требования к системе<br>

- Node.js версии 16.0.0 или выше<br>
- npm версии 8.0.0 или выше<br>
- Операционная система: Windows, macOS или Linux<br>
- Браузер: Chrome, Firefox, Edge или Safari (последние версии)<br>

 🚀 Установка и запуск<br>

 Быстрый старт (рекомендуется)<br>

1. Скачайте или клонируйте репозиторий<br>
   ```bash<br>
   git clone https://github.com/Danilvilk/school-cafe<br>
   cd school-cafe <br>
2. Запустите установку<br>

Просто дважды кликните на файл install.bat <br>
3. Запустите проект<br>

Дважды кликните на файл start.bat <br>
4. Откройте браузер<br>

Перейдите по адресу: http://localhost:5173  <br>



Доступные скрипты<br>

Файл		Назначение<br>
<br>
install.bat	Полная установка проекта<br>
start.bat	Запуск серверов<br>
stop.bat	Остановка серверов      <br>
clean.bat	Очистка проекта<br>
reset-db.bat	Сброс базы данных<br>
check.bat	Проверка установки<br>

🔑 Тестовые учетные записи<br>
<br>
Роль	            Email	             Пароль<br>
👨‍🎓 Ученик	      student@school.ru	 password123<br>
👨‍🍳 Повар 	      cook@school.ru	    password123<br>
👨‍💼 Администратор	admin@school.ru	 password123



