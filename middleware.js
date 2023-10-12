const ExpressError = require('./utils/ExpressError');

const University = require('./models/university');
const Review = require('./models/review');
const { universitySchema, reviewSchema } = require('./schemas.js');

// check if a user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must sign in first');
        return res.redirect('/login');
    }
    next();
};

// define a middleware function that validates university model data inputs using Joi
// so that we don't have to throw database related errors in every methods we define
module.exports.validateUniversity = (req, res, next) => {
    // put data in the request body to the schema.js and validate it against the defined requirements set up using Joi
    const { error } = universitySchema.validate(req.body);
    // if there is an error in result
    if (error) {
        // map all details together if there are multiple of them
        const msg = error.details.map(el => el.message).join(',')
        // the new error will be handled by our custom error handling middleware
        throw new ExpressError(msg, 400)
    } else {
        // if there is no error, continue to the next middleware
        next();
    }
};

// check if the current user is the author of a university
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const uni = await University.findById(id);
    if (!uni.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permission to do that!');
        return res.redirect(`/universities/${id}`);
    }
    next();
};

// store the page the user was previously on to res.locals
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permission to do that!');
        return res.redirect(`/universities/${id}`);
    }
    next();
};