import { Events } from 'discord.js';
import { handleCommand } from '../commands/index.js';
import { setupUserManager } from '../services/userManager.js';

// Настройка обработчиков событий Discord
export function setupEventHandlers(client) {
  // Инициализируем менеджер пользователей
  const userManager = setupUserManager(client);

  // Событие запуска бота
  client.once(Events.ClientReady, async () => {
    console.log(`Бот ${client.user.tag} успешно запущен и готов к работе!`);
    
    // Обновляем статус бота
    client.user.setPresence({
      activities: [{ name: 'MineStory Server', type: 3 }], // type 3 = "Watching"
      status: 'online',
    });
    
    // Регистрируем slash-команды (если необходимо)
    // await registerCommands(client);
  });

  // Обработка взаимодействий (slash-команд)
  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      // Передаем взаимодействие в обработчик команд
      await handleCommand(interaction, client);
    } catch (error) {
      console.error('Ошибка при обработке взаимодействия:', error);
      
      // Отправляем сообщение об ошибке, если еще не был отправлен ответ
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'Произошла ошибка при выполнении команды.',
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: 'Произошла ошибка при выполнении команды.',
          ephemeral: true
        });
      }
    }
  });

  // Обработка входящих личных сообщений
  client.on(Events.MessageCreate, async (message) => {
    // Игнорируем сообщения от ботов
    if (message.author.bot) return;
    
    // Обрабатываем только личные сообщения
    if (!message.guild) {
      console.log(`Получено личное сообщение от ${message.author.tag}: ${message.content}`);
      
      // Команда !help
      if (message.content.toLowerCase() === '!help') {
        await message.reply(
          '**Доступные команды:**\n' +
          '!help - Показать список команд\n' +
          '!info - Информация о сервере\n' +
          '!balance - Проверить баланс монет (скоро)'
        );
      }
      
      // Команда !info
      else if (message.content.toLowerCase() === '!info') {
        await message.reply(
          '**О сервере MineStory:**\n' +
          '🔹 IP: minestoryvanilla.imba.land\n' +
          '🔹 Версия: 1.21+\n' +
          '🔹 Плагины: ViaVersion, Plasmovoice\n' +
          '🔹 Подробнее на сайте: https://minestory-website.onrender.com'
        );
      }
      
      // Команда !balance
      else if (message.content.toLowerCase() === '!balance') {
        await message.reply(
          'У вас на балансе 0 монет. Посетите наш сайт и крутите рулетку, чтобы выиграть монеты!'
        );
      }
      
      // Неизвестная команда
      else if (message.content.startsWith('!')) {
        await message.reply(
          'Неизвестная команда. Напишите !help для списка доступных команд.'
        );
      }
      
      // Обычное сообщение
      else {
        await message.reply(
          'Привет! Я бот MineStory. Напиши !help для получения списка команд.'
        );
      }
    }
  });

  // Обработка добавления пользователя в новый сервер
  client.on(Events.GuildCreate, async (guild) => {
    console.log(`Бот добавлен на сервер: ${guild.name} (id: ${guild.id})`);
    
    // Находим канал для отправки приветственного сообщения
    const channel = guild.channels.cache.find(
      (c) => c.type === 0 && c.permissionsFor(guild.members.me).has('SendMessages')
    );
    
    if (channel) {
      channel.send(
        `👋 Привет! Я бот MineStory!\n\n` +
        `Я буду отправлять приватные сообщения пользователям, которые авторизуются на сайте.\n` +
        `Для работы мне нужны права на отправку сообщений и просмотр каналов.`
      );
    }
  });

  return {
    userManager
  };
} 