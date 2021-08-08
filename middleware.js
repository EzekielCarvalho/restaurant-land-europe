//This is going to be our logging in authentication portal middleware

const { restaurantSchema} = require('./schemas.js');       //this is to join the Joi schema from schema.js to the app.js file
const ExpressError = require('./utils/ExpressError') //necessary for using the Express error class
const Restaurant = require('./models/restaurantspecs');  //necessary to connect to the schema
const {  reviewSchema } = require('./schemas.js');       //this is to join the Joi schema from schema.js to the app.js file
const Review = require('./models/review');    //necessary

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {    //this 'isAuthenticated' is from passport to serve as an authentication portal provided by passport
      //store the url the user is requesting
        req.flash('error', 'You must be signed in to do that!!');   //if you are not authenticated, this will be triggered
        return res.redirect('/login');
    }
    next();     //if you're already autheticated, next will be triggered and move you to being logged in
}

module.exports.validateRestaurant = (req, res, next) => {    //app.use was not used here because we did not want this middleware to run on every route. We want it to be selectively applied. All middleware has to have (req, res, next)
  const { error } = restaurantSchema.validate(req.body);          //This passes the data (req.body)  through to the Joi schema, and it destructures taking the error
  if (error) {                    //if there is an error
      const msg = error.details.map(el => el.message).join(',')     //the map method is used to map each element in an erray into something else such as a string. A new array will be created for this with the elements inserted into the array. The join feature is used to join something (, comma) in this case
          //for each element that you get from error.details, take it and makes a single string message and join it with a ",". This will be saved to the variable "msg" which will be entered as the message section for "ExpressError"
      throw new ExpressError(msg, 400)        // so if there is an error, then the ExpressError is thrown for which it is caught because of the route being in catchAsync
  } else {

  next();               //so that whereever this function validateRestaurant is called, that it will proceed with running the route handler (eg. app.post)
    }
}

module.exports.isAuthor = async(req, res, next) => {     //this is the middleware for checking if the restaurant's author matches with the logged in user ID 
  const { id } = req.params;
  //Does this restaurant have the same author id as the currently logged in user?
   const restaurant = await Restaurant.findById(id);       //find the restaurant by ID
   if(!restaurant.author.equals(req.user._id)) {       //if the author does NOT match with the user ID
       req.flash('error', 'You are not authorized to do that!!!')  //then flash this error message
       return res.redirect(`/restaurants/${id}`);             //and redirect to this page
   }
   next()
}

module.exports.isReviewAuthor = async(req, res, next) => {     //this is the middleware for checking if the restaurant's author matches with the logged in user ID 
  const { id, reviewId } = req.params;   //to take the review ID from the addressbar (params)
  //Does this review have the same author id as the currently logged in user?
   const review = await Review.findById(reviewId);       //find the review by ID
   if(!review.author.equals(req.user._id)) {       //if the author does NOT match with the user ID
       req.flash('error', 'You are not authorized to do that!!!')  //then flash this error message
       return res.redirect(`/restaurants/${id}`);             //and redirect to this page
   }
   next();
}

module.exports.validateReview = (req, res, next) => {    //This is for the review section. app.use was not used here because we did not want this middleware to run on every route. We want it to be selectively applied. All middleware has to have (req, res, next)
    const { error } = reviewSchema.validate(req.body)         //This passes the data (req.body)  through to the Joi schema, and it destructures taking the error
    if (error) {                    //if there is an error
        const msg = error.details.map(el => el.message).join(',')     //the map method is used to map each element in an erray into something else such as a string. A new array will be created for this with the elements inserted into the array. The join feature is used to join something (, comma) in this case
            //for each element that you get from error.details, take it and makes a single string message and join it with a ",". This will be saved to the variable "msg" which will be entered as the message section for "ExpressError"
        throw new ExpressError(msg, 400)        // so if there is an error, then the ExpressError is thrown for which it is caught because of the route being in catchAsync
    } else {

    next();               //so that whereever this function validateRestaurant is called, that it will proceed with running the route handler (eg. app.post)
      }
}

