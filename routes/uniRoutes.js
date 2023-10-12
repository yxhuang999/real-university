const express = require('express');
const router = express.Router();

// image upload using multer and cloudinary
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// utility function used to wrap root async functions to avoid uncaught promise errors to go silent,
// basically avoid the need to use try/catch
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateUniversity, isAuthor } = require('../middleware');
const uniController = require('../controllers/uniController');

// get all universities in database
router.get('/', catchAsync(uniController.index));

// add a new university
router.get('/new', isLoggedIn, uniController.renderNewForm);
// the upload method will return an object of the request body, and an object of the files
router.post('/', isLoggedIn, upload.array('image'), validateUniversity, catchAsync(uniController.create));

// show a single university with its reviews
router.get('/:id', catchAsync(uniController.show));

// edit an existing university
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(uniController.renderEditForm));
router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateUniversity, catchAsync(uniController.update));

// destroy an existing university
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(uniController.destroy));

module.exports = router;