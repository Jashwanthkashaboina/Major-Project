const express = require("express");
const router = express.Router({ mergeParams: true });
const  wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { validateReview,isLoggedIn } = require("../middleware.js");
//Reviews 
//This is  POST Review Route
//this is going to be async bcoz we are storing in database it is a async operation
router.post("/",isLoggedIn,validateReview,wrapAsync(async(req,res)=>{

    // console.log("✅ Review route reached!");--- we can debug like this
    // console.log("Body:", req.body); 
    // res.send("Route reached!");
    
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; // we are getting user from passport
    console.log(newReview);
    listing.reviews.push(newReview); 
    //the above line .....we have one listing means detail view
    // In that we are pushing our review to the review part....means
    //listing.reviews.push(newReview);

    await newReview.save();
    await listing.save(); // we need to await this bcoz we made changes in existing doc
    //so we need to save the changes
    req.flash("success","New Review Added");
    res.redirect(`/listings/${listing._id}`);
}));

//Delete Review Route
router.delete("/:reviewId",isLoggedIn,wrapAsync(async(req,res)=>{
    let {id,reviewId} = req.params;
    //we need to delete from review from reviews section 
    //And we need to delete it from database mean reviews array of listing
    // the following steps do 
    // 1.delete that review from reviews array

    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});

    //2. Delete it from the reviews section

    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;