import { REST } from 'discord.js';
import { Routes } from 'discord-api-types/v10';
import { getContext7Service } from '../services/context7Service.js';

// Список команд бота
const commands = [
  {
    name: 'ping',
    description: 'Проверка доступности бота',
  },
  {
    name: 'help',
    description: 'Показать справку по командам',
  },
  {
    name: 'balance',
    description: 'Показать баланс монет',
  },
  {
    name: 'subscribe',
    description: 'Подписаться на уведомления',
  },
  {
    name: 'unsubscribe',
    description: 'Отписаться от уведомлений',
  },
  {
    name: 'docs',
    description: 'Найти документацию через Context7',
    options: [
      {
        name: 'library',
        description: 'Название библиотеки',
        type: 3, // STRING
        required: true,
        choices: [
          { name: 'Discord.js', value: 'discord.js' },
          { name: 'MongoDB', value: 'mongodb' },
          { name: 'Express', value: 'express' },
          { name: 'Node.js', value: 'node' }
        ]
      },
      {
        name: 'topic',
        description: 'Тема документации',
        type: 3, // STRING
        required: true
      }
    ]
  }
];

// Функция для регистрации slash-команд
export async function registerCommands(client) {
  try {
    console.log('Начинаем регистрацию slash-команд');
    
    const rest = new REST({ version: '10' }).setToken(client.token);

    // Регистрируем команды глобально для бота
    const data = await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );

    console.log(`Успешно зарегистрировано ${data.length} команд`);
    return data;
  } catch (error) {
    console.error('Ошибка при регистрации команд:', error);
  }
}

// Обработчики команд
export function handleCommand(interaction, client) {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  // Обработка команды ping
  if (commandName === 'ping') {
    interaction.reply({
      content: 'Pong! 🏓 Бот работает!',
      ephemeral: true
    });
  }

  // Обработка команды help
  if (commandName === 'help') {
    interaction.reply({
      content: `**Доступные команды:**
• **/ping** - Проверка доступности бота
• **/help** - Показать справку по командам
• **/balance** - Показать баланс монет
• **/subscribe** - Подписаться на уведомления
• **/unsubscribe** - Отписаться от уведомлений
• **/docs** - Найти документацию по библиотеке`,
      ephemeral: true
    });
  }

  // Обработка команды balance (заглушка)
  if (commandName === 'balance') {
    interaction.reply({
      content: 'Ваш текущий баланс: 0 монет. Играйте в рулетку на сайте, чтобы выиграть монеты!',
      ephemeral: true
    });
  }

  // Обработка команды subscribe
  if (commandName === 'subscribe') {
    interaction.reply({
      content: 'Вы успешно подписались на уведомления от MineStory!',
      ephemeral: true
    });
  }

  // Обработка команды unsubscribe
  if (commandName === 'unsubscribe') {
    interaction.reply({
      content: 'Вы отписались от уведомлений MineStory. Вы всегда можете снова подписаться с помощью команды /subscribe.',
      ephemeral: true
    });
  }
  
  // Обработка команды docs (Context7)
  if (commandName === 'docs') {
    const library = interaction.options.getString('library');
    const topic = interaction.options.getString('topic');
    
    // Сначала отправим сообщение о поиске
    interaction.deferReply({ ephemeral: true }).then(async () => {
      try {
        // Получаем сервис Context7
        const context7Service = getContext7Service();
        
        // Запрашиваем документацию
        const docs = await context7Service.getDocs(library, topic);
        
        // Готовим текст документации (обрезаем до 2000 символов, лимит Discord)
        const content = docs.content.length > 1900 
          ? docs.content.substring(0, 1900) + '...\n(документация обрезана из-за ограничений Discord)'
          : docs.content;
        
        // Отправляем ответ с документацией
        interaction.editReply({
          content: `📚 **Документация по ${library} (${topic}):**\n\n${content}`,
          ephemeral: true
        });
      } catch (error) {
        console.error('Ошибка при запросе документации:', error);
        interaction.editReply({
          content: `❌ Ошибка при поиске документации: ${error.message}`,
          ephemeral: true
        });
      }
    });
  }
} 