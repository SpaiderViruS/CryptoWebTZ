const Router = require('express');
const router = new Router();

const exchangeRequestController = require('../controllers/exchangeRequest.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, exchangeRequestController.getAllExcnages);
router.get('/:uuid', exchangeRequestController.getExchangeByUUID);
router.post('/', exchangeRequestController.newRequest);

module.exports = router;