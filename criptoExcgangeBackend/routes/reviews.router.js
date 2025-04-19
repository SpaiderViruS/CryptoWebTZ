const Router = require('express');
const router = new Router();

// const notifController = require('../controllers/notificationContacts.controller');
const reviewController = require('../controllers/reviews.controller');

router.get('/', reviewController.getReviews);
router.post('/', reviewController.createReviews);
router.put('/:id', reviewController.updateReviews);
router.delete('/:id', reviewController.deleteReview);;

module.exports = router;