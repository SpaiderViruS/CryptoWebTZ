const Router = require('express');
const router = new Router();

const exchangeRequestController = require('../controllers/exchangeRequest.controller');

router.get('/', exchangeRequestController.getAllExcnages);
router.post('/', exchangeRequestController.newRequest);

module.exports = router;