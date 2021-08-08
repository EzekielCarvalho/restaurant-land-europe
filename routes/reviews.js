//This route is made as part of the process of taking off the load from the app.js so that each route has their own separate folder and file

const express = require('express');
const router = express.Router({ mergeParams : true });  //Express router handles and keeps params of routers separately so if this command is not set to true, then it won't recognize any new reviews that are posted in the site. Hence they have to be merged with this command
const catchAsync = require('../utils/catchAsync'); //necessary to use the try catch function catchAsync so that errors are caught and handled. You have to use .. (double dots) because of going up one level and into models or utils
const Review = require('../models/review');       //to connect the data from review.js page to here
const Restaurant = require('../models/restaurantspecs');  //necessary to connect to the schema
const reviews = require('../controllers/reviews'); //necessary to connect to the reviews controller
const ExpressError = require('../utils/ExpressError'); //necessary for using the Express error class
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');    //necessary to use the validateReview and isLoggedIn and isReviewAuthor middleware

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))  //connects to the reviews.createReview controller

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))    //connects to the rebiews.deleteReview controller

module.exports = router;