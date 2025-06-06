const Router = require('express');
const router = new Router();

const feesLimitController = require('../controllers/fees_limits.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', feesLimitController.getLimits);
router.get('/:id', authMiddleware, feesLimitController.getOneLimit);
router.post('/', authMiddleware, feesLimitController.createLimit);
router.put('/:id', authMiddleware, feesLimitController.updateLimit);
router.delete('/:id', authMiddleware, feesLimitController.deleteLimit);

module.exports = router;