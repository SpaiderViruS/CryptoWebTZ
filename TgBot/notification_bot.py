import os
import asyncio
import threading
import time
import psycopg2
from urllib.parse import urlparse
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from telegram import Update, Bot
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from telegram.constants import ParseMode

# Загрузка переменных из .env
load_dotenv()

# Telegram конфиг
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
bot = Bot(token=TELEGRAM_TOKEN)

# PostgreSQL конфиг через DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")
parsed_url = urlparse(DATABASE_URL)
DB_CONFIG = {
    "dbname": parsed_url.path[1:],
    "user": parsed_url.username,
    "password": parsed_url.password,
    "host": parsed_url.hostname,
    "port": parsed_url.port
}

# Flask-приложение для получения уведомлений
app = Flask(__name__)

@app.route("/send", methods=["POST"])
def notify_all_contacts():
    data = request.json

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT telegram_account FROM notification_contacts WHERE telegram_account IS NOT NULL")
        rows = cursor.fetchall()

        if not rows:
            return jsonify({"error": "Нет получателей"}), 404

        text = f"""
📥 *Создана новая заявка обмена*

💱 Валюта: {data['sell_currency']} → {data['buy_currency']}
💸 Сумма продажи: {data['sell_amount']} {data['sell_currency']}
💰 Сумма покупки: {data['buy_amount']} {data['buy_currency']}

🔐 Кошелек: `{data['wallet_address']}`
📞 Телефон: {data['phone']}
        """.strip()

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        for (chat_id,) in rows:
            try:
                loop.run_until_complete(bot.send_message(chat_id=chat_id, text=text, parse_mode=ParseMode.MARKDOWN))
            except Exception as send_err:
                print(f"❌ Не удалось отправить {chat_id}: {send_err}")
                if "Timed out" in str(send_err) or "Forbidden" in str(send_err):
                    try:
                        cursor.execute("UPDATE notification_contacts SET is_active = false WHERE telegram_account = %s", (chat_id,))
                        conn.commit()
                    except Exception as db_err:
                        print(f"⚠️ Ошибка обновления БД для {chat_id}: {db_err}")
            finally:
                time.sleep(0.3)

        loop.close()
        cursor.close()
        conn.close()
        return jsonify({"status": "ok", "recipients": len(rows)}), 200

    except Exception as e:
        print("Ошибка:", e)
        return jsonify({"error": "Ошибка при запросе или отправке"}), 500

# Обработчики Telegram команд
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
            "Вы можете отписаться в любой момент с помощью команды /stop."
        )

    except Exception as e:
        print("Ошибка БД:", e)
        await update.message.reply_text("❌ Ошибка при подписке")

async def stop(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = str(update.effective_chat.id)
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("UPDATE notification_contacts SET is_active = false WHERE telegram_account = %s", (chat_id,))
        conn.commit()
        cursor.close()
        conn.close()
        await update.message.reply_text("📍 Вы отписались от уведомлений.")
    except Exception as e:
        print("Ошибка БД:", e)
        await update.message.reply_text("❌ Ошибка при отписке")

# Запуск Flask и Telegram параллельно
if __name__ == "__main__":
    flask_thread = threading.Thread(target=lambda: app.run(port=5005, use_reloader=False))
    flask_thread.start()

    app_bot = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
    app_bot.add_handler(CommandHandler("start", start))
    app_bot.add_handler(CommandHandler("stop", stop))
    app_bot.run_polling()
