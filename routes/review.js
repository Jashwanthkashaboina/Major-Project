const express = require("express");
const router = express.Router({ mergeParams: true });
const  wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { validateReview,isLoggedIn,isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");
//Reviews 
//This is  POST Review Route
//this is going to be async bcoz we are storing in database it is a async operation
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

//Delete Review Route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.deleteReview));

module.exports = router;