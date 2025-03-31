const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const ExchReqRouter = require('./routes/exchangeRequest.router');
const UserRouter = require('./routes/user.router');
const curencyRouter = require('./routes/currancy_pair.router');
const feesRouter = require('./routes/fees_limits.router');
const dictRouter = require('./routes/dictionary.router')
const contactsRouter = require('./routes/notificationContacts.router')

app.use(express.json());

app.use(cors({
  origin: '*', // или конкретный домен, если хочешь ограничить
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use('/exchangeReq', ExchReqRouter);
app.use('/users', UserRouter);
app.use('/curency_pair', curencyRouter);
app.use('/fees_limit', feesRouter);
app.use('/contacts', contactsRouter)
app.use('/dictionary', dictRouter)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// app.listen(3000, () => console.log('Сервер работает на порту 3000'));