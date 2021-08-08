//Here we're going to make our schema and modelfor our reviews section

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,           //body is going to require a string
    rating: Number,          //rating is going to require a number
    author: 
        {
            type: Schema.Types.ObjectId, 
            ref: 'User'      //the type entered here will show the object ID, and the ref has to be the model name that was exported in the user.js file. This connects the two schemas
        }
    
});

module.exports = mongoose.model("Review", reviewSchema)         //name of the model is "Review" (has to be capital first), and singular. The second argument has to be the name of the schema