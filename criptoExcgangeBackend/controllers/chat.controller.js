const db = require('../db');

class chatController {
  async getAllChatFromManager(req, res) {
    try {
      const id = req.params.id;

      if (!id) throw new Error("Укажите идентификатор менеджера")

      const data = await db.query(
        `
          SELECT
            manager_id,
            client_id,
            text
          FROM chat
          WHERE
            manager_id = $1
        `, [ id ]
      );

      res.status(200).json(data.rows);
    } catch (err) {
      res.status(400).json(err.message)
    }
  }

  async sendMessage(req, res) {
    try {
      const { text } = req.body
      const id = req.params.id;

      if (!text || !id) throw new Error("Недостаточно данных")

      await db.query(
        `
          INSERT INTO chat
          (
            manager_id, text
          )
          VALUES ($1, $2)
        `, [ id, text ]
      );

      res.status(201).json("OK");
    } catch (err) {
      res.status(400).json(err.message);
    }
  }

  async deleteMessage(req, res) {
    try {
      const id = req.params.id;

      if (!id) throw new Error("Введите идентификатор");

      await db.query(
        `
          DELETE FROM chat
          WHERE id = $1
        `, [ id ]
      );

      res.status(204).json("OK")
    } catch (err) {
      res.status(400).josn(err.message);
    }
  }
}

module.exports = new chatController