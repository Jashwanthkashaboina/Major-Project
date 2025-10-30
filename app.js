if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//we need to use flash above this routes only bcoz with help this routes we'll use flash
//These are from route -- express router
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const sessionOptions = {
    secret: "mysupersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};



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


// app.get("/",(req,res)=>{
//     res.send("Hi! I'm root");
// });

app.use(session(sessionOptions));
app.use(flash());

//we need to use passport below it becuase ...to implement localStrategy we need session
//so repeatedly it is not required to login every time so... we need to use it here
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//Middle Ware
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

//Creating Demo User
// app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });
//     //register is a static method 
//     //it a gives convenience method to register a new user instance with given password
//     //And also checks if username is unique or not
//     let registeredUser = await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// });


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


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