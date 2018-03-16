var express= require('express');
var router = express.Router();
var User = require('../models/user');
var passport=require('passport');
var LocalStrategy = require('passport-local').Strategy;
var nodemailer = require('nodemailer');
// Login
router.get('/login', function(req, res){
    res.render('login',{show:false,title:'Login'});
});
router.get('/sendemail/:id', (req, res, next)=>{
    var id =req.params.id;
    User.getUserById(id,(err,user)=>{
        if(err) throw err;
        SendEmail(user,next);
        res.render('/login',{success_msg:'An email has been sent! Please validate using the link that was sent'});
    });
});
passport.use(new LocalStrategy(
    function(username, password, done) {
      User.getUserByUserName(username,function(err, user){
        if(err) throw err;
        if(!user){
            return done(null, false, {message:'Unknown User'})
        }else if(!user.hasValidated){
            done(null, false, {message:'Please validate your request from the email that was sent'});
            
        }

        User.compareUser(password, user.password, function(err, isMatch){
            console.log(isMatch);
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
// email validate
router.get('/validate/:id', (req, res, next)=>{
    var id = req.params.id;
    User.findUserByIdAndUpdatehasValidated(id,(err,result)=>{
        if(err) throw err;
        res.render('login',{success_msg:'Thank you for validating! You can now login'})
    });
});
/// Register
router.get('/register', function(req,res){
    res.render('register',{show:false,title:'Register'});
});
router.post('/register', function(req,res,next){
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
            console.log(user._id);
            // send mail
            SendEmail(user, next);
         
         });
         

         req.flash('success_msg','You have successfully registered. You may now Login');
         res.redirect('/users/login');
     }
});
function SendEmail(user,next){
    const output=`
         <h1>${user.username}</h1>
         <h3>Thank you for registering with us</h3>
         <p>Please follow the below link to validate your request</p>
         <a title='click to validate registration' href='http://localhost:5001/users/validate/${user.id}'>Validate Registration</a>
      `;
            // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'calvin.bartlett42@gmail.com', // generated ethereal user
                pass: '@GemmaErinDan13' // generated ethereal password
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Calvin Bartlett 👻" <calvin.bartlett@bigpond.com>', // sender address
            to:    `"${user.email}"`,   //'bar@example.com, baz@example.com', // list of receivers
            subject: 'Validate Registration ✔', // Subject line
            // text: output, // plain text body
            html: output // html body
        };
        console.log(mailOptions.to+' '+output);
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });
        return next();
}
router.get('/logout', (req, res)=>{
    req.logOut();

    res.redirect('/users/login');

});
module.exports=router;