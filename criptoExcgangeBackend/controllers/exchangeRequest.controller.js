const db = require('../db')
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

      // Проверка обязательных полей
      if (!req.body.sellAmount || !req.body.buyAmount || !req.body.walletAddress || !req.body.phone) {
        throw new Error('Недостаточно данных');
      }

      const checkPair = await db.query(
        'SELECT id FROM currency_pairs WHERE id = $1',
        [req.body.currency_pair_id]
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
          req.body.sellAmount, req.body.buyAmount, req.body.walletAddress, req.body.phone,
          exchange_rate, commission, req.body.currency_pair_id, created_at
        ]
      );
      
      console.log(req.body.sell_currency, req.body.buy_currency);

      // Успешный ответ
      res.json({ message: 'Заявка успешно создана' });
      // ⚠️ ПРАВИЛЬНЫЙ ЗАПРОС В PYTHON-БОТА
      await notifyTelegramBot({
        sell_currency: req.body.sell_currency,
        buy_currency: req.body.buy_currency,
        sell_amount: req.body.sellAmount,
        buy_amount: req.body.buyAmount,
        wallet_address: req.body.walletAddress,
        phone: req.body.phone
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