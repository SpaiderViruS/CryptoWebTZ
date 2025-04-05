import os
import logging
import psycopg2
from urllib.parse import urlparse
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from telegram import Update, Bot
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from telegram.constants import ParseMode

# ───── Загрузка переменных окружения ─────
load_dotenv()

TOKEN = os.getenv("TELEGRAM_TOKEN")
WEBHOOK_URL = os.getenv("WEBHOOK_URL")
parsed_url = urlparse(os.getenv("DATABASE_URL"))

# ───── Конфигурация базы данных ─────
DB_CONFIG = {
    "dbname": parsed_url.path[1:],
    "user": parsed_url.username,
    "password": parsed_url.password,
    "host": parsed_url.hostname,
    "port": parsed_url.port
}

# ───── Логгирование ─────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ───── Telegram и FastAPI ─────
bot = Bot(token=TOKEN)
app_bot = ApplicationBuilder().token(TOKEN).build()
app = FastAPI()

# ───── Обработчики команд ─────
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = str(update.effective_chat.id)
    username = update.effective_user.username or "no_username"
    logger.info(f"✅ Подписка: {chat_id} ({username})")

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

        await context.bot.send_message(chat_id=chat_id, text="✅ Вы подписались на уведомления!")
    except Exception as e:
        logger.error(f"Ошибка подписки: {e}")
        await context.bot.send_message(chat_id=chat_id, text="❌ Ошибка подписки.")

async def stop(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = str(update.effective_chat.id)
    logger.info(f"❌ Отписка: {chat_id}")

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

# ───── Webhook и уведомления ─────
@app.post("/webhook")
async def telegram_webhook(req: Request):
    data = await req.json()
    update = Update.de_json(data, bot)
    await app_bot.process_update(update)
    return {"ok": True}

@app.post("/send")
async def notify_all_contacts(request: Request):
    data = await request.json()

    text = f"""
📥 *Создана новая заявка обмена*

💱 Валюта: {data['sell_currency']} → {data['buy_currency']}
💸 Сумма продажи: {data['sell_amount']} {data['sell_currency']}
💰 Сумма покупки: {data['buy_amount']} {data['buy_currency']}

🔐 Кошелек: `{data['wallet_address']}`
📞 Телефон: {data['phone']}
    """

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("SELECT telegram_account FROM notification_contacts WHERE is_active = true")
        users = cur.fetchall()
        cur.close()
        conn.close()

        for (chat_id,) in users:
            try:
                await bot.send_message(chat_id=chat_id, text=text, parse_mode=ParseMode.MARKDOWN)
            except Exception as e:
                logger.warning(f"❌ Ошибка отправки {chat_id}: {e}")
        return {"sent": len(users)}
    except Exception as e:
        logger.error(f"Ошибка рассылки: {e}")
        return {"error": str(e)}

# ───── Запуск ─────
@app.on_event("startup")
async def on_startup():
    logger.info("🚀 Запуск бота")
    await app_bot.initialize()
    app_bot.add_handler(CommandHandler("start", start))
    app_bot.add_handler(CommandHandler("stop", stop))
    await bot.set_webhook(url=f"{WEBHOOK_URL}/webhook")
    logger.info("✅ Webhook установлен")
