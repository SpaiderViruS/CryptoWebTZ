const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

const ExchReqRouter = require('./routes/exchangeRequest.router');
const UserRouter = require('./routes/user.router');
const curencyRouter = require('./routes/currancy_pair.router');
const feesRouter = require('./routes/fees_limits.router');
const dictRouter = require('./routes/dictionary.router');
const contactsRouter = require('./routes/notificationContacts.router');
const cursRouter = require('./routes/curs.route');
const chatRouter = require('./routes/chat.router');

const cursService = require('./services/curs.service');

const upload = multer();

app.use(express.json());
app.use(upload.single('file'));

app.use(cors());

app.use('/exchangeReq', ExchReqRouter);
app.use('/users', UserRouter);
app.use('/curency_pair', curencyRouter);
app.use('/fees_limit', feesRouter);
app.use('/contacts', contactsRouter)
app.use('/dictionary', dictRouter)
app.use('/curs', cursRouter);
app.use('/chat', chatRouter);

// Автообновление при запуске курса
cursService.startAutoUpdate();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});