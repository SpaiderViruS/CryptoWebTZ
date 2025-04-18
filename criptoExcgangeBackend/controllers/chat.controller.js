const db = require('../db');

class chatController {
  async getAllChatFromManager(req, res) {
    try {
      const id = req.params.id;
  
      if (!id) throw new Error("Укажите идентификатор менеджера");
  
      const data = await db.query(
        `
        SELECT
        c.text,
        c.timestamp,
        s.client_id,
        s.manager_id,
        c.from_type,
        c.from_id
      FROM chat c
      JOIN chat_sessions s ON c.chat_session_id = s.id
      WHERE s.manager_id = $1 OR s.manager_id IS NULL
      ORDER BY c.timestamp
        `,
        [id]
      );

      res.status(200).json(data.rows);
    } catch (err) {
      res.status(400).json(err.message);
    }
  }

  async sendMessage(req, res) {
    try {
      const { text, from_type, from_id, client_id } = req.body;
  
      if (!text || !from_type || !from_id) throw new Error('Недостаточно данных');
      if (!['client', 'manager'].includes(from_type)) throw new Error('Некорректный тип отправителя');

      const clientId = from_type === 'client' ? from_id : client_id;
      if (!clientId) throw new Error('client_id обязателен');
  
      let sessionQuery;
      let sessionParams;
  
      if (from_type === 'manager') {
        sessionQuery = `
          SELECT id FROM chat_sessions
          WHERE client_id = $1 AND manager_id = $2
          ORDER BY created_at DESC
          LIMIT 1
        `;
        sessionParams = [clientId, from_id];
      } else {
        sessionQuery = `
          SELECT id FROM chat_sessions
          WHERE client_id = $1
          ORDER BY created_at DESC
          LIMIT 1
        `;
        sessionParams = [clientId];
      }
  
      let session = await db.query(sessionQuery, sessionParams);
  
      let sessionId;
  
      if (session.rows.length) {
        sessionId = session.rows[0].id;
      } else {
        const insertSession = await db.query(
          `
            INSERT INTO chat_sessions (client_id, manager_id)
            VALUES ($1, $2)
            RETURNING id
          `,
          [clientId, from_type === 'manager' ? from_id : null]
        );
        sessionId = insertSession.rows[0].id;
      }
  
      await db.query(
        `
          INSERT INTO chat (chat_session_id, text, from_type, from_id)
          VALUES ($1, $2, $3, $4)
        `,
        [sessionId, text, from_type, from_id]
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