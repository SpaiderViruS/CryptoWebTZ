const axios = require('axios');
const db = require('../db');

class CursService {
  constructor() {
    this.API_URL = 'https://api.rapira.net/open/market/rates';
    this.API_KEY = process.env.RAPIRA_API_KEY;
    this.CURRENCY_PAIR_ID = 1; // USDT/RUB
  }

  async updateRate() {
    try {
      const resp = await axios.get(this.API_URL, {
        params: { pair: 'USDT_RUB' },
        headers: { 'X-API-KEY': this.API_KEY }
      });

      const rate = resp.data?.data.find((symb) => symb.symbol === 'USDT/RUB');
      if (!rate) throw new Error('Нет курса в ответе');

      await db.query(`
        INSERT INTO exchange_rates (currency_pair_id, rate, timestamp)
        VALUES ($1, $2, NOW())
      `, [this.CURRENCY_PAIR_ID, rate.close]);

      console.log(`💱 USDT/RUB обновлён: ${rate.close}`);
    } catch (err) {
      console.error('Ошибка обновления курса Rapira:', err.response?.data || err.message);
    }
  }

  startAutoUpdate() {
    this.updateRate();
    setInterval(() => this.updateRate(), 6 * 3600 * 1000);
  }
}

module.exports = new CursService();
