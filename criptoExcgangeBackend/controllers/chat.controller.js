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
    
      if (!text || !from_type || !from_id) throw new Error('Недостаточно данных')
    
      if (!['client', 'manager'].includes(from_type)) throw new Error('Некорректный тип отправителя')
    
      let query = 
      `
        INSERT INTO chat (text, from_type, ${from_type}_id, timestamp)
        VALUES ($1, $2, $3, now())
      `;
    
      await db.query(query, [text, from_type, from_id]);
    
      res.status(201).json({ status: "OK" });
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