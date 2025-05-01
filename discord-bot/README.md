# MineStory Discord Bot

Discord бот для сервера MineStory, который отправляет приветственные сообщения пользователям, когда они авторизуются на сайте.

## Возможности

- Отправка приветственных сообщений пользователям через личные сообщения
- REST API для интеграции с сайтом
- Настраиваемые сообщения

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/ваш-пользователь/minestory-discord-bot.git
cd minestory-discord-bot
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

4. Отредактируйте `.env` файл, указав ваш токен бота и другие параметры.

## Запуск бота

```bash
npm start
```

## API эндпоинты

### Отправка сообщения пользователю

**POST** `/api/send-message`

Тело запроса:
```json
{
  "userId": "discord_user_id",
  "username": "имя_пользователя"
}
```

Ответ в случае успеха:
```json
{
  "success": true,
  "message": "Сообщение успешно отправлено"
}
```

## Интеграция с веб-сайтом

Для интеграции с сайтом добавьте следующий код в обработчик успешной авторизации:

```javascript
// После успешной авторизации через Discord
fetch('http://localhost:3001/api/send-message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: discordUserId,
    username: discordUsername
  }),
});
```

## Конфигурация

Настройки бота хранятся в файле `config.js` и могут быть перезаписаны через переменные окружения:

- `BOT_TOKEN` - Токен Discord бота
- `PORT` - Порт для API (по умолчанию 3001)
- `WEBSITE_URL` - URL сайта
- `WELCOME_MESSAGE` - Текст приветственного сообщения
- `SERVER_IP` - IP адрес сервера Minecraft

## Требования

- Node.js 16.9.0 или выше
- npm или yarn
- Discord Bot Token

## Лицензия

MIT 