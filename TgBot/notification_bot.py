import os
import asyncio
import psycopg2
from urllib.parse import urlparse
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from telegram import Update, Bot
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from telegram.constants import ParseMode
from telegram.request import HTTPXRequest as httpx_request
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Загрузка .env
load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
WEBHOOK_URL = os.getenv("WEBHOOK_URL")
MODE = os.getenv("MODE", "local")

# Telegram bot
request_instance = httpx_request()
bot = Bot(token=TELEGRAM_TOKEN, request=request_instance)
app_bot = ApplicationBuilder().bot(bot).build()
app_bot_initialized = False

# DB config
DATABASE_URL = os.getenv("DATABASE_URL")
parsed_url = urlparse(DATABASE_URL)
DB_CONFIG = {
    "dbname": parsed_url.path[1:],
    "user": parsed_url.username,
    "password": parsed_url.password,
    "host": parsed_url.hostname,
    "port": parsed_url.port
}

# Flask app
app = Flask(__name__)

# ============ Telegram Handlers ============
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    chat_id = str(update.effective_chat.id)
    username = user.username or "no_username"

    logger.info(f"Пользователь {username} (chat_id={chat_id}) подписывается на уведомления.")

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO notification_contacts (telegram_account, username, is_active)
            VALUES (%s, %s, true)
            ON CONFLICT (telegram_account) DO UPDATE SET is_active = true;
        """, (chat_id, username))

        conn.commit()
        cursor.close()
        conn.close()

        await update.message.reply_text(
            "✅ Вы подписались на уведомления.\n\n"
            "⚠️ Ваш Telegram ID (chat_id) сохранён и будет использоваться ТОЛЬКО для отправки системных уведомлений.\n"
            "Вы можете отписаться с помощью команды /stop."
        )

    except Exception as e:
        logger.error(f"Ошибка БД при подписке пользователя {chat_id}: {e}")
        await update.message.reply_text("❌ Ошибка при подписке")


async def stop(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = str(update.effective_chat.id)
    logger.info(f"Пользователь с chat_id={chat_id} отписывается от уведомлений.")

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("UPDATE notification_contacts SET is_active = false WHERE telegram_account = %s", (chat_id,))
        conn.commit()
        cursor.close()
        conn.close()

        await update.message.reply_text("📍 Вы отписались от уведомлений.")
    except Exception as e:
        logger.error(f"Ошибка БД при отписке пользователя {chat_id}: {e}")
        await update.message.reply_text("❌ Ошибка при отписке")

# ============ Flask Routes ============
@app.route("/webhook", methods=["POST"])
async def telegram_webhook():
    global app_bot_initialized
    try:
        if not app_bot_initialized:
            await app_bot.initialize()
            app_bot_initialized = True
        data = request.get_json(force=True)
        update = Update.de_json(data, bot)
        logger.info(f"Получен Webhook update: {data}")
        await app_bot.process_update(update)
        return "ok", 200
    except Exception as e:
        logger.error(f"Ошибка обработки webhook: {e}")
        return "error", 500


@app.route("/send", methods=["POST"])
async def notify_all_contacts():
    data = request.json
    logger.info(f"Получен запрос на рассылку уведомлений: {data}")

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT telegram_account FROM notification_contacts WHERE telegram_account IS NOT NULL")
        rows = cursor.fetchall()

        if not rows:
            logger.warning("Нет получателей в базе данных.")
            return jsonify({"error": "Нет получателей"}), 404

        text = f"""
📥 *Создана новая заявка обмена*

💱 Валюта: {data['sell_currency']} → {data['buy_currency']}
💸 Сумма продажи: {data['sell_amount']} {data['sell_currency']}
💰 Сумма покупки: {data['buy_amount']} {data['buy_currency']}

🔐 Кошелек: `{data['wallet_address']}`
📞 Телефон: {data['phone']}
        """

        # loop = asyncio.new_event_loop()
        # asyncio.set_event_loop(loop)

        for (chat_id,) in rows:
            try:
                logger.info(f"Отправка уведомления пользователю {chat_id}")
                await bot.send_message(chat_id=chat_id, text=text, parse_mode=ParseMode.MARKDOWN)
            except Exception as send_err:
                logger.warning(f"❌ Не удалось отправить {chat_id}: {send_err}")
                if "Timed out" in str(send_err) or "Forbidden" in str(send_err):
                    try:
                        cursor.execute("UPDATE notification_contacts SET is_active = false WHERE telegram_account = %s", (chat_id,))
                        conn.commit()
                        logger.info(f"Обновлен статус пользователя {chat_id} как неактивный")
                    except Exception as db_err:
                        logger.error(f"⚠️ Ошибка обновления БД для {chat_id}: {db_err}")
            finally:
                await asyncio.sleep(0.3)

        cursor.close()
        conn.close()
        return jsonify({"status": "ok", "recipients": len(rows)}), 200

    except Exception as e:
        logger.error(f"Ошибка при отправке: {e}")
        return jsonify({"error": "Ошибка при отправке"}), 500

# ============ Start ============
async def main():
    await app_bot.initialize()
    app_bot.add_handler(CommandHandler("start", start))
    app_bot.add_handler(CommandHandler("stop", stop))

    if MODE == "webhook":
        logger.info("Режим работы: WEBHOOK")
        await bot.set_webhook(url=WEBHOOK_URL)
        app.run(host="0.0.0.0", port=5005)
    else:
        logger.info("Режим работы: LOCAL polling")
        await app_bot.run_polling()

if __name__ == "__main__":
    import nest_asyncio
    nest_asyncio.apply()
    main()