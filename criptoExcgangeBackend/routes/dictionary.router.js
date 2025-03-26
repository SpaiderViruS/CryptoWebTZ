
const Router = require('express');
const router = new Router();

const dictController = require('../controllers/dictionary.controller');

router.get('/:dictName', dictController.getData);

// router.get('/', currencyController.getAllPais);
// router.get('/:id', currencyController.getPair);
// router.post('/', currencyController.createPair);
// router.put('/', currencyController.updatePair);
// router.put('/activity/:id', currencyController.changeActivity);
// router.delete('/:id', currencyController.deletePair)

module.exports = router;
