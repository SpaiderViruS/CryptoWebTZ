const Router = require('express');
const router = new Router();

const notifController = require('../controllers/notificationContacts.controller');

router.get('/', notifController.getNotifs);
router.get('/:id', notifController.getOneNotif);
router.post('/', notifController.createNotif);
router.put('/:id', notifController.updateNotif);
router.put('/activity/:id', notifController.changeActivity);
router.delete('/:id', notifController.deleteNotif);

module.exports = router;