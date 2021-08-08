const User = require('../models/user');     //required to connect to the user model

module.exports.renderRegister = (req, res) => {
    res.render('users/register')    // this leads to the register.ejs in the users folder in views
}

module.exports.register = async(req, res, next)=>{     //this is the route which we submit the form to. catchasync is used to ensure that all errors if any, such as from mongoose can be caught with catchasync
    try{         //Its going to try all of this in brackets, and if it's successful, it will flash the success message otherwise if there is an error, it will be caught and the message will be flashed. This try catch was put so that we can get the error in a flash message instead of a separate page
     const { email,username, password } = req.body;  //this destructures i.e. takes these 3 parts from the req.body (what is submitted via the form)
     const user = new User({ email, username });     //creates a new User as per the user in models
     const registeredUser = await User.register(user, password); //register is the method created by passport User.register feeds the data from user to register
     req.login(registeredUser, err => {          //just as "req.logout" is there provided by passport so "req.login" is provided by passport to help you login or keep a person logged in after registering. But a callback is required, hence "err=> {if(err) return next(err);" is put as it is required in case there is any error. So if there is an error, return next with the error (this is given in the docs for Log in for passport)
         if (err) return next(err);
         req.flash('success', 'Welcome to Restaurant Land!');    //for flash  // else do this
         res.redirect('/restaurants');
     })
   
   }  catch(e) {
         req.flash('error', e.message);      //this is going to create a flash. The error (e) itself is going to have a message, which we're going to show with "e.message"
         res.redirect('register');
     }
 }

 module.exports.renderLogin = (req, res) => {        //for login
    res.render('users/login')
}

module.exports.login = (req, res) => {    //passport authenticate is a middleware from passport. "local" is the strategy type which is selected. failureFlash means that it's going to flash a message for us automatically. for failureredirect, this is if things go wrong, to redirect to a certain link, as specified here it is login route. This middleware is to use passport in the login page 
    req.flash('success', 'Welcome Back!!');
    const redirectUrl = req.session.returnTo || '/restaurants';     //If req.session.returnTo is undefined, then redirect to /restaurants. Ref to middleware.js line 6. This will either display the originalUrl that they user was into before logging in, and store it in the session object, or if he goes directly to the login page to login, then he will be redirected to the "restaurants" page
    delete req.session.returnTo;    //this will ddelete the originalUrl from the session object, otherwise it will remain there
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res)=>{
    req.logout();       //to log out, method is automatically available
    req.flash('success', "Adeus, Auf Wiedersehen, Au revoir, Good bye! ")
    res.redirect('/restaurants'); 
}