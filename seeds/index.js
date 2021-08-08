
const mongoose = require('mongoose');                //necessary
const cities = require ('./cities');                 // necessary to connect the cities folder to this page
const {places, descriptors} = require ('./seedHelpers')  //destructuring, so places will hold the places and desc, the desc
const Restaurant = require('../models/restaurantspecs'); //necessary to connect to the schema


mongoose.connect('mongodb://localhost:27017/restaurant-land', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});                                                 //necessary

const sample = array => 
array[Math.floor(Math.random() * array.length)];   //an arrow function to allow for arrays to be entered in and return a random number based on the legth of the array that is fed into it.


const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected");
});                                                 //necessary

const seedDB = async () => {                //THIS IS NO LONGER ACTIVE
    await Restaurant.deleteMany({});                //deletes everything in the Restaurant database
    for (let i=0; i <50; i++) {                     //loops over <50 times
        const random1000 = Math.floor(Math.random() * 1000);        //randomly comes up with a number between 1 and 1000
       const price = Math.floor(Math.random() * 30 )+ 10;       //generate a random number * 30 + 10
        const rest = new Restaurant({                   //has to match in case because of the scehma
            author: '60d5b28574adb94fcca87d2f',      //this is the user ID of the user I created in the site (here it is Ezekiel). This is going to set all of the restaurant entries to have my name
            location: `${cities[random1000].city}, ${cities[random1000].state}` ,    //e.g. cities[50].city (cities.js file with the array id of 50 to the city section will be selected)
            title: `${sample(descriptors)} ${sample(places)}`, //our array acceptor "sample" can be joined with our exported arrays (which were destructured so they need the ()brackets) to loop over to give us the places and descriptors. These two are the arrays fed into sample (the array collector)
            image: 'https://source.unsplash.com/?restaurant, food',   //the link to the Unsplash API which focuses on "Restaurant" and "food" images
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            price: price
        })
        await rest.save();
    }
}


/* seedDB().then( () => {              //runs the function seedDB
    mongoose.connection.close();  //closes our database connection
}) ; */