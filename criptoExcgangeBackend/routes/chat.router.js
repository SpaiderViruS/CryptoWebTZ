const Router = require('express');
const router = new Router();

const chatController = require('../controllers/chat.controller');

router.get('/:id', chatController.getAllChatFromManager);
router.post('/:id', chatController.sendMessage);
router.delete('/:id', chatController.deleteMessage);

module.exports = router;
