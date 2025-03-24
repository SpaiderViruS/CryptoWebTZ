const express = require('express');
const cors = require('cors');

const app = express();

// объявление роутеров
const ExchReqRouter = require('./routes/exchangeRequest.router')
const UserRouter = require('./routes/user.router');

const Router = express.Router();

app.use(express.json());
app.use(cors());

// Имя роутеров
app.use('/exchangeReq', ExchReqRouter)
app.use('/users', UserRouter)

app.listen(3000, () => console.log('Сервер работает на порту 3000'));