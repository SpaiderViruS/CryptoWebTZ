import os
import asyncio
import psycopg2
from urllib.parse import urlparse
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from telegram import Update, Bot
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from telegram.constants import ParseMode

# Загрузка .env
load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
WEBHOOK_URL = os.getenv("WEBHOOK_URL")  # https://your-render-service.onrender.com/webhook

# Telegram bot
bot = Bot(token=TELEGRAM_TOKEN)
app_bot = ApplicationBuilder().token(TELEGRAM_TOKEN).build()

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
            "Ваш Telegram ID сохранён и будет использоваться только для отправки сообщений.\n"
            "Вы можете отписаться с помощью команды /stop."
        )

    except Exception as e:
        print("DB error:", e)
        await update.message.reply_text("\u274c Ошибка при подписке")

async def stop(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = str(update.effective_chat.id)
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("UPDATE notification_contacts SET is_active = false WHERE telegram_account = %s", (chat_id,))
        conn.commit()
        cursor.close()
        conn.close()
        await update.message.reply_text("\ud83d\udccd Вы отписались от уведомлений.")
    except Exception as e:
        print("DB error:", e)
        await update.message.reply_text("\u274c Ошибка при отписке")

# ============ Flask Routes ============
@app.route("/webhook", methods=["POST"])
async def telegram_webhook():
    try:
        data = request.get_json(force=True)
        update = Update.de_json(data, bot)
        await app_bot.process_update(update)
        return "ok", 200
    except Exception as e:
        print("Webhook error:", e)
        return "error", 500

@app.route("/send", methods=["POST"])
def notify_all_contacts():
    data = request.json
    print("\u041f\u043e\u043b\u0443\u0447\u0435\u043d\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435:", data)

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT telegram_account FROM notification_contacts WHERE telegram_account IS NOT NULL")
        rows = cursor.fetchall()

        if not rows:
            return jsonify({"error": "Нет получателей"}), 404

        text = f"""
\ud83d\udce5 *Создана новая заявка обмена*

\ud83d\udcb1 Валюта: {data['sell_currency']} → {data['buy_currency']}
\ud83d\udcb8 Сумма продажи: {data['sell_amount']} {data['sell_currency']}
\ud83d\udcb0 Сумма покупки: {data['buy_amount']} {data['buy_currency']}

\ud83d\udd10 Кошелек: `{data['wallet_address']}`
\ud83d\udcde Телефон: {data['phone']}
        """

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        for (chat_id,) in rows:
            try:
                loop.run_until_complete(
                    bot.send_message(chat_id=chat_id, text=text, parse_mode=ParseMode.MARKDOWN)
                )
            except Exception as send_err:
                print(f"\u274c Не удалось отправить {chat_id}: {send_err}")
                if "Timed out" in str(send_err) or "Forbidden" in str(send_err):
                    try:
                        cursor.execute("UPDATE notification_contacts SET is_active = false WHERE telegram_account = %s", (chat_id,))
                        conn.commit()
                    except Exception as db_err:
                        print(f"\u26a0\ufe0f Ошибка обновления бд: {db_err}")
            finally:
                asyncio.sleep(0.3)

        loop.close()
        cursor.close()
        conn.close()
        return jsonify({"status": "ok", "recipients": len(rows)}), 200

    except Exception as e:
        print("\u041eшибка:", e)
        return jsonify({"error": "\u041eшибка при отправке"}), 500

# ============ Start ============
if __name__ == "__main__":
    app_bot.add_handler(CommandHandler("start", start))
    app_bot.add_handler(CommandHandler("stop", stop))

    asyncio.run(bot.set_webhook(url=WEBHOOK_URL))
    app.run(host="0.0.0.0", port=5005)