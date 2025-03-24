const express = require('express');
const cors = require('cors');

const app = express();

const ExchReqRouter = require('./routes/exchangeRequest.router');
const UserRouter = require('./routes/user.router');
const curencyRouter = require('./routes/currancy_pair.router');
const feesRouter = require('./routes/fees_limits.router');

const Router = express.Router();

app.use(express.json());
app.use(cors());

app.use('/exchangeReq', ExchReqRouter);
app.use('/users', UserRouter);
app.use('/curencyRouter', curencyRouter);
app.use('/fees_limit', feesRouter);

app.listen(3000, () => console.log('Сервер работает на порту 3000'));