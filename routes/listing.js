const express = require("express");
const router = express.Router();
const  wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");//to use the model we created in listin.js first we need to require 
const { isLoggedIn,isOwner,validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

// Index Route
router.get("/",wrapAsync(listingController.index));

// New Route -- To create a new Listing
router.get("/new",isLoggedIn,listingController.renderNewForm);

//show route
router.get("/:id",wrapAsync(listingController.showListings));

//Create Route
router.post("/", isLoggedIn,validateListing,wrapAsync(listingController.createListing));


//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

//update route
//In middleWares ...First we'll check is user logged in 
// next he has acces (authority--authorization) to that particular listing means he is owner or not!
router.put("/:id",isLoggedIn,isOwner,validateListing,wrapAsync(listingController.updateListing));


//Delete route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.deleteListing));


module.exports = router;