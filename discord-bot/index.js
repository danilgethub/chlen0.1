// Основной файл Discord бота
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import express from 'express';
import config from './config.js';

// Создаем экземпляр Discord клиента
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ]
});

// Инициализируем Express сервер для API
const app = express();
app.use(express.json());

// Обработка события готовности бота
client.once('ready', () => {
  console.log(`Discord бот ${client.user.tag} запущен и готов к работе!`);
});

// API эндпоинт для отправки сообщений пользователям
app.post('/api/send-message', async (req, res) => {
  try {
    const { userId, username } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Отсутствует Discord ID пользователя' });
    }
    
    const success = await sendWelcomeMessage(userId, username);
    
    if (success) {
      res.status(200).json({ success: true, message: 'Сообщение успешно отправлено' });
    } else {
      res.status(500).json({ success: false, message: 'Не удалось отправить сообщение' });
    }
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Отправка приветственного сообщения пользователю
async function sendWelcomeMessage(userId, username = 'Игрок') {
  try {
    // Находим пользователя
    const user = await client.users.fetch(userId);
    
    if (!user) {
      console.error(`Пользователь с ID ${userId} не найден`);
      return false;
    }
    
    // Создаем красивый embed для сообщения
    const welcomeEmbed = new EmbedBuilder()
      .setColor(0x3d5afe) // Синий цвет
      .setTitle('🎮 Добро пожаловать на MineStory!')
      .setDescription(`${config.welcomeMessage}`)
      .addFields(
        { name: '📡 IP Сервера', value: `\`${config.serverIp}\``, inline: true },
        { name: '👥 Discord', value: '[Присоединиться](https://discord.gg/j82GyGBHT7)', inline: true },
        { name: '💰 Поддержка', value: `[Донат](${config.websiteUrl}#donate)`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'MineStory - Ванильный Minecraft Сервер' });
    
    // Отправляем сообщение пользователю
    await user.send({ embeds: [welcomeEmbed] });
    
    console.log(`Отправлено приветственное сообщение пользователю ${username} (${userId})`);
    return true;
  } catch (error) {
    console.error(`Ошибка при отправке сообщения пользователю ${userId}:`, error);
    return false;
  }
}

// Запускаем API сервер
app.listen(config.port, () => {
  console.log(`API сервер запущен на порту ${config.port}`);
});

// Логин бота в Discord
client.login(config.botToken)
  .then(() => {
    console.log('Бот успешно авторизован в Discord');
  })
  .catch(error => {
    console.error('Ошибка при авторизации бота:', error);
  });

// Обработка ошибок и закрытие приложения
process.on('uncaughtException', error => {
  console.error('Необработанное исключение:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Необработанный reject:', reason);
});

// Экспортируем функцию для использования в других модулях
export { sendWelcomeMessage }; 