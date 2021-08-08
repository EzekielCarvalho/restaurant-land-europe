const Review = require('../models/review');       //to connect the data from review.js page to here
const Restaurant = require('../models/restaurantspecs');  //necessary to connect to the schema

module.exports.createReview = async(req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);    //this is to find the corresponding restaurant by ID to post the review    //req.params refers to whatever is put in the address bar, that forms the params, and adding .id means that whatever id is in the address bar will be considered
    const review = new Review(req.body.review); //This creates a new review in connection with the review.js file //req.body is what is posted by a form  //req.body. review, the .review part is because when the form was created, the names were given as "review[body]" or "review[rating]" for example
    review.author = req.user._id //here, the author of the review schema gets set as the user ID logged in. As a result of passport, the above line leads to the creation of a user id. It is saved as the author in this line instead of the id of Ezekiel. As a result of this, the author gets his own name instead of all being Ezekiel
    restaurant.reviews.push(review);    //this is to push the created review to the Review schema that was created in the restaurant schema. You will find "reviews" there with an array, hence the "push" is needed
    await review.save();        //await waits for steps to finish above, and then it moves onto the review.save()
    await restaurant.save();      //this saves the restuarant too after saving the review
    req.flash('success', 'Your Review Has Been Posted!')     //to make the flash message and redirect on the next step https://www.npmjs.com/package/connect-flash
    res.redirect(`/restaurants/${restaurant._id}`);  //to redirect to the restaurant id's page
}

module.exports.deleteReview = async (req, res) =>   //the reviewId and path is to remove (delete) the path which contains the review (comment)
{   const { id, reviewId } = req.params;        //destructures, removes the id and reviewId from req.params
    await Restaurant.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }) //pull is an operator that removes from an existing array, all the instances of a value or values that match a specified condition (so basically it's used to remove data)  //pulls from the reviews array from restaurantsspecs and pulls the ID of the review   //look at line 6 for what Restaurant is
    await Review.findByIdAndDelete(reviewId); //line number 10 on what "Review" is. look at line 112 for what reviewId is too. Finds by Id and deletes as per the parameter and reviewId(the Id of the review)
    req.flash('success', 'Review Successfully Deleted!')     //to make the flash message and redirect on the next step https://www.npmjs.com/package/connect-flash
    res.redirect(`/restaurants/${id}`);     //redirects to the restaurants id (id has been destructured earlier line 112)
}