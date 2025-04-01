const db = require('../db');

class Currancy_pairController {
  async getAllPais(req, res) {
    try {
      const cp = await db.query(
        `
          SELECT
            cp.id,
            cp.is_active,
            cp.icon,
            cp.created_at,
            cp.updated_at,
            cb.value_short AS buy_currency,
            cs.value_short AS sell_currency,

            fs.currency_pair_id,
            fs.commission,
            fs.min_amount,
            fs.max_amount
          FROM currency_pairs AS cp
            JOIN currencys AS cb ON cp.buy_currency = cb.id 
            JOIN currencys AS cs ON cp.sell_currency = cs.id 
            LEFT JOIN fees_limits AS fs ON fs.currency_pair_id = cp.id
        `
      );

      res.status(200).json(cp.rows);
    } catch (err) {
      res.status(400).json(err.message);
    }
  }

  async getPair(req, res) {
    try {
      const id = req.params.id;

      if (!id) throw new Error ("Отсутсвует идентификатор");

      const cp = await db.query(
        `
          SELECT
            cp.id,
            cp.is_active,
            cp.icon,
            cp.created_at,
            cp.updated_at,
            cb.value_short AS buy_currency,
            cs.value_short AS sell_currency
          FROM currency_pairs AS cp
            JOIN currencys AS cb ON cp.buy_currency = cb.id 
            JOIN currencys AS cs ON cp.sell_currency = cs.id 
          WHERE cp.id = $1
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

      const id = await db.query(
        `
          INSERT INTO currency_pairs
          (
            sell_currency, buy_currency, is_active
          )
          VALUES
          ($1, $2, true)
          RETURNING id
        `,
        [ sell_currency, buy_currency ]
      );

      res.status(201).json(id.rows[0].id)
    } catch (err) {
      res.status(400).json(err.message)
    }
  }

  async changeActivity(req, res) {
    try {
      const { id, is_active } = req.body;

      if (!id) throw new Error(`Недостаточно данных`);

      await db.query(
        `
          UPDATE currency_pairs
          SET
            is_active = $1
          WHERE
            id = $2
        `, [ is_active, id ]
      );

      res.status(202).json("OK")
    } catch (err) {
      res.status(400).json(err.message);
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
            is_active = $3
          WHERE
            id = $4
        `, [ sell_currency, buy_currency, is_active, id]
      );

      res.status(202).json("OK")
    } catch (err) {
      console.log(err)
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