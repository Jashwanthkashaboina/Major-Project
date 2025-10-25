const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
//To sign-in
router.get("/signup",(req,res)=>{
    res.render("users/signup");
});
//to sign-up
router.post("/signup",wrapAsync(async(req,res)=>{
    try{
        let {username,email,password} = req.body;
        const newUser = new User({email,username});
        const registeredUser = await User.register(newUser,password);
        console.log(registeredUser);
        req.flash("success","Welcome to WanderLust");
        res.redirect("/listings");
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
        return;
    }
}));
//to login
router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});

router.post("/login",
    passport.authenticate("local",{failureRedirect: "/login",failureFlash: true}),
    (req,res)=>{
    req.flash("success","Welcome back to  WanderLust !");
    res.redirect("/listings");
});

//logout route
router.get("/logout",(req,res)=>{
    //this will take callback as a parameter
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are LoggedOut !");
        res.redirect("/listings");
    });
});

module.exports = router;