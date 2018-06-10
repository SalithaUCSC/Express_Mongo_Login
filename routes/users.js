const express = require('express');

const router = express.Router();

const User = require('../models/user')

const passport = require('passport');
const LocalStrategy = require('passport-local');

router.get('/register', function(req, res){
    res.render('register');
});

router.get('/login', function(req, res){
    res.render('login');
});

router.post('/register', function(req, res){
    var username = req.body.username;
    var fullname = req.body.fullname;
    var email = req.body.email;
    var password = req.body.password;
    var cpassword = req.body.cpassword;

    req.checkBody('username', 'Name is required').notEmpty();
    req.checkBody('fullname', 'Full Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Provide a valid email').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('cpassword', 'Confirm Password is required').notEmpty();
    req.checkBody('cpassword', 'Confirm Password should be matched with Password').equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        res.render( 'register', {
            errors: errors
        });
    }
    else {
        var newUser = new User({
            username: username, 
            fullname: fullname, 
            email: email,
            password: password
        });
        User.createUser(newUser, function(err, user) {
            if (err) {
                console.log(err);               
            }
            else {
                req.flash('success_msg', "You are registered");
                res.redirect('/users/login');
            }
        });
    }
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, {message: "Unknown user"});
            }
            User.comparePassword(password, user.password, function(err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                }
                else {
                    return done(null, false, {message: "Invalid Password"});
                }
            });

        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
});

router.post('/login',
    passport.authenticate('local', {succesRedirect: '/', failureRedirect: '/users/login', failureFlash: true}), function(req, res) {
    req.session.username = req.body.username;
    res.redirect('/');
});
 
router.get('/logout', function(req, res){
    req.logout();
    // req.flash('success_msg', "You now logged out");
    req.session.destroy(); 
    res.redirect('/users/login');
});

router.get('/profile', ensureAuthenticated, function(req, res){
    res.render('profile', {
        userSess: req.session.username
    });
});

router.get('/profile/:username', ensureAuthenticated, function(req, res){
    res.render('editProfile', {
        userSess: req.session.username
    });
});

router.post('/update/:id', function (req, res) {
    let user = {};
    user.username = req.body.username;
    user.fullname = req.body.fullname;
    user.email = req.body.email;
    
    let query = { _id: req.params.id }

    User.update(query, user, function(err){
        if(err){
            console.log(err);
            return;
        }
        else{
            req.flash("success_msg", "User Updated Successfully");
            res.redirect('/users/profile');
        }
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect('/users/login');
    }
}

module.exports = router;