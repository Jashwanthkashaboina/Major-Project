const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");//to use the model we created in listin.js first we need to require 
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const  wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

main()
    .then(()=>{
        console.log("connected to DB");
    }).catch((err)=>{
        console.log(err);
    });
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}


app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));


app.get("/",(req,res)=>{
    res.send("Hi! I'm root");
});

// Index Route
app.get("/listings",wrapAsync(async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index",{allListings});
}));

// New Route -- To create a new Listing
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{ listing });
}));

//Create Route
app.post("/listings", wrapAsync(async(req, res) => {
        if(!req.body.listing){
            //Sttatus code 400 --- Bad request
            throw new ExpressError(400,"Send Valid Data for Listing");
        }
        if (!req.body.listing.image || req.body.listing.image.trim() === "") {
            req.body.listing.image = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60";
        }
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");

}));



//Edit Route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});

}));

//update route
app.put("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));
//Delete route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

// app.get("/testListing",async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Jalandhar",
//         country: "India"
//     });
//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Successful testing");
// });
app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
});


app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went Wrong!"} = err;
    res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("Server is listening to port 8080");
});