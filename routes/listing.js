const express = require("express");
const router = express.Router();
const  wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");//to use the model we created in listin.js first we need to require 
const { isLoggedIn,isOwner,validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
//Below one is Middleware for multipart/data
const  multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


router.route("/")
    // Index Route
    .get(wrapAsync(listingController.index))
    //Create Route
    // .post(isLoggedIn,validateListing,wrapAsync(listingController.createListing));
    .post(upload.single("listing[image]"),(req,res)=>{
        res.send(req.file);
    });

// New Route -- To create a new Listing
router.get("/new",isLoggedIn,listingController.renderNewForm);


router.route("/:id")
    //show route
    .get(wrapAsync(listingController.showListings))

    //update route
    //In middleWares ...First we'll check is user logged in 
    // next he has acces (authority--authorization) to that particular listing means he is owner or not!
    .put(isLoggedIn,isOwner,validateListing,wrapAsync(listingController.updateListing))

    //Delete route
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.deleteListing));



//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

module.exports = router;