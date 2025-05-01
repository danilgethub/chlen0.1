// Импортируем необходимые зависимости
import dotenv from 'dotenv';
import nodeFetch from 'node-fetch';

// Загружаем переменные окружения
dotenv.config();

/**
 * Класс для работы с Context7 API
 */
class Context7Client {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = 'https://api.context7.com/v1';
    console.log('Context7Client инициализирован с ключом API');
  }

  /**
   * Получить документацию по библиотеке
   * @param {Object} options - Параметры запроса
   * @param {string} options.library - Название библиотеки
   * @param {string} options.topic - Тема документации
   * @returns {Promise<Object>} - Документация
   */
  async getDocumentation(options) {
    try {
      // Сначала получим ID библиотеки
      const libraryId = await this.resolveLibraryId(options.library);
      
      // Затем получим документацию
      const response = await nodeFetch(`${this.baseUrl}/docs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          context7CompatibleLibraryID: libraryId,
          topic: options.topic,
          tokens: 1000 // Ограничиваем количество токенов для экономии
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка API: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Ошибка при получении документации: ${error.message}`);
      
      // Если произошла ошибка, возвращаем заглушку
      return {
        content: `# Документация по ${options.library}\nИзвините, не удалось получить документацию по теме "${options.topic}". Проверьте подключение к Context7 API.`
      };
    }
  }
  
  /**
   * Получить ID библиотеки по названию
   * @param {string} libraryName - Название библиотеки
   * @returns {Promise<string>} - ID библиотеки
   */
  async resolveLibraryId(libraryName) {
    try {
      const response = await nodeFetch(`${this.baseUrl}/resolve-library-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          libraryName
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка API: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      // В ответе будет список подходящих библиотек, берем первую
      if (data && data.length > 0) {
        return data[0].context7CompatibleLibraryID;
      }
      
      throw new Error(`Библиотека ${libraryName} не найдена`);
    } catch (error) {
      console.error(`Ошибка при поиске ID библиотеки: ${error.message}`);
      
      // Возвращаем известные ID для популярных библиотек
      if (libraryName === 'discord.js') return '/discordjs/discord.js';
      if (libraryName === 'mongodb') return '/mongodb/docs';
      if (libraryName === 'express') return '/expressjs/express';
      if (libraryName === 'node') return '/nodejs/node';
      
      throw error;
    }
  }
}

// Создаем класс сервиса для работы с Context7
class Context7Service {
  constructor() {
    const apiKey = process.env.CONTEXT7_API_KEY;
    
    if (!apiKey) {
      console.warn('ПРЕДУПРЕЖДЕНИЕ: CONTEXT7_API_KEY не найден в переменных окружения. Context7 будет работать в режиме заглушки.');
    }
    
    this.client = new Context7Client({ apiKey: apiKey || 'dummy-key' });
  }

  /**
   * Получить документацию по Discord.js
   * @param {string} topic - Тема документации
   * @returns {Promise<Object>} - Документация
   */
  async getDiscordJsDocs(topic = 'client') {
    try {
      const docs = await this.client.getDocumentation({
        library: 'discord.js',
        topic
      });
      return docs;
    } catch (error) {
      console.error('Ошибка при получении документации Discord.js:', error);
      throw error;
    }
  }

  /**
   * Получить документацию по MongoDB
   * @param {string} topic - Тема документации
   * @returns {Promise<Object>} - Документация
   */
  async getMongoDBDocs(topic = 'connection') {
    try {
      const docs = await this.client.getDocumentation({
        library: 'mongodb',
        topic
      });
      return docs;
    } catch (error) {
      console.error('Ошибка при получении документации MongoDB:', error);
      throw error;
    }
  }

  /**
   * Получить документацию по любой библиотеке
   * @param {string} library - Название библиотеки
   * @param {string} topic - Тема документации
   * @returns {Promise<Object>} - Документация
   */
  async getDocs(library, topic) {
    try {
      const docs = await this.client.getDocumentation({
        library,
        topic
      });
      return docs;
    } catch (error) {
      console.error(`Ошибка при получении документации ${library}:`, error);
      throw error;
    }
  }
}

// Создаем экземпляр сервиса
let context7Service = null;

/**
 * Инициализация сервиса Context7
 * @returns {Context7Service} - Экземпляр сервиса
 */
export function setupContext7Service() {
  context7Service = new Context7Service();
  return context7Service;
}

/**
 * Получить экземпляр сервиса Context7
 * @returns {Context7Service} - Экземпляр сервиса
 */
export function getContext7Service() {
  if (!context7Service) {
    return setupContext7Service();
  }
  return context7Service;
} 