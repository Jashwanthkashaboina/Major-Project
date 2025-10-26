const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");


//To sign-in
router.get("/signup",userController.renderSignupForm);
//to sign-up
router.post("/signup",wrapAsync(userController.signup));
//to login
router.get("/login",userController.renderLoginForm);

router.post("/login",savedRedirectUrl,
    passport.authenticate("local",{failureRedirect: "/login",failureFlash: true}),userController.login);

//logout route
router.get("/logout",userController.logout);

module.exports = router;