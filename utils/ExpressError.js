//This class is going to be the error handler for the site. A class is a template for objects

class ExpressError extends Error {          //This Extends a class (inherit) from the Error class (predefined by default). The error class may contain message and status code by default
    constructor (message, statusCode) {     //A special method for creating and initializing objects created within a class. It's part of the syntax
        super();                            //Refers to the parent class. It's required to connect to the parent classes' features
        this.message = message;             //Normal syntax. The "message" before the = sign can be labelled as anything. The "message" after has to be the same as what's in the constructor
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;