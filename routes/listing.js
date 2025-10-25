const express = require("express");
const router = express.Router();
const  wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");//to use the model we created in listin.js first we need to require 
const { isLoggedIn,isOwner,validateListing } = require("../middleware.js");
//This is  a MiddleWare for server side validations

// Index Route
router.get("/",wrapAsync(async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index",{allListings});
}));

// New Route -- To create a new Listing
router.get("/new",isLoggedIn,(req,res)=>{
    res.render("listings/new.ejs");
});

//show route
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    //populate -- to get the details of reviews and owner instead of just their ids
    const listing = await Listing.findById(id).populate({ path : "reviews",populate: { path: "author" } }).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exists");
        res.redirect("/listings");
        return;
    }
    console.log(listing);
    res.render("listings/show.ejs",{ listing });
}));

//Create Route
router.post("/", isLoggedIn,validateListing,wrapAsync(async(req, res) => {
        if (!req.body.listing.image || req.body.listing.image.trim() === "") {
            req.body.listing.image = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60";
        }
        const newListing = new Listing(req.body.listing);
        //every time when we create listingg by default owner is not stored as we didnt created in schema
        // so first we need to store the curr user information
        //we know that passport store the user related info... in "req.user"
        //req.user has access to many 
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success","New Listing created !");
        res.redirect("/listings");

}));



//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exists");
        res.redirect("/listings");
        return;
    }
    res.render("listings/edit.ejs",{listing});

}));

//update route
//In middleWares ...First we'll check is user logged in 
// next he has acces (authority--authorization) to that particular listing means he is owner or not!
router.put("/:id",isLoggedIn,isOwner,validateListing,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
}));


//Delete route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
}));


module.exports = router;