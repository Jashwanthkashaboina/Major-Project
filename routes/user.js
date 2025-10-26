const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");


router.route("/signup")
    //To sign-in
    .get(userController.renderSignupForm)
    //to sign-up
    .post(wrapAsync(userController.signup));


router.route("/login")
    //to login
    .get(userController.renderLoginForm)
    //post login
    .post(savedRedirectUrl,
        passport.authenticate("local",{failureRedirect: "/login",failureFlash: true}),userController.login);

//logout route
router.get("/logout",userController.logout);

module.exports = router;