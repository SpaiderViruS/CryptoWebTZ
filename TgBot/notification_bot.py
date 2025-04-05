import os
import logging
import psycopg2
from urllib.parse import urlparse
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from telegram import Update
from telegram.ext import (
    Application,
    ApplicationBuilder,
    CommandHandler,
    ContextTypes,
)
from telegram.constants import ParseMode

# Логгирование
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Загрузка переменных среды
load_dotenv()
TOKEN = os.getenv("TELEGRAM_TOKEN")
WEBHOOK_URL = os.getenv("WEBHOOK_URL")

# База данных
parsed_url = urlparse(os.getenv("DATABASE_URL"))
DB_CONFIG = {
    "dbname": parsed_url.path[1:],
    "user": parsed_url.username,
    "password": parsed_url.password,
    "host": parsed_url.hostname,
    "port": parsed_url.port
}

# Создаем FastAPI и Telegram App
app = FastAPI()
telegram_app: Application = ApplicationBuilder().token(TOKEN).build()

@app.on_event("startup")
async def on_startup():
    logger.info("🚀 Инициализация бота...")
    await telegram_app.initialize()
    telegram_app.add_handler(CommandHandler("start", start))
    telegram_app.add_handler(CommandHandler("stop", stop))
    await telegram_app.bot.set_webhook(url=f"{WEBHOOK_URL}/webhook")
    logger.info("✅ Webhook установлен!")

# Обработчики команд
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = str(update.effective_chat.id)
    username = update.effective_user.username or "unknown"

    logger.info(f"📩 Подписка: {chat_id} / {username}")
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO notification_contacts (telegram_account, username, is_active)
            VALUES (%s, %s, true)
            ON CONFLICT (telegram_account) DO UPDATE SET is_active = true;
        """, (chat_id, username))
        conn.commit()
        cur.close()
        conn.close()

        await context.bot.send_message(chat_id=chat_id, text="✅ Вы подписались на уведомления.")
    except Exception as e:
        logger.error(f"Ошибка подписки: {e}")
        await context.bot.send_message(chat_id=chat_id, text="❌ Ошибка подписки.")

async def stop(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = str(update.effective_chat.id)
    logger.info(f"🛑 Отписка: {chat_id}")

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("UPDATE notification_contacts SET is_active = false WHERE telegram_account = %s", (chat_id,))
        conn.commit()
        cur.close()
        conn.close()

        await context.bot.send_message(chat_id=chat_id, text="📍 Вы отписались от уведомлений.")
    except Exception as e:
        logger.error(f"Ошибка отписки: {e}")
        await context.bot.send_message(chat_id=chat_id, text="❌ Ошибка отписки.")

# Webhook-обработка сообщений
@app.post("/webhook")
async def webhook_handler(request: Request):
    data = await request.json()
    update = Update.de_json(data, telegram_app.bot)
    await telegram_app.process_update(update)
    return {"status": "ok"}

# Ручка рассылки
@app.post("/send")
async def send_notifications(request: Request):
    data = await request.json()
    msg = f"""
📥 *Создана новая заявка обмена*

💱 {data['sell_currency']} → {data['buy_currency']}
💸 Продажа: {data['sell_amount']} {data['sell_currency']}
💰 Покупка: {data['buy_amount']} {data['buy_currency']}

🔐 Кошелек: `{data['wallet_address']}`
📞 Телефон: {data['phone']}
"""

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("SELECT telegram_account FROM notification_contacts WHERE is_active = true")
        rows = cur.fetchall()
        cur.close()
        conn.close()

        for (chat_id,) in rows:
            try:
                await telegram_app.bot.send_message(chat_id=chat_id, text=msg, parse_mode=ParseMode.MARKDOWN)
            except Exception as e:
                logger.warning(f"❌ Ошибка отправки {chat_id}: {e}")

        return {"status": "ok", "sent": len(rows)}
    except Exception as e:
        logger.error(f"Ошибка рассылки: {e}")
        return {"error": str(e)}
