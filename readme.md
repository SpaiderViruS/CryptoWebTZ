# CryptoExchange

Веб-приложение для обмена криптовалют. Поддержка уведомлений в Telegram, панель администратора и управление курсами.

## 🚀 Стек технологий

**Frontend:**
- Vue 2
- Vuex
- Vuetify

**Backend:**
- Node.js
- Express
- PostgreSQL

**Telegram Bot:**
- FastAPI
- python-telegram-bot

**Деплой:**
- Render.com

## 📦 Установка и запуск

1. Клонируй репозиторий:

```bash
git clone https://github.com/SpaiderViruS/CryptoWebTZ.git
cd CryptoWebTZ/criptoExcgangeBackend
```

2. Установи зависимости:

```bash
npm install
```

3. Создай `.env` файл:

```env
PORT=5000
DATABASE_URL=postgres://user:password@host:port/dbname
```

4. Запусти сервер:

```bash
npm run dev
```

## 📬 Telegram бот

Код бота расположен в `TgBot/notification_bot.py`.

### Переменные окружения:

```env
TELEGRAM_TOKEN=твой_токен
WEBHOOK_URL=https://твой-сайт.onrender.com
DATABASE_URL=postgres://user:password@host:port/dbname
```

Запуск бота:

```bash
python notification_bot.py
```

## 📚 API

### `POST /send`

Отправка уведомления всем подписанным пользователям.

```json
{
  "sell_currency": "USDT",
  "buy_currency": "RUB",
  "sell_amount": 100,
  "buy_amount": 9300,
  "wallet_address": "0xabc123...",
  "phone": "+79998887766"
}
```

### `GET /reviews`

Получение списка отзывов.

### `POST /reviews`

Создание нового отзыва.

### `POST /chat/:id`

Отправка сообщения в чат.

---

## 💬 Команды бота

- `/start` — подписка на уведомления
- `/stop` — отписка от уведомлений

---

## 👨‍💻 Авторы

- SpiderViruS— Backend / Telegram бот 
- DragoNill—  Frontend / Telegram бот 

## 🕓 Последнее обновление

2025-04-22 14:18

## 📃 Лицензия

MIT
