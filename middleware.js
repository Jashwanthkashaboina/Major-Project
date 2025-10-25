const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema,reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");


//Authentication Middleware
module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be login to create Listing");
        return res.redirect("/login");
    }
    next();
}

//Middleware to save redirect url
module.exports.savedRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

//Ownership Middlware
module.exports.isOwner = async(req,res,next)=>{
    let { id }  = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not authorized to do this action");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

//Listing Validation Middleware
module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        //let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,error.toString());
    }
    else next();
}


//Review Validation Middleware
module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error.toString());
    }
    else next();
}

module.exports.isReviewAuthor = async(req,res,next)=>{
    let { id,reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not authorized to do this action");
        return res.redirect(`/listings/${id}`);
    }
    next();
}