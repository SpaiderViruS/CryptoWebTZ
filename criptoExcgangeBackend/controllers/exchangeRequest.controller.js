const db = require('../db');
const axios = require('axios');

class exchangeRequestController {
  async getAllExcnages(req, res) {
    try {
      const exhReq = await db.query(
        `
          SELECT er.*, cr.sell_currency, cr.buy_currency FROM exchange_requests AS er 
          JOIN currency_pairs AS cr ON cr.id = currency_pair_id
          ORDER BY created_at DESC
        `
      );

      res.status(200)
      res.json(exhReq.rows);
    } catch (err) {
      console.error('Ошибка при получении заявки:', err);
      res.status(400).json({ error: err.message });
    }
  }

  async newRequest(req, res) {
    try {
      // Данные, которые приходят с фронта
      const { 
        sellAmount, 
        buyAmount, 
        walletAddress, 
        phone,
        currency_pair_id,
        sell_currency,
        buy_currency
      } = req.body;
  
      // Проверка обязательных полей
      if (!sellAmount || !buyAmount || !walletAddress || !phone) {
        throw new Error('Недостаточно данных');
      }

      const checkPair = await db.query(
        'SELECT id FROM currency_pairs WHERE id = $1',
        [currency_pair_id]
      );
      
      if (checkPair.rows.length === 0) {
        throw new Error('Неверная валютная пара');
      }
      const created_at = new Date(); // Текущая дата и время
      const exchange_rate = 0.013; // Пример курса (можно получать через API)
      const commission = 1.50; // Пример комиссии (можно брать из настроек)

      // Вставка данных в базу
      await db.query(
        `
        INSERT INTO exchange_requests
        (
          sell_amount, buy_amount, wallet_address, phone,
          exchange_rate, commission, currency_pair_id, created_at
        )
        VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          sellAmount, buyAmount, walletAddress, phone,
          exchange_rate, commission, currency_pair_id, created_at
        ]
      );

      // Успешный ответ
      res.json({ message: 'Заявка успешно создана' });
      await notifyTelegramBot({
        sell_currency: sell_currency,
        buy_currency: buy_currency,
        sell_amount: sellAmount,
        buy_amount: buyAmount,
        wallet_address: walletAddress,
        phone: phone
      });

    } catch (err) {
      console.error('Ошибка при создании заявки:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

}

  // вне класса
async function notifyTelegramBot(payload) {
    try {
      await axios.post(
        process.env.BOT_API_URL || 'http://localhost:5005/send',
        payload,
        {
          headers: {
            'X-API-KEY': process.env.BOT_API_KEY || 'dev-key',
          },
        }
      );
    } catch (err) {
      console.error('Ошибка при отправке уведомления:', err.message);
    }
  }
module.exports = new exchangeRequestController();