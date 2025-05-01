// Конфигурационный файл для Discord бота
import dotenv from 'dotenv';
dotenv.config();

export default {
  // Токен Discord бота
  botToken: process.env.BOT_TOKEN || 'MTM2NzEzMjIzNDcxNjU0NTAzNA.Gv3dNW.Ff63Knbjxoo7CGENe3RXkR0E3NQWen0n2TzK3I',
  
  // Порт для API
  port: process.env.PORT || 3001,
  
  // URL сайта
  websiteUrl: process.env.WEBSITE_URL || 'http://localhost:3000',
  
  // Информация для сообщений
  welcomeMessage: process.env.WELCOME_MESSAGE || 'Привет! Спасибо за авторизацию на сайте MineStory. Рады видеть тебя на нашем сервере!',
  serverIp: process.env.SERVER_IP || 'minestoryvanilla.imba.land'
}; 