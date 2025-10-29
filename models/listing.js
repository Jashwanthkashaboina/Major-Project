const mongoose = require("mongoose");
const Schema = mongoose.Schema; // we are created this 
// becuase when every time when we create new schema we need to write like "new mongoose.Schema"
// instead we can simply use Schema
const Review = require("./review.js");


const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        url: String,
        filename: String
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }, 
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type:{
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true 
        }
    }
});

//Mongoose MiddleWare
listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
});

//now using the above schema we are creating a model
const Listing = mongoose.model("Listing",listingSchema);
//now we are exporting the above model to app.js
module.exports = Listing;
