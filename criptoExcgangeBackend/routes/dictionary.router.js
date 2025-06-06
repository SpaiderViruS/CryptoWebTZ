const Router = require('express');
const router = new Router();

const dictController = require('../controllers/dictionary.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/:dictName', dictController.getData);
router.get('/:dictName/:id', dictController.getOneRowData);
router.post('/:dictName', authMiddleware, dictController.createData);
router.put('/:dictName/:id', authMiddleware, dictController.updateData);
router.delete('/:dictName/:id', authMiddleware, dictController.deleteData);

module.exports = router;