import os
import asyncio
import traceback
import psycopg2
from urllib.parse import urlparse
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from telegram import Update, Bot
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from telegram.constants import ParseMode

# Загрузка переменных окружения
load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
WEBHOOK_URL = os.getenv("WEBHOOK_URL")  # например: https://vaultbot.onrender.com/webhook

bot = Bot(token=TELEGRAM_TOKEN)
app_bot = ApplicationBuilder().token(TELEGRAM_TOKEN).build()

# Подключение к БД
DATABASE_URL = os.getenv("DATABASE_URL")
parsed_url = urlparse(DATABASE_URL)
DB_CONFIG = {
    "dbname": parsed_url.path[1:],
    "user": parsed_url.username,
    "password": parsed_url.password,
    "host": parsed_url.hostname,
    "port": parsed_url.port
}

# Flask-приложение
app = Flask(__name__)

# ========= Хендлеры Telegram =========
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
            "✅ Вы подписались на уведомления.\n"
            "Вы можете отписаться с помощью команды /stop."
        )
    except Exception as e:
        print("DB error:", e)
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
        print("DB error:", e)
        await update.message.reply_text("❌ Ошибка при отписке")

# ========= Обработка Webhook =========
@app.route("/webhook", methods=["POST"])
def telegram_webhook():
    try:
        data = request.get_json(force=True)
        print("📨 Входящее сообщение:", data)
        update = Update.de_json(data, bot)
        asyncio.run(app_bot.process_update(update))
        return "ok", 200
    except Exception as e:
        print("❌ Ошибка обработки webhook:", e)
        traceback.print_exc()
        return "error", 500

# ========= Отправка уведомлений =========
@app.route("/send", methods=["POST"])
def notify_all_contacts():
    data = request.json
    print("📥 Данные для уведомления:", data)

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT telegram_account FROM notification_contacts WHERE telegram_account IS NOT NULL AND is_active = true")
        rows = cursor.fetchall()

        if not rows:
            return jsonify({"error": "Нет активных получателей"}), 404

        message = f"""
📥 *Создана новая заявка обмена*

💱 Валюта: {data['sell_currency']} → {data['buy_currency']}
💸 Сумма продажи: {data['sell_amount']} {data['sell_currency']}
💰 Сумма покупки: {data['buy_amount']} {data['buy_currency']}

🔐 Кошелек: `{data['wallet_address']}`
📞 Телефон: {data['phone']}
        """.strip()

        async def send_all():
            for (chat_id,) in rows:
                try:
                    await bot.send_message(chat_id=chat_id, text=message, parse_mode=ParseMode.MARKDOWN)
                except Exception as send_err:
                    print(f"❌ Не удалось отправить {chat_id}: {send_err}")
                    if "Forbidden" in str(send_err) or "Timed out" in str(send_err):
                        cursor.execute("UPDATE notification_contacts SET is_active = false WHERE telegram_account = %s", (chat_id,))
                        conn.commit()

        asyncio.run(send_all())

        cursor.close()
        conn.close()

        return jsonify({"status": "ok", "recipients": len(rows)}), 200
    except Exception as e:
        print("❌ Ошибка при отправке:", e)
        traceback.print_exc()
        return jsonify({"error": "Ошибка отправки"}), 500

# ========= Запуск =========
if __name__ == "__main__":
    app_bot.add_handler(CommandHandler("start", start))
    app_bot.add_handler(CommandHandler("stop", stop))

    # Регистрируем webhook
    print("🌐 Устанавливаем Webhook:", WEBHOOK_URL)
    asyncio.run(bot.set_webhook(url=WEBHOOK_URL))

    # Запускаем Flask
    app.run(host="0.0.0.0", port=5005)
