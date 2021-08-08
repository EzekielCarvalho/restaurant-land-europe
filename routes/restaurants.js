//This file has been made as a main file instead of using router.js
// Express router is a class which helps us to create router handlers. By router handler i mean to not just providing routing to our app but also can extend this routing to handle validation, handle 404 or other errors etc.

const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync'); //necessary to use the try catch function catchAsync so that errors are caught and handled. You have to use .. (double dots) because of going up one level and into models or utils
const { isLoggedIn, isAuthor, validateRestaurant } = require('../middleware'); // necessary to connect the isLoggedIn authentication and two other middleware
const restaurants = require('../controllers/restaurants');  //necessary to connect to the controller
const Restaurant = require('../models/restaurantspecs');  //necessary to connect to the schema

const {storage} = require('../cloudinary'); //line 12 cloudinary folder index.js file. to connect to the cloudinary folder, to the indexjs file (which node automatically looks for so you dont have to specify index.js)
const multer  = require('multer');     //this is necessary to parse the form data and files sent from the form  ref https://www.npmjs.com/package/multer
const upload = multer({ storage });   //this is necessary as part of using multer to display where to send the files sent from the form. The "storage" is from cloudinary folder, index.js file line 12. This is where the files sent by the user via the form are going to be stored.

// you dont have to use "/restuarants" but instead can use "/" because restaurants is being called in app.js

// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



router.get("/", function(req, res){             //FOR SEARCH BAR FUNCTIONING
        var noMatch = null;
        if(req.query.search) {
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            // Get all restaurants from DB
            Restaurant.find({$or:[{location: regex},{title:regex}]}, function(err, allRestaurants){             //allows you to enter either location or name of restaurant on the search bar with regex capabilities
               if(err){
                   console.log(err);
               } else {
                  if(allRestaurants.length < 1) {
                      noMatch = "No Restaurants match that query, please try again.";
                  }
                  res.render("restaurants/index",{restaurants:allRestaurants, noMatch: noMatch});
               }
            });
        } else {
            // Get all restaurants from DB
            Restaurant.find({}, function(err, allRestaurants){
               if(err){
                   console.log(err);
               } else {
                  res.render("restaurants/index",{restaurants:allRestaurants, noMatch: noMatch});
               }
            });
        }
    });

router.route('/')       //NO SEMICOLONS FOR THE ROUTES BELOW! this uses "route" from Express to prevent unnecessary duplication of route requests such as get, post, put all to the same route (in this case the home route). Ref to http://expressjs.com/en/5x/api.html#router.route
        .get(catchAsync(restaurants.index))       //connects to the controller index
        .post(isLoggedIn, upload.array('image'), validateRestaurant, catchAsync(restaurants.createRestaurant))  //for upload.array('image') is multer middleware and that "image". This is for uploading the image. name is from line 20 new.ejs file. connects to the controller createRestaurant



//IMPORTANT!!Remember that the order of the routes is important otherwise the app will break!!

router.get('/new', isLoggedIn, restaurants.renderNewForm)   //connects to the controller renderNewForm



router.route('/:id')
        .get(catchAsync(restaurants.showRestaurant))     //connects to the controller showRestaurant
        .put(isLoggedIn, isAuthor, upload.array('image'), validateRestaurant, catchAsync(restaurants.updateRestaurant)) //connects to the updateRestaurant controller. upload.array('image') is from multer to allow the uploading of multiple files sent via the form
        .delete(isLoggedIn, isAuthor, catchAsync(restaurants.deleteRestaurant)) //connects to the deleteRestaurant controller
        
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(restaurants.renderEditForm));  //connects to the controller renderEditForm

function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };


module.exports = router