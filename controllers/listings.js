//This file contains Core Functionality of Backend
const { model, Query } = require("mongoose");
const Listing = require("../models/listing.js");
const mbxgeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxgeoCoding({ accessToken: mapToken });


module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index",{allListings});
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};


module.exports.showListings = async(req,res)=>{
    let {id} = req.params;
    //populate -- to get the details of reviews and owner instead of just their ids
    const listing = await Listing.findById(id).populate({ path : "reviews",populate: { path: "author" } }).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exists");
        res.redirect("/listings");
        return;
    }
    // console.log(listing.geometry);
    const coordinates = (listing.geometry && listing.geometry.coordinates.length)
        ? listing.geometry.coordinates
        : [74.8723, 31.6340]; // e.g., Amritsar
    res.render("listings/show.ejs",{ listing });
};

module.exports.createListing = async(req, res) => {
    let geoResponse  = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        })
        .send();

    const newListing = new Listing(req.body.listing);
    if (geoResponse.body.features.length > 0) {
        newListing.geometry = geoResponse.body.features[0].geometry;
    } else {
        newListing.geometry = {
            type: "Point",
            coordinates: [77.1025, 28.7041] // fallback: New Delhi
        };
    }
    //every time when we create listingg by default owner is not stored as we didnt created in schema
    // so first we need to store the curr user information
    //we know that passport store the user related info... in "req.user"
    //req.user has access to many
    newListing.image = { 
        url: req.file ? req.file.path : "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60",
        filename: req.file ? req.file.filename : "default"
    };
    newListing.owner = req.user._id;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success","New Listing created !");
    res.redirect("/listings");

};

module.exports.renderEditForm = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exists");
        res.redirect("/listings");
        return;
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{ listing,originalImageUrl });

};

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing},{ new: true });

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url,filename };
        await listing.save();
    }

    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
};