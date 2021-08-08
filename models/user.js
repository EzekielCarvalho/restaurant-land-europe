//this is the model used for setting up authentication, dealing with logins and registeration etc.

const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');   //this is passport which is used to give authentication abilities to a site. It's a library
const Schema = mongoose.Schema;

const UserSchema = new Schema({         //new schema
    email: {                            //new email schema made, but username and password are not added because passport will take care of that below
        type: String,               //it will be a string
        required: true,         //validation that email is required
        unique: true            //it is not a validation but it sets up an index
    }
});
UserSchema.plugin(passportLocalMongoose);   //this joins passport to the schema above and adds username and password authentication features which cannot be seen here

module.exports = mongoose.model('User', UserSchema);