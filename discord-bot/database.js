import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Функция подключения к базе данных
export async function connectDatabase() {
  try {
    // Если нет строки подключения в .env, используем локальную базу данных
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/minestory';
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Успешное подключение к базе данных MongoDB');
    
    // Обработка ошибок подключения
    mongoose.connection.on('error', (err) => {
      console.error('Ошибка соединения с MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('Соединение с MongoDB потеряно');
    });
    
    // Корректное закрытие соединения при выходе
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Соединение с MongoDB закрыто');
      process.exit(0);
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
    process.exit(1);
  }
} 