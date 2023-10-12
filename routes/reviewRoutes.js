const express = require('express');
// set mergeParams to true to give the child access the parent req.params (/universities/:id/reviews)
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviewController = require('../controllers/reviewController');

// add a new review for a university
router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.addReview));

// delete a review for a university
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview));

module.exports = router;