const cursService = require('../services/curs.service');
const db = require('../db');

class CursController {
  async updateRate(req, res) {
    await cursService.updateRate();
    res.json({ message: 'Курс обновлён вручную' });
  }

  async getCursRate(req, res) {
    try {
      const data = await db.query(
        `
          SELECT rate, timestamp
          FROM exchange_rates
          ORDER BY timestamp DESC
          LIMIT 1
        `
      );
      res.status(200).json(data.rows[0])
    } catch (err) {
      res.status(400).json(err.message)
    }
  }
}

module.exports = new CursController();
