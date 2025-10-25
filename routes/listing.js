const express = require("express");
const router = express.Router();
const  wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");//to use the model we created in listin.js first we need to require 
const {isLoggedIn} = require("../middleware.js");
//This is  a MiddleWare for server side validations
const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        //let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,error.toString());
    }
    else next();
}


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
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
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
        //we know that passport store the user related info... in req.user 
        //req.user has access to many 
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success","New Listing created !");
        res.redirect("/listings");

}));



//Edit Route
router.get("/:id/edit",isLoggedIn,wrapAsync(async(req,res)=>{
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
router.put("/:id",isLoggedIn,validateListing,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
}));


//Delete route
router.delete("/:id",isLoggedIn,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
}));


module.exports = router;