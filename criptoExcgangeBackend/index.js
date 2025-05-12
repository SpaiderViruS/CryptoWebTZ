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
const reviewRouter = require('./routes/reviews.router');

const cursService = require('./services/curs.service');

const upload = multer();

app.use(express.json());
app.use(upload.single('file'));

const allowedOrigins = [
  'https://cryptowebtz-1.onrender.com', // Прод
  'http://localhost:3000' // локал
];

app.use(cors({
  origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use('/exchangeReq', ExchReqRouter);
app.use('/users', UserRouter);
app.use('/curency_pair', curencyRouter);
app.use('/fees_limit', feesRouter);
app.use('/contacts', contactsRouter)
app.use('/dictionary', dictRouter)
app.use('/curs', cursRouter);
app.use('/chat', chatRouter);
app.use('/review', reviewRouter);

// Автообновление при запуске курса
cursService.startAutoUpdate();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});