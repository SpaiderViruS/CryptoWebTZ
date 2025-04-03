
const db = require('../db')
const allowedTables = ['currencys']

class dictionaryController {
  async getData(req, res) {
    try {
      const dictName = req.params.dictName;
  
      if (!dictName) throw new Error(`Недостаточно данных`);
      if (!allowedTables.includes(dictName)) {
        throw new Error('Недопустимое имя таблицы');
      }
  
      const data = await db.query(`SELECT * FROM ${dictName}`);
      const rows = data.rows;
  
      for (const row of rows) {
        if (row.icon_id) {
          const file = await db.query(
            `SELECT file_bin FROM files WHERE id = $1`,
            [row.icon_id]
          );
  
          if (file.rows[0]?.file_bin) {
            row.file_bin = file.rows[0].file_bin.toString('base64');
          }
        }
      }
  
      res.status(200).json({ data: rows });
    } catch (err) {
      res.status(400).json(err.message);
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
      const dictName = req.params.dictName;
  
      const value_full = req.body.value_full;
      const value_short = req.body.value_short;
  
      const file_name = req.body.file_name;
      const file_bin = req.file?.buffer;
  
      if (!dictName) throw new Error(`Укажите наименование справочника`);
      if (!value_full || !value_short) throw new Error(`Недостаточно данных`);
      if (!allowedTables.includes(dictName)) {
        throw new Error('Недопустимое имя таблицы');
      }
  
      let file_id = null;
  
      if (req.file && file_name && file_bin) {
        const file = await db.query(
          `
            INSERT INTO files
            (
              file_name, file_bin, content_id
            )
            VALUES
            ($1, $2, $3)
            RETURNING id
          `,
          [file_name, file_bin, 2]
        );
        file_id = file.rows[0].id;
      }
  
      const id = await db.query(
        `
          INSERT INTO ${dictName}
          (
            value_full, value_short, icon_id
          )
          VALUES
          ($1, $2, $3)
          RETURNING id
        `,
        [value_full, value_short, file_id]
      );
  
      res.status(201).json(id.rows[0].id);
    } catch (err) {
      console.error(err);
      res.status(400).json(err.message);
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
