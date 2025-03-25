const Router = require('express');
const router = new Router();

const userRouter = require('../controllers/user.controller');

router.post('/login', userRouter.tryEnter)
router.put('/', userRouter.registerNewUser)

module.exports = router;