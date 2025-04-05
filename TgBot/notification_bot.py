import os
import logging
import psycopg2
from urllib.parse import urlparse
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from telegram import Update, Bot
from telegram.ext import Application, ApplicationBuilder, CommandHandler, ContextTypes
from telegram.constants import ParseMode

# =====================
# Настройка
# =====================
load_dotenv()

TOKEN = os.getenv("TELEGRAM_TOKEN")
WEBHOOK_URL = os.getenv("WEBHOOK_URL")

parsed_url = urlparse(os.getenv("DATABASE_URL"))
DB_CONFIG = {
    "dbname": parsed_url.path[1:],
    "user": parsed_url.username,
    "password": parsed_url.password,
    "host": parsed_url.hostname,
    "port": parsed_url.port
}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Telegram Bot
bot = Bot(token=TOKEN)
application: Application = ApplicationBuilder().token(TOKEN).build()

# FastAPI App
app = FastAPI()

# =====================
# Обработчики
# =====================
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = str(update.effective_chat.id)
    username = update.effective_user.username or "no_username"
    logger.info(f"\u2705 \u041f\u043e\u0434\u043f\u0438\u0441\u043a\u0430: {chat_id} ({username})")

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

        await context.bot.send_message(chat_id=chat_id, text="Вы подписались на уведомления!")
    except Exception as e:
        logger.error(f"Ошибка подписки: {e}")
        await context.bot.send_message(chat_id=chat_id, text="Ошибка подписки.")


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

        await context.bot.send_message(chat_id=chat_id, text="Вы отписались от уведомлений.")
    except Exception as e:
        logger.error(f"Ошибка отписки: {e}")
        await context.bot.send_message(chat_id=chat_id, text="Ошибка при отписке.")

# =====================
# FastAPI endpoints
# =====================
@app.on_event("startup")
async def startup():
    await application.initialize()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("stop", stop))
    await bot.set_webhook(url=f"{WEBHOOK_URL}/webhook")
    logger.info("✅ Webhook установлен")

@app.post("/webhook")
async def telegram_webhook(req: Request):
    data = await req.json()
    update = Update.de_json(data, bot)
    await application.process_update(update)
    return {"status": "ok"}

@app.post("/send")
async def notify_all_contacts(req: Request):
    data = await req.json()

    text = f"""
📅 *Создана новая заявка обмена*

💱 {data['sell_currency']} → {data['buy_currency']}
💸 {data['sell_amount']} {data['sell_currency']}
💰 {data['buy_amount']} {data['buy_currency']}

🔐 `{data['wallet_address']}`
📞 {data['phone']}
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
                logger.warning(f"⚠️ Ошибка отправки пользователю {chat_id}: {e}")

        return {"sent": len(users)}
    except Exception as e:
        logger.error(f"Ошибка рассылки: {e}")
        return {"error": str(e)}