const db = require('../db');

class feesLimitsController {
  async getLimits(req, res) {
    try {
      const limits = await db.query(
        `
          SELECT * FROM fees_limits
        `
      );

      res.status(200).json(limits.rows);
    } catch (err) {
      res.status(400).json(err.message)
    }
  }

  async getOneLimit(req, res) {
    try {
      const id = req.params.id;

      if (!id) throw new Error ("Отсутсвует идентификатор");

      const limit = await db.query(
        `
          SELECT * FROM fees_limits
          WHERE id = $1
        `, [ id ]
      );

      res.status(200).json(limit.rows[0]);
    } catch {
      res.status(400).json(err.message)
    }
  }

  async createLimit(req, res) {
    try {
      const { currency_pair_id, commission, min_amount, max_amount } = req.body;

      if (!currency_pair_id || !commission || !min_amount || !max_amount) throw new Error("Недостаточно данных");

      const created_at = new Date()
      await db.query(
        `
          INSERT INTO fees_limits
          (
            currency_pair_id, commission, min_amount, max_amount, created_at
          )
          VALUES
          ($1, $2, $3, $4, $5)
        `, [ currency_pair_id, commission, min_amount, max_amount, created_at ]
      );

      res.status(201).json("OK")
    } catch (err) {
      res.status(400).json(err.message)
    }
  }

  async updateLimit(req, res) {
    try {
      // 1. Получаем ID из параметров URL
      const { id } = req.params;
      
      // 2. Получаем только необходимые данные из тела запроса
      const { commission, min_amount, max_amount } = req.body;
      
      // 3. Проверка обязательных полей (без currency_pair_id)
      if (!id || !commission || !min_amount || !max_amount) {
        throw new Error("Недостаточно данных");
      }
  
      // 4. Исправляем опечатку в названии поля
      const updated_at = new Date();Ы
      await db.query(
        `
          UPDATE fees_limits
          SET
            commission = $1,
            min_amount = $2,
            max_amount = $3,
            updated_at = $4
          WHERE
            id = $5
        `, 
        [commission, min_amount, max_amount, updated_at, id]
      );
  
      res.status(200).json({ message: "Лимиты успешно обновлены" });
      
    } catch (err) {
      // 5. Улучшенная обработка ошибок
      console.error("Ошибка обновления лимитов:", err);
      res.status(400).json({
        error: "Ошибка обновления",
        details: err.message
      });
    }
  }

  async deleteLimit(req, res) {
    try {
      const id = req.params.id;

      if (!id) throw new Error ("Отсутсвует идентификатор");

      await db.query(
        `
          DELETE FROM
            fees_limits
          WHERE
            id = $1
        `, [ id ]
      );

      res.status(204).json("OK")
    } catch (err) {
      res.status(400).json(err.message)
    }
  }
}

module.exports = new feesLimitsController();