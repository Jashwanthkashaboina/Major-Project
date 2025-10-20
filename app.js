const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");//to use the model we created in listin.js first we need to require 
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const  wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");


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

//This is  a MiddleWare for server side validations
const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        //let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,error.toString());
    }
    else next();
}


const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error.toString());
    }
    else next();
}

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
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{ listing });
}));

//Create Route
app.post("/listings", validateListing,wrapAsync(async(req, res) => {
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
app.put("/listings/:id",validateListing, wrapAsync(async(req,res)=>{
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


//Reviews 
//This is  POST Review Route
//this is going to be async bcoz we are storing in database it is a async operation
app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{

    // console.log("✅ Review route reached!");--- we can debug like this
    // console.log("Body:", req.body); 
    // res.send("Route reached!");


    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview); 
    //the above line .....we have one listing means detail view
    // In that we are pushing our review to the review part....means
    //listing.reviews.push(newReview);

    await newReview.save();
    await listing.save(); // we need to await this bcoz we made changes in existing doc
    //so we need to save the changes

    res.redirect(`/listings/${listing._id}`);
}));

//Delete Review Route
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    let {id,reviewId} = req.params;
    //we need to delete from review from reviews section 
    //And we need to delete it from database mean reviews array of listing
    // the following steps do 
    // 1.delete that review from reviews array

    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});

    //2. Delete it from the reviews section

    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
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
    res.status(statusCode).render("error.ejs",{err});
    // res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("Server is listening to port 8080");
});