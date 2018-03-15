var express= require('express');
var router = express.Router();
var User = require('../models/user');
var passport=require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Login
router.get('/login', function(req, res){
    res.render('login',{show:false,title:'Login'});
});

passport.use(new LocalStrategy(
    function(username, password, done) {
      User.getUserByUserName(username,function(err, user){
        if(err) throw err;
        if(!user){
            return done(null, false, {message:'Unknown User'})
        }

        User.compareUser(password, user.password, function(err, isMatch){
            if(err) throw err;
            if(isMatch){
                return done(null,user);
            }else{
                return done(null, false, {message:"Invalid Password"});
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
  passport.authenticate('local',{successRedirect:'/', failureRedirect:'/users/login', failureFlash:true}),
  function(req, res) {
      
   res.redirect('/');
});

/// Register
router.get('/register', function(req,res){
    res.render('register',{show:false,title:'Register'});
});
router.post('/register', function(req,res){
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;
     req.check('username').isLength({min:1}).withMessage("Username is a required field");
     req.check('email').isEmail().withMessage("Email isnt a valid email");
     req.check('email').isLength({min:1}).withMessage("Email is a requied field");
     req.check('password').isLength({min:6}).withMessage("Password must be at least 6 characters");
     req.check('password2', 'Password do not match').equals(req.body.password);
     var errors = req.validationErrors();
     if(errors){
         res.render('register',{title:"Register",errors:errors});
     }else{
         var newUser = new User({
             username:username,
             email:email,
             password:password,
             hasValidated:false,
             permission:1
         });
         User.createUser(newUser,(err, user)=>{
            if(err) throw err;
            console.log(user);
         });
         req.flash('success_msg','You have successfully registered. You may now Login');
         res.redirect('/users/login');
     }
});

router.get('/logout', (req, res)=>{
    req.logOut();

    res.redirect('/users/login');

});
module.exports=router;