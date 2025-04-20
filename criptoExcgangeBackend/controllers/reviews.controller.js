const db = require('../db')

class reviewsController {
  async getReviews(req, res) {
    try {
      const data = await db.query(
        `
          SELECT
            id,
            text,
            author_name,
            created_at,
            rating,
            client_uuid
          FROM reviews
        `
      );

      res.status(200).json(data.rows)
    } catch (err) {
      res.status(400).json(err.message);
    }
  }

  async createReviews(req, res) {
    try {
      const { text, author_name, rating, uuid } = req.body;

      if (!author_name || !rating) throw new Error("Недостаточно данных");

      await db.query(
        `
          INSERT INTO reviews
          (
            text, author_name, rating, client_uuid
          )
          VALUES
          (
            $1, $2, $3, $4
          )
        `,[ text, author_name, rating, uuid ]
      );

      res.status(201).json("OK");
    } catch (err) {
      res.status(400).json(err.message);
    }
  }

  async updateReviews(req, res) {
    try {
      const id = req.params.id;
      const { text, author_name, rating } = req.body;

      if (!id) throw new Error("Введите идентификатор");
      if (!author_name || !rating) throw new Error("Недостаточно данных");

      await db.query(
        `
          UPDATE reviews
          SET
            text = $1,
            author_name = $2,
            rating = $3
          WHERE
            id = $4
        `, [ text, author_name, rating, id ]
      );

      res.status(203).json("OK");
    } catch (err) {
      res.status(400).json(err.message);
    }
  }

  async deleteReview(req, res) {
    try {
      const id = req.params.id;

      if (!id) throw new Error("Введите идентификатор");

      await db.query(
        `
          DELETE FROM reviews
          WHERE id = $1
        `, [ id ]
      );

      res.status(204).json("OK");
    } catch (err) {
      res.status(400).json(err.message);
    }
  }
}

module.exports = new reviewsController();