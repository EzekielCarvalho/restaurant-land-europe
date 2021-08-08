//This is the schema required for validation for Joi. This is not the main mongoose schema.

//A note about JOI: JOI allows us to create extensions which allow us to define things (your own methods) which joi can use in its validations.
//We could have used "express validator" instead of Joi and this sanitize HTML extension and the extension we made
//The sanitize HTML part involves defining an extension on Joi.string, called escapeHTML. This is made so that we can add this method on line 47. This is made so that new users wont enter HTML in the form which can manipulate the website, like add script tags and alerts. Sanitizehtml is a package which does the sanitizing of html entries into the form so that the site wont be manipulated and scripts wont be added. ref to https://www.npmjs.com/package/sanitize-html, also ref to https://stackoverflow.com/questions/63556058/joi-extension-for-escaping-html-tags

const BaseJoi = require('joi');                          //This tool is used to help with error handling on the server side so that if something is not entered or is incorrectly entered, it will show an error

const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({ //ref to line 3 and 5
    type: 'string',
    base: joi.string(),
    messages: {
     'string.escapeHTML': '{{#label}} SHOULD NOT have any HTML inside :( !!!!',
    },
    rules: {
        escapeHTML: {
          validate(value, helpers) {    //check to see if there was a difference between the input that was passed int othe form and the sanitized output
      const clean = sanitizeHtml(value, {
        allowedTags: [],      //nothing is allowed. You can say that you want paragraphs or h1s to be allowed
        allowedAttributes: {},    //nothing is allowed. You can say that you want paragraphs or h1s to be allowed
      });
      if (clean !== value) return helpers.error('string.escapeHTML', { value })   //if there was a difference then that means that something was removed, then return "helpers.error('string.escapeHTML')" (definied in line 15- this is all Joi syntax). The output says that restaurant.body or restaurant.title must not include HTML!!!
     return clean;
     }
  }
}
});

const Joi = BaseJoi.extend(extension)   //to use the extension that we made


module.exports.restaurantSchema = Joi.object({         //It has to be an object. This is as per documentation
    restaurant: Joi.object({                  //It's going to be an object
        title: Joi.string().required().escapeHTML(),       //the title is going to be a string which is required
        price: Joi.number().required().min(0),    //the price is going to be a number which is required and the minimum is 0
      //   image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
      }).required(),                              //the body has to include "restaurant" because everything is under it eg. restaurant[price]. The object is required because "Restaurant" is going to be required
      deleteImages: Joi.array()        //to assist with deleting images at edit.ejs line 46
    });           //This is not a mongoose schema. It is going to validate our data even before saving to mongoose, even before involving mongoose.
      //console.logging the restaurantSchema will show us that there is an "error" array which has the message "restaurant" is required. The array also has a "details" array which has an array object within it

module.exports.reviewSchema = Joi.object({    //same style as above schema but this is for the review box to give it a server side validation
      review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML().escapeHTML()    //This is the escapeHTML method that was made with sanitize HTML above
      }).required()
});