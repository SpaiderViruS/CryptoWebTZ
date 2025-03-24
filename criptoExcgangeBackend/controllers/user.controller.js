const db = require('../db')

class userController {
  async tryEnter(req, res) {
    try {
      const { username, password } = req.body

      if (!username || !password) throw new Error(`Введите логин/пароль`)

      const user = await db.query(
        `
          SELECT * FROM users
          WHERE
            username = $1 AND
            password_hash = $2
        `,
        [
          username, password
        ]
      );

      if (!user.rows[0]) throw new Error(`Неверный логин/пароль`)

      res.json(`OK`)
      res.status(200)
    } catch (err) {
      res.status(400);
      console.log(err);
      res.json({ message: err.message });
    }
  }
}

module.exports = new userController();