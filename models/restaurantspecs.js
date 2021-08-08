//findByIdAndDelete used in app.js to delete restaurants, triggers the middleware "findOneAndDelete" so that is what we have to use to delete all reviews plus the restaurant

//Pre middleware functions are executed one after another, when each middleware calls next.
//post middleware are executed after the hooked method and all of its pre middleware have completed.
//The remove() (deprecated) function is used to remove the documents from the database according to the condition.
//deleteMany is used to delete many

//In Mongoose, a virtual is a property that is not stored in MongoDB. Virtuals are typically used for computed properties on documents.
//ref to https://mongoosejs.com/docs/tutorials/virtuals.html for further info. By default, Mongoose does not include virtuals when you convert a document to JSON. You have to use "opts" for this
// you can only add virtual properties (a Mongoose feature) to a schema. We want to add a virtual property of making images as thumbnails in the Edit page for each restaurant

const mongoose = require('mongoose');                       //necessary for mongoose
const Review = require('./review');
const Schema = mongoose.Schema;                             //optional to make a new schema

//reference line 23 https://res.cloudinary.com/ezekielcloud/image/upload/v1625739947/RestaurantLand/pbjv9eojzsmwtz6cr6im.jpghttps://res.cloudinary.com/ezekielcloud/image/upload/w_300/v1625739947/RestaurantLand/pbjv9eojzsmwtz6cr6im.jpg
          //  line 23 this.url.replace('/upload', '/upload/w_200'); this refers to the beginning part of hte link till.com. This replaces the /upload with /upload/w_200 width for all images. replace will only replace the first match

const ImageSchema = new Schema({    //This schema was made so that we could loop over each image and their features, the url and filename, so that we can add the thumbnail feature. We wont make an image model since we dont have to export it. It's just going to be used for this schema here
    url: String,        //to store the url of the image. This is the link path of each image
    filename: String        //another feature that's part of the image file
});
ImageSchema.virtual('thumbnail').get(function() {       //In Mongoose, a virtual is a property that is not stored in MongoDB. Virtuals are typically used for computed properties on documents.virtual from mongoose. This is to make the thumbnail feature
   return this.url.replace('/upload', '/upload/w_200'); //this refers to the particular image line 16
});

const opts = { toJSON: { virtuals: true } };    //ref to line 8 in this file and ref to clusterMap.,js line 124 . Also we're trying to conver virtuals to JSON by adding the popup feature for our cluster map. By default, Mongoose does not include virtuals when you convert a document to JSON.  Hence this code had to be used to set virtuals to true. THis is used when we're working with getting the cluster map to have pop up features that we want. This opts is added to the RestaurantSchema line 58 https://mongoosejs.com/docs/tutorials/virtuals.html

const RestaurantSchema = new Schema ({
    title: String,
    images: [ImageSchema],           //array because we're going to store multiple images. We connected this with the ImageSchema
            
           //to store the name of the file of the iamge stored in cloudinary. We want the file name so that in the future if we want to delete files from cloudinary, it can be useful to know the file name
    geometry: {         //instead of location in mongoose. This geometry type and coordinates are as per what we get back from geoData.body.features[0].geometry in restaurants.js, so the schema is made to take in those values
            type: {
              type: String, // Don't do `{ location: { type: String } }`
              enum: ['Point'], // 'location.type' must be 'Point'. It has to be point. We're trying to follow the standard of geoJSON as per MongoDB https://docs.mongodb.com/manual/geospatial-queries/ so we use the mongoose schema where location is the point https://mongoosejs.com/docs/geojson.html
              required: true
            },
            coordinates: {
              type: [Number],
              required: true
            }
          },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [          //an array was used here because of the number of the potential of there being many reviews. This contains an array of objectIDs for each restaurant
        {
            type: Schema.Types.ObjectId, 
            ref: 'Review'      //the type entered here will show the object ID, and the ref has to be the model name that was exported in the review.js file. This connects the two schemas
        }
    ]
    
}, opts);                                                         //schema structure

RestaurantSchema.virtual('properties.popUpMarkup').get(function() {       //line 104, clusterMap.js . virtual from mongoose. This is to make the properties.popUpMarkup feature   //In Mongoose, a virtual is a property that is not stored in MongoDB. Virtuals are typically used for computed properties on documents.
    return `<strong><a href="/restaurants/${this._id}">${this.title}</a></strong>    
 <strong><p>${this.location}</p></strong>
<p>Starting price: €${this.price}</p> `//this refers to the particular restaurant instance. Also REF TO clusterMap.js line 124. The substring and starting and end limit of words is shown
});

RestaurantSchema.post('findOneAndDelete', async(doc) => {
    if(doc){            //if the document is found
        await Review.deleteMany({           
            _id: {      //the id for each review
                $in: doc.reviews        //is somewhere in the doc.reviews
            }
        })
    }
})//this is the middleware used to delete the reviews (plus restaurant) from the database and system.
//doc is the document (restaurant or review) that was deleted and it was passed through this middleware
//the document may have reviews, so this query in line 26 will remove all reviews 

module.exports = mongoose.model('Restaurant', RestaurantSchema); //to export the model based on the schema (has to have Cap R and singular "t", followed by the schema name)
