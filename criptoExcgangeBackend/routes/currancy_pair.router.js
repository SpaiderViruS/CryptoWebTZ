const Router = require('express');
const router = new Router();

const currencyController = require('../controllers/currancy_pair.controller');

router.get('/', currencyController.getAllPais);
router.get('/:id', currencyController.getPair);
router.post('/', currencyController.createPair);
router.put('/', currencyController.updatePair);
router.put('/activity/:id', currencyController.changeActivity);
router.delete('/:id', currencyController.deletePair)

module.exports = router;