const Router = require('express');
const router = new Router();

const feesLimitController = require('../controllers/fees_limits.controller');

router.get('/', feesLimitController.getLimits);
router.get('/:id', feesLimitController.getOneLimit);
router.post('/', feesLimitController.createLimit);
router.put('/', feesLimitController.updateLimit);
router.delete('/:id', feesLimitController.deleteLimit);

module.exports = router;