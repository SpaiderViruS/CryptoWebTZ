const db = require('../db');

class Currancy_pairController {
  async getAllPais(req, res) {
    try {
      const cp = await db.query(
        `
          SELECT * FROM currency_pairs
        `
      );

      res.status(200).json(cp.rows);
    } catch (err) {
      res.status(400).json(err.message)
    }
  }

  async getPair(req, res) {
    try {
      const id = req.params.id;

      if (!id) throw new Error ("Отсутсвует идентификатор");

      const cp = await db.query(
        `
          SELECT * FROM currency_pairs
          WHERE id = $1
        `, [ id ]
      );

      res.status(200).json(cp.rows[0]);
    } catch (err) {
      res.status(400).json(err.message)
    }
  }

  async createPair(req, res) {
    try {
      const { sell_currency, buy_currency, icon } = req.body;

      if (!sell_currency || !buy_currency) throw new Error("Недостаточно данных");

      await db.query(
        `
          INSERT INTO currency_pairs
          (
            sell_currency, buy_currency, is_active
          )
          VALUES
          ($1, $2, true)
        `,
        [ sell_currency, buy_currency ]
      );

      res.status(201).json("OK")
    } catch (err) {
      res.status(400).json(err.message)
    }
  }

  async updatePair(req, res) {
    try {
      const { sell_currency, buy_currency, is_active, id } = req.body;

      if (!sell_currency || !buy_currency || !id) throw new Error("Недостаточно данных");
      await db.query(
        `
          UPDATE currency_pairs
          SET
            sell_currency = $1,
            buy_currency = $2,
            is_active = $3,
          WHERE
            id = $4
        `, [ sell_currency, buy_currency, is_active, id]
      );

      res.status(202).json("OK")
    } catch (err) {
      res.status(400).json(err.message)
    }
  }

  async deletePair(req, res) {
    try {
      const id = req.params.id;

      if (!id) throw new Error ("Отсутсвует идентификатор");

      await db.query(
        `
          DELETE FROM
            currency_pairs
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

module.exports = new Currancy_pairController();