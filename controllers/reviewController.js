const University = require('../models/university');
const Review = require('../models/review');

module.exports.addReview = async (req, res) => {
    const uni = await University.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;

    // add the new review to the university instance
    uni.reviews.push(review);
    await review.save();
    await uni.save();
    req.flash('success', 'New review created successfully');
    res.redirect(`/universities/${uni._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    // $pull operator in Mongo: removes from an existing array all instances of a value or values that
    // match a specific condition
    await University.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // remove the review from review database
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully');
    res.redirect(`/universities/${id}`);
};