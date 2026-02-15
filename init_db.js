import { initialize } from './backend/db.js';

console.log('========================================');
console.log('  ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ');
console.log('========================================');
console.log();

console.log('Создание базы данных...');
initialize()
  .then(() => {
    console.log();
    console.log('✅ База данных успешно инициализирована!');
    console.log('✅ Созданы все таблицы и тестовые данные');
    console.log('========================================');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Ошибка инициализации базы данных:', err);
    console.log('========================================');
    process.exit(1);
  });