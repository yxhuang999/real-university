const express = require('express');
const router = express.Router();
const passport = require('passport');

const catchAsync = require('../utils/catchAsync');
const { storeReturnTo } = require('../middleware');
const userController = require('../controllers/userController');

// register a user
router.get('/register', userController.renderRegisterForm);

router.post('/register', catchAsync(userController.register));

// login a user (authenticate)
router.get('/login', userController.renderLoginForm);

router.post('/login',
    storeReturnTo,
    passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login'
    }),
    userController.login);

// logout a user
router.get('/logout', userController.logout);

module.exports = router;