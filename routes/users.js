//This route is made as part of the process of taking off the load from the app.js so that each route has their own separate folder and file using express

const express = require('express');
const router = express.Router();
const User = require('../models/user');     //required to connect to the user model
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const users = require('../controllers/users') // connects to the users.js controller

router.route('/register')       //refer to routes/restaurants.js line 13
        .get(users.renderRegister)// connects to the renderRegister controller
        .post(catchAsync(users.register))  //connects to the register controller

router.route('/login')
        .get(users.renderLogin)    //connects to the renderLogin controller
//This is where the actual logging in takes place
        .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)   //connects to the login controller

router.get('/logout', users.logout);    //connects to the logout controller

module.exports = router;