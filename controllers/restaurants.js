const Restaurant = require('../models/restaurantspecs');  //necessary to connect to the schema
const { cloudinary } = require("../cloudinary");    //to import the cloudinary client so that we can use it to delete images
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding"); //to import geocoding
const mapBoxToken = process.env.MAPBOX_TOKEN;   //to import our token from the env file
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); //pass the token through when we initialize a new mapbox geocoding instance

module.exports.index= async(req, res) => {      //index as a name was randomly given, mainly because the function deals with the index page
    const restaurants = await Restaurant.find({}); //finds all from Restaurant and saves to a variable
    res.render('restaurants/index', {restaurants})                //shows to the index file in restauranbts folder
}

module.exports.renderNewForm = (req, res) => {           //creates the path for new restaurants to be added //new entries don't have to be async. But post and edit (put, patch) have to be async
    res.render('restaurants/new');
}

module.exports.createRestaurant = async (req, res, next) => {            //this will be the end point where the form will submit to, for searching for restaurants. catchAsynch is the try catch function that's going to ensure that any errors and handled and next is passed. validatereview is for the validation on the server side for the review section
    const geoData = await geocoder.forwardGeocode({
          query: req.body.restaurant.location,              //location on the restaurant in the req body, this connects to the location that is entered when creating a new restaurant               //refer to https://github.com/mapbox/mapbox-sdk-js/blob/main/docs/services.md#geocoding for format
          limit:1
    }).send()
    
    // if(!req.body.restaurant) throw new ExpressError('Hey, you did not send me complete data', 400); // if there is no data entered through the form (blank form sent) then throw a new ExpressError class, with the message and status code 400. Because this is in the "catchAsync" function, it (the error) will automatically be caught and "next" will run (As part of the catchASYNC function)which will cause the middleware error to run
        //we are going to get  on the "req" above on line 13, req.body but also req.files because of the new middleware that was added i.e. "upload.array('image')" (with multer) since this middleware allows for the sending of files. req.files is going to include various things from an array such as fieldname, originalname, encoding, path, size, filename etc
        //the whole idea with req.files is that we want to take the path and filename and add them to the new restaurant that is made with "new Restaurant" that will be made
        //The Array.map() method creates a new array with the results of calling a function for every array element.
       // The forEach() method executes a provided function once for each array element.
        //A function is returned values without using the return keyword, it’s called an implicit return.
        //https://www.w3schools.com/jsref/jsref_map.asp
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#
        //https://medium.com/@bunlong/arrow-functions-return-rules-in-javascript-b63ed5f25994

        const restaurant = new Restaurant(req.body.restaurant);                         //req.body.restaurant is from the form data. This takes the data and makes a new restaurant page. this has to be parsed (urlencoded) so that req.body can be read. This sends the data sent from the form
        restaurant.geometry = geoData.body.features[0].geometry; //ref to line 17 here, the restaurant.geometry is as per the restaurantspecs schema, refer to restaurantspecs.js line 30. this gives us an array containing the longitude and latitude of the area that is provided in the location. this shows the data from the geoData area, witin the body object/ array, within the features array of the first feature (hence the [0] is used) within the geometry object/array, and with this you get back an object with type: point and the coordinates with longitude and latitude

        restaurant.images = req.files.map(f => ({url: f.path, filename: f.filename}))   //This is goign to loop over the files from req.files so that path and filename can be obtained. This will map over the aray of req.files into an object, for each "f" it will return an object, which will be implicitly returned\.  A new array and object (Becuase of the curly braces added ) will be created with this map containing the path of each file from req.files and the filename. So the path of the image will be sent and also the name of the file of the image in cloudinary. These two are added (for each file added) to  restaurant.images which will add the images to the new restaurant created
        restaurant.author = req.user._id; //here, the author of the restaurant schema gets set as the user ID logged in.as a result of passport, the above line leads to the creation of a user id. It is saved as the author in this line instead of the id of Ezekiel. As a result of this, the author gets his own name instead of all being Ezekiel
        await restaurant.save();
    req.flash('success', 'Successfully made your new restaurant entry')     //to make the flash message and redirect on the next step https://www.npmjs.com/package/connect-flash
    res.redirect(`/restaurants/${restaurant._id}`)              //to redirect to the newly created restaurant, based on its ID otherwise the form will send and just get stuck
}

module.exports.showRestaurant = async(req, res) => {        // allows for any params to be added in "id" place e.g. restuarants/:ball or cat. In this case it's id number
    const restaurant = await Restaurant.findById(req.params.id).populate(
        {path:'reviews',    //populate the reviews based on Restaurant.findById, and then populate their author too and separately, out of this object, for the last populate, populate the auhor for the restaurant
        populate: {
            path: 'author'
        }}).populate('author');  //this populates the two fields from restaurantspecs.js author and review. we want to populate with "Reviews" as per restaurantspecs //populate is used to add data based on the "reviews" data that is in the restaurantspecs.js as "Reviews", so each Object ID will be replaced by their corresponding reviews. It always has to be the same name given in the main schema (restaurantspecs.js) containing the "Schema.Types.ObjectId"         //fetches for data based on params id added and finds data based on that
    if(!restaurant) {       //if there is no restaurant available, show the flash below                 //above: populating the author would give the name of the author
        req.flash('error', 'This Restaurant is no longer available!');
        return res.redirect('/restaurants');
    }
    res.render('restaurants/show', { restaurant });    //otherwise show the restaurant found by the Id above based on params                    //shows to the restaurants/show page
}

module.exports.renderEditForm = async(req, res) => {
    const { id } = req.params;                                     //req.params is the text entered in the link area
    
    const restaurant = await Restaurant.findById(id)             //fetches for data based on params id added and finds data based on that
    if(!restaurant) {       //if there is no restaurant available, show the flash below                 //above: populating the author would give the name of the author
        req.flash('error', 'This Restaurant is no longer available!');
        return res.redirect('/restaurants');
    }
  
    res.render('restaurants/edit', { restaurant }); 
}

module.exports.updateRestaurant = async(req, res) => {                   //this is for the send button to update the restaurant entry. It is till "id" because the PUT method with method override has to be added
    const { id } = req.params;                                     //req.params is the text entered in the link area
    const restaurant = await Restaurant.findByIdAndUpdate(id, { ...req.body.restaurant }); //whatever is in req.body.restaurant is taken and put as the replacement upon clicking on "update restaurant". The "..." spreads the req.body.restaurant into the newly created object specified by the "{ }"
  //req.files.map adds another array, but we don't want to push another array into an existing array on line 62
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));   //This is goign to loop over the files from req.files so that path and filename can be obtained. This will map over the aray of req.files into an object, for each "f" it will return an object, which will be implicitly returned\.  A new array and object (Becuase of the curly braces added ) will be created with this map containing the path of each file from req.files and the filename. So the path of the image will be sent and also the name of the file of the image in cloudinary. These two are added (for each file added) to  restaurant.images which will add the images to the new restaurant created
    restaurant.images.push(...imgs);            // so dont pass the array, but take the data from the array and pass it into push into restaurant.images and then save below. Spread syntax (...) allows an iterable such as an array expression or string to be expanded in places where zero or more arguments (for function calls) or elements (for array literals) are expected, or an object expression to be expanded in places where zero or more key-value pairs (for object literals) are expected. The push here is going to push the new image and not overwrite images. This is goign to loop over the files from req.files so that path and filename can be obtained. This will map over the aray of req.files into an object, for each "f" it will return an object, which will be implicitly returned\.  A new array and object (Becuase of the curly braces added ) will be created with this map containing the path of each file from req.files and the filename. So the path of the image will be sent and also the name of the file of the image in cloudinary. These two are added (for each file added) to  restaurant.images which will add the images to the new restaurant created
    await restaurant.save();
    if(req.body.deleteImages){
       for(let filename of req.body.deleteImages) { //if there are any images in the deleteImages array, we will loop over each one , for each filename, we call destroy method, if you pass in the filename in destroy, it will delete it
        await cloudinary.uploader.destroy(filename);        //detroy method from the cloudinary which we required above. This will delete the image/s from the cloudinary server
       }
        await restaurant.updateOne({$pull:{images: {filename: {$in: req.body.deleteImages}}}})        //This deletes images from mongo. So if there are images in the deleteImages array, then update the restaurant that we've found on line 59, pull from the deleteImages array all images where the filename of that image is in the req.body.deleteImages array 
    }
    req.flash('success', 'Successfully updated your restaurant entry')     //to make the flash message and redirect on the next step https://www.npmjs.com/package/connect-flash
    res.redirect(`/restaurants/${restaurant._id}`)  
}

module.exports.deleteRestaurant = async(req,res) => {
    const {id} = req.params;
    await Restaurant.findByIdAndDelete(id);             //to find as per the ID and delete
    req.flash('success', 'Successfully Deleted Restaurant Entry')     //to make the flash message and redirect on the next step https://www.npmjs.com/package/connect-flash
    res.redirect('/restaurants');
}