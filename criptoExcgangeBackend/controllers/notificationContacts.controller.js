const db = require('../db')

class notificationController {
  async getNotifs(req, res) {
    try {
      const data = await db.query(
        `
          SELECT * FROM notification_contacts
        `
      );

      res.status(200).json(data.rows);
    } catch(err) {
      res.status(400).json(err.message)
    }
  }

  async getOneNotif(req, res) {
    try {
      const id = req.params.id

      if (!id) throw new Error(`Введите идентификатор`)

      const data = await db.query(
        `
          SELECT * FROM notification_contacts
          WHERE id = $1
        `, [ id ]
      );

      res.status(200).json(data.rows[0])
    } catch(err) {
      res.status(400).json(err.message)
    }
  }

  async createNotif(req, res) {
    try {
      const { telegram_account, is_active = false } = req.body;

      if (!telegram_account) throw new Error(`Недостаточно данных`);

      const id = await db.query(
        `
          INSERT INTO notification_contacts
          (
            telegram_account, is_active
          )
          VALUES
          ($1, $2)
          RETURNING id
        `, [ telegram_account, is_active ]
      );

      res.status(201).json(id.rows[0].id)
    } catch (err) {
      res.status(400).json(err.message)
    }
  }

  async updateNotif(req, res) {
    try {
      const id = req.params.id
      const { telegram_account, is_active } = req.body;

      if (!id) throw new Error(`Введите идентификатор`);
      if (!telegram_account || !is_active) throw new Error(`Недостаточно данных`)

      await db.query(
        `
          UPDATE notification_contacts
          SET
            telegram_account = $1,
            is_active = $2
          WHERE
            id = $3
        `, [ telegram_account, is_active, id ]
      );

      res.status(202).json("OK")
    } catch(err) {
      res.status(400).json(err.message)
    }
  }

  async changeActivity(req, res) {
    try {
      const id = req.params.id;
      const { is_active = false } = req.body;

      if (!id) throw new Error(`Введите идентификатор`);

      await db.query(
        `
          UPDATE notification_contacts
          SET
            is_active = $1
          WHERE
            id = $2
        `, [ is_active, id ]
      );

      res.status(202).json("OK")
    } catch(err) {
      res.status(400).json(err.message)
    }
  }

  async deleteNotif(req, res) {
    try {
      const id = req.params.id;

      if (!id) throw new Error(`Введите идентификатор`);

      await db.query(
        `
          DELETE FROM notification_contacts
          WHERE id = $1
        `, [ id ]
      );

      res.status(204).json("OK")
    } catch(err) {
      res.status(400).json(err.message)
    }
  }
}

module.exports = new notificationController();