if(process.env.NODE_ENV !=="production") {      //If we are running (not in) production mode i.e. if we are in development mode. Note: process.env.NODE_ENV is an environment variable that is either in "Development mode" or "production mode".NODE_ENV refers to the "CLOUDINARY_KEY OR NAME OR SECRET" in the .env file. Right now, with working on code, we are in development mode, but after the app is deployed, we will be in production mode
    require('dotenv').config();     //.env is required to store our important credentials related to cloudinary for storing images. Then require the dotenv package, which will take the variables defined in the .env file and add them to process.env in this node app
}

const express = require('express');                  //necessary
const path = require('path');                        //necessary
const ejsMate = require('ejs-mate');                  //necessary (ejs mate) is used to make reusable templates or sections (example navbar, body etc ) which can be dynamically be altered
const mongoose = require('mongoose');                //necessary
const methodOverride = require('method-override');   //necessary for implementing put/ patch/ delete for updating and deleting
const ExpressError = require('./utils/ExpressError') //necessary for using the Express error class
const session = require('express-session');         //necessary for using server side cookies instead of just client side cookies. This is like adding things to your shopping cart in amazon and you've not yet registered, but amazon will save your items as a cookie on the server and send you an ID instead. This ID is connected to all the server storing your data
const flash = require('connect-flash');
const passport = require('passport');               //necessary for passport for allowing the use of multiple strategies for authentication
const LocalStrategy = require('passport-local');     //necessary for passport for using the local strategy (one of the many strategies in passport)
const User = require('./models/user')                //necessary for connecting to the user model
const mongoSanitize = require('express-mongo-sanitize'); //necessary for Mongo sanitize "Express 4.x middleware which sanitizes user-supplied data to prevent MongoDB Operator Injection." This is used to prevent hacking and mongo injection via inappropriate queries https://www.npmjs.com/package/express-mongo-sanitize
const helmet = require('helmet');                   //necessary to require helmet. Helmet is a security related package which comes with a set of 11 middleware which all have to do with Http headers, and manipulating headers all in the name of security.
const MongoDBStore = require('connect-mongo')(session);//NOTE USE npm install connect-mongo@3.2.0 because I've used the older version here. The newer version requires changes to be made to the code. we want to use this to make the session get stored in mongo not our computer memory. ref to https://www.npmjs.com/package/connect-mongo this is used to configure out application to store the session information. connect-mongo is a MongoDB session store for Connect and Express written in Typescript.
const TimeAgo = require('javascript-time-ago')

const usersRoutes = require('./routes/users');
const restaurantRoutes = require('./routes/restaurants'); //this is to connect to the routes folder. Express routes is used for better routing 
const reviewRoutes = require('./routes/reviews'); //this is to connect to the routes folder. Express routes is used for better routing 
const urlDb = process.env.DB_URL || 'mongodb://localhost:27017/restaurant-land';
//the "next" is a function that's going to call the next matching middleware or route handler




mongoose.connect(urlDb, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});                                                 //necessary

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected");
});                                                 //necessary along with error handling

const app = express();                               //necessary

app.engine('ejs', ejsMate);       //This is going to use "ejs" which is already installed and ejs Mate                  //The app.engine() function is used to register the given template engine callback as ext. By default the Express itself will require() the engine based on the file extension.
app.set('view engine', 'ejs');                      //necessary
app.set('views', path.join(__dirname, 'views'))     //necessary The path.join() method joins the specified path segments into one path.

app.use(express.urlencoded({extended: true}))       //This is a middleware parser for req.body so that once a form is submit. the "_method" can be set as anything.
app.use(methodOverride('_method'))                  //This is middleware too. app.use is middleware used to call a function for every single request like going to the homepage or any other page you create. The morgan app is useful for debugging and has to be put in app.use. It displays the status code (404 for eg) and the time taken to get response
app.use(express.static(path.join(__dirname, 'public')))                  //this is to use the public folder for static files
app.use(
    mongoSanitize({
      replaceWith: '_',
    }),
  );       //to use mongo sanitize

  const secret = process.env.SECRET || 'confidential';

const store = new MongoDBStore({      //ref to https://www.npmjs.com/package/connect-mongo this is to help with creating sessions within mongo rather than using your internal memory
    url: urlDb,
    secret,
    touchAfter: 24 * 60 * 60    // time period in seconds
});

store.on("error", function(e){
    console.log("Session Store Error", e)   //if there are any errors, then store it and console.log it
})

const sessionConfig = {             //this is a configuration object
    store: store,   //pass the error to our sessionConfig
    name: 'session',                //name of session. This is used if you dont want to use the default name which is "connect.sid"
    secret,         //the secret
    resave: false,                  //options that it will warm about
    saveUninitialized: true,
    cookie: {                 //ms  sec   mins  hrs  days(wk)
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,  //required so that a person won't stay logged in forever
        maxAge: 1000 * 60 * 60 * 24 * 7,               
        httpOnly: true //for security. all of these steps are in the docs
    } 
}

//Also refer to Colt steele's style of making the CSP on https://github.com/Colt/YelpCamp/blob/a05fccdf44cd4e5796150347594565471ab3ee60/app.js
app.use(helmet({contentSecurityPolicy: false}));     //Ref to the helmetjs docs if you want to use cross site policy. I deliberately didn't enable content sec policy CSP because it would be tedious to have to constantly keep track of the new places I'm fetching data from with this app. But do note that if you are going to make a real world app that is going to serve a lot of people and involve working with credentials, you SHOULD apply a CSP policy. Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross Site Scripting (XSS) and data injection attacks. These attacks are used for everything from data theft to site defacement to distribution of malware.             //ref to https://helmetjs.github.io/ this automatically enables all 11 of the middleware form helmet, instead of doing it individually. Helmet. js is a useful Node. js module that helps you secure HTTP headers returned by your Express apps. 
app.use(session(sessionConfig));    //this has to be used for the above constant as well as before passport.session 
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());        //required by passport for persistent login sessions otherwise you would have to login on every new sesion. Also, "session" has to be used before this session
passport.use(new LocalStrategy(User.authenticate())); //Required this is how you begin the authetication process from passport. hello passport, we would like you to use the local strategy downloaded in required, and for that local strategy, the authentication method is going to located in the User model and it's called "authenticate". But we dont have that method called authenticate, but passport is going to create it. It's one of the static methods made by passport, along with serializeuser, desrializeuser, register, findbyusername and createstrategy

passport.serializeUser(User.serializeUser());       //Required This tells passport how to serialize a user. Serialization refers to how we store data in a session
passport.deserializeUser(User.deserializeUser());   //Required This tells passport how to serialize a user. Serialization refers to how we get a user out of a session


app.use((req, res, next) => {           //this is a middleware made is going to add to the response object in such a way that in nevery single template, every view will have access to "messages".  It's going to just take everything on every request, if there is anything in the flash in that session, that it would add it to the template as a local variable. This is done to avoid putting "message: req.flash('success')" on every render route. This adds onto the response object of every template that it will have
    if (!['/login', '/'].includes(req.originalUrl)){    //this is a code to solve the bug in that if you login, you're always automatically taken to the create new restaurant page, whether you want it or not
            //The req.originalUrl property is much like req.url however, it retains the original request URL thereby allowing you to rewrite req.url freely for internal routing purposes.
      //This next step is done so that when a user is browsing a route, and if they login, they would be redirected to the page they were previously browsing
      //req.originalUrl would show the last Url that you browsed too. So the whole aim here is to store that to the Session object (the server side cookie)
      req.session.returnTo = req.originalUrl //returnTo is going to contain the "req.originalUrl"
      //line 36 users.js therefore, if you're not coming from the login page nor the home page, and if it does not include whats in the parentheses (after includes), then we want to do what's in the if statement. So if you're not coming from the login nor the homepage, then set the returnTo property equal to the original Url. 
      //****** Read This  //if you're not coming from login nor homepage, then req.sesion.returnTo is given req.originalUrl, and then in users.js line 36 after the login has been requested by the user the req.session.returnTo will run because it's got a value, its not undefined and it wont be redirected to /restaurant
    }
    res.locals.currentUser = req.user; //currentUser is a randomly chosen name. It can be anything. req.user contains the details of the user who has logged in i.e his email and login user name. This step is done so that the req.user can be made availble to every templated of the navbar. This step is also so that the navbar can show or hide the menus before and after logging in. if a user is logged in then current user is that logged in user, otherwise the current user is undefined
    res.locals.success = req.flash('success');      //res.locals is from the Express docs, useful for responding entries made here to all the local routes to every single request. the locals."success" name is dependent on what name you gave on the boiler plate. In this case, it was "success" line 16 boilerplate.ejs
    res.locals.error = req.flash('error');
    next();
})
// app.use means that any thing thats inside of app.use is going to run every time a request is made
app.use('/', usersRoutes); //refer to line 13 above. The first entry uses the userRoutes
app.use('/restaurants', restaurantRoutes)        //refer to line 14 above. the second entry uses the restaurants route
app.use('/restaurants/:id/reviews', reviewRoutes)  //refer to line 15 above. the second entry uses the reviews route

app.get ('/', (req, res) => {        //used to get the request for the page and display on screen from home ejs

    
    res.render('home');              //The order of the paths here matters 

})



app.all('*', (req, res, next) => {                  // this has to be at the bottom here because the paths are checked by order. If this were put on top, all paths would be replaced with this path because of *"
    next(new ExpressError('Hey, there is no page here', 404))  // this is a new object based on the ExpressError class that was created. This is passed onto "next" which causes the error handler "app.use" below to be called, which will use "err" as the new ExpressError object or whatever other error depending on where the "next" gets triggered. That error will be determined either as coming from catchAsyncjs or the expresserror "hey there is no page" error with 404
}) //app.all is for every single request * is for everypath. This path will run if no other path matches this path and no response came from any of them

app.use((err, req, res, next) => {                      //This is middleware that is made which is be where all "next" events (such as catchAsync function) will redirect to in case there is an error. This middleware is going to return the "res.send" message
    const { statusCode = 500 } = err; //This basically destructures the "Err" and sets the default Status code to 500. This is all obtained from the "Err" and injected into the "statusCode though the defaults are used if no original status has been set.
    if(!err.message) err.message = `Hey there's an error!! Help!!`        //if there is no error message, then set this as the default error message
    res.status(statusCode).render('error', { err })  //the status will be displayed as per the statuscode and message will be send as per the default message or depending if it was set beforehand. The entire error message will be rendered or displayed because of { err }.
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log (`Listening on Port ${port}`)
})

