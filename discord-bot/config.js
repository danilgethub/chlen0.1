// Конфигурационный файл для Discord бота
import dotenv from 'dotenv';
dotenv.config();

// Проверка наличия токена
if (!process.env.BOT_TOKEN) {
  console.error('ОШИБКА: BOT_TOKEN не указан в файле .env!');
  console.error('Создайте файл .env и добавьте строку: BOT_TOKEN=ваш_токен_бота');
  process.exit(1);
}

export default {
  // Токен Discord бота (должен быть в .env файле)
  botToken: process.env.BOT_TOKEN,
  
  // Порт для API
  port: process.env.PORT || 3001,
  
  // URL сайта
  websiteUrl: process.env.WEBSITE_URL || 'http://localhost:3000',
  
  // Информация для сообщений
  welcomeMessage: process.env.WELCOME_MESSAGE || 'Привет! Спасибо за авторизацию на сайте MineStory. Рады видеть тебя на нашем сервере!',
  serverIp: process.env.SERVER_IP || 'minestoryvanilla.imba.land'
}; 
