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
      const { currancy_pair_id, commission, min_amount, max_amount } = req.body;

      if (!currancy_pair_id || !commission || !min_amount || !max_amount) throw new Error("Недостаточно данных");

      const created_at = new Date()
      await db.query(
        `
          INSERT INTO fees_limits
          (
            currancy_pair_id, commission, min_amount, max_amount, created_at
          )
          VALUES
          ($1, $2, $3, $4, $5)
        `, [ currancy_pair_id, commission, min_amount, max_amount, created_at ]
      );

      res.status(201).json("OK")
    } catch (err) {
      res.status(400).json(err.message)
    }
  }

  async updateLimit(req, res) {
    try {
      const { id, currancy_pair_id, commission, min_amount, max_amount } = req.body;

      if (!id || !currancy_pair_id || !commission || !min_amount || !max_amount) throw new Error ("Недостаточно данных");

      const updated_at = new Date()
      await db.query(
        `
          UPDATE fees_limits
          SET
            currancy_pair_id = $1,
            commission = $2,
            min_amount = $3,
            max_amount = $4,
            updated_at = $5
          WHERE
            id = $6
        `, [ currancy_pair_id, commission, min_amount, max_amount, updated_at, id ]
      );

      res.status(202).json("OK")
    } catch (err) {
      res.status(400).json(err.message)
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