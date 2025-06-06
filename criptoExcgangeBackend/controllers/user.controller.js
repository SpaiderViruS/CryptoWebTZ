const db = require('../db')
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY

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

      const token = jwt.sign(
        { id: user.id, email: user.username }, // Полезная нагрузка
        SECRET_KEY,
        { expiresIn: '7d' } //Временно время жизни 7 дней
      );

      res.status(200).json(
        { 
          token, 
          message: "OK"
        });
      res.status(200)
    } catch (err) {
      res.status(400);
      res.json({ message: err.message });
    }
  }

  async registerNewUser(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) throw new Error(`Недостаточно данных`);

      const checkLogins = await db.query(
        `
          SELECT * FROM users
          WHERE username = $1
        `, [ username ]
      );

      if (checkLogins.rows[0]) throw new Error(`Пользователь с таким логином уже зарегистрирован`);

      await db.query(
        `
          INSERT INTO users
          (
            username, password
          )
          VALUES
          (
            $1, $2
          )
        `, [ username, password ]
      );

      res.status(201).json("Пользователь зарегистрирован");
    } catch (err) {
      res.status(400).json(err.message);
    }
  }
}

module.exports = new userController();