const Router = require('express');
const router = new Router();

const dictController = require('../controllers/dictionary.controller');

router.get('/:dictName', dictController.getData);
router.get('/:dictName/:id', dictController.getOneRowData);
router.post('/:dictName', dictController.createData);
router.put('/:dictName/:id', dictController.updateData);
router.delete('/:dictName/:id', dictController.deleteData);

module.exports = router;