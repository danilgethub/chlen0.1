import { Client, GatewayIntentBits, Partials } from 'discord.js';
import dotenv from 'dotenv';
import express from 'express';
import { connectDatabase } from './database.js';
import { registerCommands } from './commands/index.js';
import { setupEventHandlers } from './events/index.js';
import { getUserManager } from './services/userManager.js';
import { setupContext7Service } from './services/context7Service.js';

// Загружаем переменные окружения
dotenv.config();

// Создаем клиент Discord с необходимыми правами
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User]
});

// Получаем токен из переменных окружения
const token = process.env.DISCORD_BOT_TOKEN;

// Проверяем наличие токена
if (!token) {
  console.error('Ошибка: DISCORD_BOT_TOKEN не найден в файле .env!');
  process.exit(1);
}

// Настраиваем Express сервер для API
const app = express();
app.use(express.json());
const PORT = process.env.BOT_API_PORT || 3001;

// Подключаемся к базе данных, если необходимо (закомментировано для простоты)
// await connectDatabase();

// Инициализируем Context7 сервис
const context7Service = setupContext7Service();

// Настраиваем обработчики событий
const { userManager } = setupEventHandlers(client);

// Настраиваем API-эндпоинт для получения документации через Context7
app.get('/api/docs/:library/:topic', async (req, res) => {
  try {
    const { library, topic } = req.params;
    
    if (!library || !topic) {
      return res.status(400).json({ 
        success: false, 
        message: 'Необходимо указать library и topic' 
      });
    }
    
    try {
      const docs = await context7Service.getDocs(library, topic);
      return res.status(200).json({ 
        success: true, 
        data: docs 
      });
    } catch (error) {
      console.error(`Ошибка при получении документации ${library}/${topic}:`, error);
      return res.status(500).json({ 
        success: false, 
        message: `Ошибка при получении документации: ${error.message}` 
      });
    }
  } catch (error) {
    console.error('Ошибка обработки запроса:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// Настраиваем API-эндпоинт для отправки сообщений пользователям
app.post('/api/send-message', async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ success: false, message: 'Отсутствуют userId или сообщение' });
    }

    // Получаем пользователя и отправляем сообщение
    try {
      const user = await client.users.fetch(userId);
      await user.send(message);
      console.log(`Сообщение отправлено пользователю ${userId}: ${message}`);
      return res.status(200).json({ success: true, message: 'Сообщение успешно отправлено' });
    } catch (error) {
      console.error(`Ошибка при отправке сообщения пользователю ${userId}:`, error);
      return res.status(500).json({ success: false, message: 'Ошибка при отправке сообщения' });
    }
  } catch (error) {
    console.error('Ошибка обработки запроса:', error);
    return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
});

// Эндпоинт для отправки массовой рассылки
app.post('/api/broadcast', async (req, res) => {
  try {
    const { message, filter } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Отсутствует сообщение для рассылки' });
    }

    // Используем менеджер пользователей для рассылки
    try {
      const result = await userManager.broadcastMessage(message, filter || {});
      return res.status(200).json({ 
        success: true, 
        message: `Рассылка выполнена: успешно - ${result.successCount}, не удалось - ${result.failCount}` 
      });
    } catch (error) {
      console.error('Ошибка массовой рассылки:', error);
      return res.status(500).json({ success: false, message: 'Ошибка при выполнении рассылки' });
    }
  } catch (error) {
    console.error('Ошибка обработки запроса:', error);
    return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
});

// Эндпоинт для уведомления о входе на сайт
app.post('/api/user-login', async (req, res) => {
  try {
    const { userId, username } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Отсутствует userId' });
    }

    // Отправляем приветственное сообщение пользователю
    try {
      const user = await client.users.fetch(userId);
      await user.send(
        `👋 Привет, ${username || 'игрок'}! Ты успешно авторизовался на сайте MineStory!\n\n` +
        `🎮 Спасибо за интерес к нашему серверу. Ты теперь можешь получать уведомления и спецпредложения.\n\n` +
        `💰 Используй рулетку на нашем сайте, чтобы выиграть монеты!`
      );
      console.log(`Приветственное сообщение отправлено пользователю ${userId}`);
      return res.status(200).json({ success: true, message: 'Приветственное сообщение отправлено' });
    } catch (error) {
      console.error(`Ошибка при отправке приветственного сообщения пользователю ${userId}:`, error);
      return res.status(500).json({ success: false, message: 'Ошибка при отправке сообщения' });
    }
  } catch (error) {
    console.error('Ошибка обработки запроса:', error);
    return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
});

// Запуск Express сервера
app.listen(PORT, () => {
  console.log(`API сервер запущен на порту ${PORT}`);
});

// Логинимся в Discord
client.login(token)
  .then(() => {
    console.log('Бот успешно авторизован в Discord');
    
    // Регистрируем команды после успешного входа
    client.on('ready', async () => {
      await registerCommands(client);
    });
  })
  .catch(error => {
    console.error('Ошибка авторизации бота:', error);
    process.exit(1);
  }); 