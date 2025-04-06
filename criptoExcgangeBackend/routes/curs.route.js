const Router = require('express');
const router = new Router();

const CursController = require('../controllers/curs.controller');

router.get('/updateCurs', CursController.updateRate);
router.get('/', CursController.getCursRate);

module.exports = router;