const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).send("Нет токена");

  const token = authHeader.split(' ')[1];

  try {
    // Проверка валидности токена
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;

    next();
  } catch (err) {
    console.log(err)
    return res.status(403).send("Невалидный токен");
  }
}

module.exports = authMiddleware;