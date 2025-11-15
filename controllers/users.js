const User = require("../models/user.js");

module.exports.renderSignupForm = (req,res)=>{
    res.render("users/signup",{ hideSearchBar: true });
};


module.exports.signup = async(req,res)=>{
    try{
        let {username,email,password} = req.body;
        const newUser = new User({email,username});
        const registeredUser = await User.register(newUser,password);
        // console.log(registeredUser);
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to WanderLust");
            res.redirect("/listings");
        });
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
        return;
    }
};


module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs",{ hideSearchBar: true });
};

module.exports.login = async(req,res)=>{
    req.flash("success","Welcome back to  WanderLust !");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res)=>{
    //this will take callback as a parameter
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are LoggedOut !");
        res.redirect("/listings");
    });
};