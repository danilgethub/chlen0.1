# Discord Бот для MineStory Website

Discord бот для отправки сообщений пользователям, которые авторизовались на сайте MineStory. Бот отправляет приветственные сообщения при авторизации через Discord и поддерживает обмен сообщениями между сайтом и Discord.

## Особенности

- Отправка приветственных сообщений при авторизации на сайте
- API для отправки личных сообщений пользователям
- Поддержка массовых рассылок
- Отвечает на команды пользователей в личных сообщениях
- Поддерживает slash-команды в серверах Discord

## Требования

- Node.js 14+ 
- Discord.js 14+
- MongoDB (опционально)

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/minestory-discord-bot.git
cd minestory-discord-bot
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл .env с следующими настройками:
```
# Discord Bot Token - ЗАМЕНИТЕ НА СВОЙ ТОКЕН!
DISCORD_BOT_TOKEN=your_discord_bot_token_here

# MongoDB Connection String (опционально)
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.mongodb.net/minestory

# Website API URL (по умолчанию localhost)
WEBSITE_API_URL=http://localhost:3000/api

# Порт для внутреннего API бота
BOT_API_PORT=3001
```

> **ВАЖНО: БЕЗОПАСНОСТЬ**
> - **НИКОГДА** не публикуйте файл .env в публичных репозиториях
> - Добавьте .env в .gitignore
> - Храните свой токен дискорд-бота в секрете!

4. Запустите бота:
```bash
npm start
```

## Интеграция с Context7

Для взаимодействия с документацией через Context7 (для последующего развития функциональности):

1. Добавьте поддержку Context7 в ваш проект:
```bash
npm install @context7/client
```

2. Пример использования Context7 для доступа к документации Discord.js:
```javascript
import { Context7Client } from '@context7/client';

// Создаем клиент Context7
const context7 = new Context7Client({
  apiKey: process.env.CONTEXT7_API_KEY
});

// Пример получения документации по Discord.js
async function getDiscordJsDocs() {
  const docs = await context7.getDocumentation({
    library: 'discord.js',
    topic: 'client'
  });
  
  console.log(docs);
}
```

3. Добавьте ключ API Context7 в ваш .env файл:
```
CONTEXT7_API_KEY=your_context7_api_key_here
```

## API Endpoints

### Отправка сообщения пользователю
- **URL**: `/api/send-message`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "userId": "discord_user_id",
    "message": "Текст сообщения"
  }
  ```

### Массовая рассылка
- **URL**: `/api/broadcast`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "message": "Текст для рассылки",
    "filter": {}
  }
  ```

### Уведомление о входе пользователя
- **URL**: `/api/user-login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "userId": "discord_user_id",
    "username": "discord_username"
  }
  ```

## Интеграция с сайтом

Для интеграции с сайтом MineStory бот использует HTTP API. Добавьте следующий код в ваш server.js для отправки уведомлений при авторизации:

```javascript
// После успешной авторизации через Discord
app.get('/auth/discord/callback', passport.authenticate('discord', {
  failureRedirect: '/'
}), async (req, res) => {
  // Отправляем уведомление боту о входе пользователя
  if (req.user && req.user.id) {
    try {
      await fetch('http://localhost:3001/api/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: req.user.id,
          username: req.user.username
        }),
      });
    } catch (error) {
      console.error('Ошибка при взаимодействии с ботом:', error);
    }
  }
  
  res.redirect('/');
});
```

## Команды для пользователей

### Личные сообщения
- `!help` - Показать список доступных команд
- `!info` - Информация о сервере Minecraft
- `!balance` - Проверить баланс монет (в разработке)

### Slash-команды
- `/ping` - Проверка доступности бота
- `/help` - Показать справку по командам
- `/balance` - Показать баланс монет
- `/subscribe` - Подписаться на уведомления
- `/unsubscribe` - Отписаться от уведомлений

## Безопасная работа с секретами

1. **Создайте .gitignore файл**:
```bash
touch .gitignore
```

2. **Добавьте в .gitignore следующие строки**:
```
# Секретные файлы
.env
.env.local
.env.development
.env.production

# Логи
logs
*.log
npm-debug.log*

# Зависимости
node_modules/

# Разное
.DS_Store
```

3. **НЕ храните токены в исходном коде**:
Всегда загружайте токены и секреты из переменных окружения или файлов .env

## Лицензия

MIT 