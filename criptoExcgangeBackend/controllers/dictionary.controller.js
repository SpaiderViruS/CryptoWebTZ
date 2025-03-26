const db = require('../db')

class dictionaryController {
  async getData(req, res) {
    try {
      const dictName = req.params.dictName

      if (!dictName) throw new Error(`Недостаточно данных`);

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
}

module.exports = new dictionaryController();