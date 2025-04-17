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
          ORDER BY timestamp
        `, [ id ]
      );

      res.status(200).json(data.rows);
    } catch (err) {
      res.status(400).json(err.message)
    }
  }

  async sendMessage(req, res) {
    try {
      const { text, from_type, from_id } = req.body;

      let session = await db.query(
        `
          SELECT id FROM chat_sessions
          WHERE client_id = $1
          ORDER BY created_at DESC
          LIMIT 1
        `,
        [from_type === 'client' ? from_id : null]
      );
      
      let sessionId;
      
      if (session.rows.length) {
        sessionId = session.rows[0].id;
      } else {
        const newSession = await db.query(
          `
            INSERT INTO chat_sessions (client_id)
            VALUES ($1)
            RETURNING id
          `,
          [from_type === 'client' ? from_id : null]
        );
        sessionId = newSession.rows[0].id;
      }
      
      await db.query(
        `
          INSERT INTO chat (chat_session_id, text, from_type, from_id)
          VALUES ($1, $2, $3, $4)
        `,
        [sessionId, text, from_type, from_id]
      );

      res.status(201).json("OK")
    } catch (err) {
      res.status(400).json(err.message)
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