const Router = require('express');
const router = new Router();

const currencyController = require('../controllers/currancy_pair.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', currencyController.getAllPais);
router.get('/:id', currencyController.getPair);
router.post('/', authMiddleware, currencyController.createPair);
router.put('/', authMiddleware, currencyController.updatePair);
router.put('/activity/:id', authMiddleware, currencyController.changeActivity);
router.delete('/:id', authMiddleware, currencyController.deletePair)

module.exports = router;