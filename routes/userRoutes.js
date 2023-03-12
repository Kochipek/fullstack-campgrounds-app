const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utilities/catchAsync");
const passport = require('passport');

router.get('/register', (req, res) => {
    res.render('users/register');
});
router.post('/register', catchAsync(async (req, res) => {
    try {
    // grab the email, username, and password from the request body
    const { email, username, password } = req.body;
    const user =  new User({email, username});
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
        if (err) return next(err);
    })
    req.flash('success', `Welcome to YelpCamp, ${username}!`);
    res.redirect('/campgrounds');
    
} catch (e) {
    req.flash('error', e.message);
    res.redirect('register');
}
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), (req, res) => {
    req.flash('success', `Welcome back, ${req.user.username}!`);
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.post(
    "/login",
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
      failureMessage: true,
      keepSessionInfo: true,
    }),
    (req, res) => {
      req.flash("success", "User logged to YelpCamp");
      const redirectUrl = req.session.returnTo || "/campgrounds";
      res.redirect(redirectUrl);
    }
  );


router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      req.flash('success', 'Goodbye!');
      res.redirect('/campgrounds');
    });
  });
//router.post('/login', passport.authenticate('google'),(req, res) => {

module.exports = router;