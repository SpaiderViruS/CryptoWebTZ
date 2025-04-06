const axios = require('axios');
const db = require('../db');

class CursService {
  async updateRate() {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'tether',
          vs_currencies: 'rub'
        }
      });

      const rate = response.data?.tether?.rub;
      if (!rate) throw new Error('Не удалось получить курс');

      const currencyPairId = 1;

      await db.query(
        `
          INSERT INTO exchange_rates (currency_pair_id, rate, timestamp)
          VALUES ($1, $2, NOW())
        `,
        [currencyPairId, rate]
      );

      console.log(`💱 Курс обновлён: 1 USDT = ${rate} RUB`);
    } catch (err) {
      console.error('❌ Ошибка при обновлении курса:', err.message);
    }
  }

  startAutoUpdate() {
    this.updateRate(); // Первый вызов при старте
    setInterval(() => this.updateRate(), 6 * 60 * 60 * 1000); // Каждые 6 часов
  }
}

module.exports = new CursService();
