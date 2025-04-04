import os
import asyncio
import psycopg2
from urllib.parse import urlparse
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from telegram import Update
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    ContextTypes
)
from telegram.constants import ParseMode

# === Загрузка переменных окружения ===
load_dotenv()
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
WEBHOOK_URL = os.getenv("WEBHOOK_URL")
DATABASE_URL = os.getenv("DATABASE_URL")

parsed_url = urlparse(DATABASE_URL)
DB_CONFIG = {
    "dbname": parsed_url.path[1:],
    "user": parsed_url.username,
    "password": parsed_url.password,
    "host": parsed_url.hostname,
    "port": parsed_url.port
}

# === Flask-приложение ===
app = Flask(__name__)

# === Telegram Application ===
telegram_app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()

# === Команды Telegram ===
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

        await update.message.reply_text("✅ Вы подписаны на уведомления.")
    except Exception as e:
        print("Ошибка БД:", e)
        await update.message.reply_text("❌ Ошибка при подписке.")

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
        await update.message.reply_text("❌ Ошибка при отписке.")

telegram_app.add_handler(CommandHandler("start", start))
telegram_app.add_handler(CommandHandler("stop", stop))

# === Webhook endpoint от Telegram ===
@app.route("/webhook", methods=["POST"])
async def telegram_webhook():
    try:
        await telegram_app.initialize()
        await telegram_app.start()
        data = request.get_json(force=True)
        update = Update.de_json(data, telegram_app.bot)
        await telegram_app.process_update(update)
        return "ok", 200
    except Exception as e:
        print("Ошибка Webhook:", e)
        return "error", 500

# === Endpoint для сайта ===
@app.route("/send", methods=["POST"])
async def notify_all_contacts():
    data = request.json
    print("Полученные данные:", data)
    try:
        await telegram_app.initialize()
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT telegram_account FROM notification_contacts WHERE is_active = true")
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

        for (chat_id,) in rows:
            try:
                await telegram_app.bot.send_message(chat_id=chat_id, text=text, parse_mode=ParseMode.MARKDOWN)
            except Exception as e:
                print(f"Ошибка отправки {chat_id}: {e}")
                cursor.execute("UPDATE notification_contacts SET is_active = false WHERE telegram_account = %s", (chat_id,))
                conn.commit()

        cursor.close()
        conn.close()
        return jsonify({"status": "ok", "recipients": len(rows)}), 200

    except Exception as e:
        print("Ошибка отправки:", e)
        return jsonify({"error": "Ошибка при отправке"}), 500

# === Основной запуск ===
if __name__ == "__main__":
    # Запуск Flask
    telegram_app.run_task()  # это нужно, чтобы Application работал в фоне
    asyncio.run(telegram_app.bot.set_webhook(url=WEBHOOK_URL))
    app.run(host="0.0.0.0", port=5005)
