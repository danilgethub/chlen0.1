import User from '../models/User.js';

// Класс для управления пользователями
class UserManager {
  constructor(client) {
    this.client = client;
    this.users = new Map(); // Кэш пользователей
  }

  // Найти или создать пользователя
  async findOrCreateUser(discordUser) {
    try {
      // Проверяем кэш
      if (this.users.has(discordUser.id)) {
        return this.users.get(discordUser.id);
      }

      // Ищем в базе данных
      let user = await User.findOne({ discordId: discordUser.id });

      // Если не найден, создаем нового
      if (!user) {
        user = new User({
          discordId: discordUser.id,
          username: discordUser.username,
          discriminator: discordUser.discriminator,
          avatar: discordUser.avatar,
          email: discordUser.email
        });

        await user.save();
        console.log(`Создан новый пользователь: ${discordUser.tag || discordUser.username}`);
      }

      // Обновляем кэш
      this.users.set(discordUser.id, user);
      
      return user;
    } catch (error) {
      console.error('Ошибка при поиске/создании пользователя:', error);
      throw error;
    }
  }

  // Обновить информацию о пользователе
  async updateUserInfo(discordId, userData) {
    try {
      const user = await User.findOneAndUpdate(
        { discordId },
        { ...userData, lastLoginDate: new Date() },
        { new: true }
      );

      if (user) {
        this.users.set(discordId, user);
        console.log(`Обновлена информация пользователя: ${discordId}`);
      }

      return user;
    } catch (error) {
      console.error('Ошибка при обновлении пользователя:', error);
      throw error;
    }
  }

  // Отправить сообщение пользователю
  async sendMessageToUser(discordId, message) {
    try {
      const discordUser = await this.client.users.fetch(discordId);
      
      if (!discordUser) {
        throw new Error(`Пользователь с ID ${discordId} не найден`);
      }

      // Проверка настроек уведомлений (если используется база данных)
      const dbUser = await User.findOne({ discordId });
      
      if (dbUser && dbUser.notificationSettings && !dbUser.notificationSettings.directMessages) {
        console.log(`Пользователь ${discordId} отключил уведомления, сообщение не отправлено`);
        return false;
      }

      // Отправляем сообщение
      await discordUser.send(message);
      console.log(`Сообщение отправлено пользователю ${discordId}`);
      
      return true;
    } catch (error) {
      console.error(`Ошибка при отправке сообщения пользователю ${discordId}:`, error);
      throw error;
    }
  }

  // Массовая рассылка всем пользователям
  async broadcastMessage(message, filter = {}) {
    try {
      // Находим всех пользователей, которые разрешили уведомления
      const users = await User.find({
        ...filter,
        'notificationSettings.directMessages': true,
        isSubscribed: true
      });

      let successCount = 0;
      let failCount = 0;

      // Отправляем сообщения
      for (const user of users) {
        try {
          await this.sendMessageToUser(user.discordId, message);
          successCount++;
        } catch (error) {
          failCount++;
          console.error(`Ошибка при отправке сообщения ${user.discordId}:`, error.message);
        }
        
        // Задержка, чтобы не превысить лимит Discord API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`Массовая рассылка: успешно ${successCount}, не удалось ${failCount}`);
      return { successCount, failCount };
    } catch (error) {
      console.error('Ошибка при массовой рассылке:', error);
      throw error;
    }
  }
}

// Создаем и экспортируем экземпляр менеджера пользователей
let userManager = null;

export function setupUserManager(client) {
  userManager = new UserManager(client);
  return userManager;
}

export function getUserManager() {
  if (!userManager) {
    throw new Error('UserManager не инициализирован. Сначала вызовите setupUserManager()');
  }
  return userManager;
} 