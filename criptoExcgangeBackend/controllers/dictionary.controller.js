const db = require('../db')
const allowedTables = ['currencys']

class dictionaryController {
  async getData(req, res) {
    try {
      const dictName = req.params.dictName

      if (!dictName) throw new Error(`Недостаточно данных`);
      if (!allowedTables.includes(dictName)) {
        throw new Error('Недопустимое имя таблицы');
      }

      const data = await db.query(
        `
          SELECT * FROM ${dictName}
        `,
      );

      res.status(200).json(data.rows);
    } catch (err) {
      res.status(400).json(err.message)
    }
  }

  async getOneRowData(req, res) {
    try {
      const dictName =  req.params.dictName;
      const id = req.params.id;

      if (!dictName) throw new Error(`Укажите наименование спр`);
      if (!id) throw new Error(`Укажите идентификатор`);
      if (!allowedTables.includes(dictName)) {
        throw new Error('Недопустимое имя таблицы');
      }

      const data = await db.query(
        `
          SELECT * FROM ${dictName}
          WHERE id = $1
        `, [ id ]
      );

      res.status(200).json(data.rows[0])
    } catch(err) {
      res.status(400).json(err.message)
    }
  }

  async createData(req, res) {
    try {
      const dictName = req.params.dictName

      const { value_full, value_short } = req.body;

      if (!dictName) throw new Error(`Укажите наименование спр`)
      if (!value_full && !value_short) throw new Error(`Недостаточно данных`);
      if (!allowedTables.includes(dictName)) {
        throw new Error('Недопустимое имя таблицы');
      }

      const id = await db.query(
        `
          INSERT INTO ${dictName}
          (
            value_full, value_short
          )
          VALUES
          ($1, $2)
          RETURNING id
        `, [ value_full, value_short ]
      );

      res.status(201).json(id.rows[0].id)
    } catch (err) {
      res.status(400).json(err.message)
    }
  }

  async updateData(req, res) {
    try {
      const dictName =  req.params.dictName;
      const id = req.params.id

      const { value_full, value_short } = req.body;

      if (!dictName) throw new Error(`Укажите наименование спр`);
      if (!id) throw new Error(`Укажите идентификатор`);
      if (!value_full && !value_short) throw new Error(`Недостаточно данных`);
      if (!allowedTables.includes(dictName)) {
        throw new Error('Недопустимое имя таблицы');
      }

      await db.query(
        `
          UPDATE ${dictName}
          SET
            value_full = $1,
            value_short = $2
          WHERE
            id = $3
        `, [ value_full, value_short, id ]
      );

      res.status(202).json("OK")
    } catch(err) {
      res.status(400).json(err.message)
    }
  }

  async deleteData(req, res) {
    try {
      const dictName =  req.params.dictName;
      const id = req.params.id

      if (!dictName) throw new Error(`Укажите наименование спр`);
      if (!id) throw new Error(`Укажите идентификатор`);
      if (!allowedTables.includes(dictName)) {
        throw new Error('Недопустимое имя таблицы');
      }

      await db.query(
        `
          DELETE FROM ${dictName}
          WHERE id = $1
        `, [ id ]
      );

      res.status(204).json("OK")
    } catch(err) {
      res.status(400).json(err.message);
    }
  }
}

module.exports = new dictionaryController();