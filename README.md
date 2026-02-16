# Школьная столовая - Автоматизированная система питания

## Краткое описание проекта

Веб-приложение для автоматизации школьной столовой с тремя уровнями доступа:

- **Ученик**: просмотр меню, заказ питания, оплата, отзывы
- **Повар**: подтверждение заказов, контроль остатков, заявки на закупку
- **Администратор**: статистика, управление заявками, отчеты, модерация

**Технологии**: Vue 3, Node.js, Express, SQLite, JWT

---

## Инструкция по установке и развертыванию

### Системные требования
- Node.js 16.0 или выше
- npm 8.0 или выше
- Любой современный браузер

### Быстрая установка (Windows)

1. **Скачайте проект**
   ```bash
   git clone https://github.com/Danilvilk/school-cafe
   cd school-cafe

2. **Запустите установку**
   install.bat

3. **Запустите проект**
   start.bat

4. **Откройте браузер**
   http://localhost:5173

### Ручная установка

## 1. Установка зависимостей

 **Бэкенд** <br>
   cd backend<br>
   npm install<br>

 **Фронтенд** <br>
   cd ../frontend<br>
   npm install<br>
   npm install chart.js@4.4.0 --save<br>

## 2. Запуск серверов

**Терминал 1 (бэкенд)** <br>
    cd backend <br>
    node server.js <br>

**Терминал 2 (фронтенд)** <br>
    cd frontend <br>
    npm run serve <br>

### Тестовые учетные записи

Роль	Email	Пароль<br>
Ученик	student@school.ru	password123<br>
Повар	cook@school.ru	password123<br>
Администратор	admin@school.ru	password123<br>

### Ссылка на видеоролик

https://rutube.ru/video/private/bd8034d3b96ddf8f68c7dc78d97ba1df/?p=dwgPQx0mLbNYW9Y0sgQgMg
