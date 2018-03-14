var express= require('express');
var router = express.Router();

router.get('/register', function(req,res){
    res.render('register',{show:false,title:'Register'});
});
router.get('/login', function(req, res){
    res.render('login',{show:false,title:'Login'});
});

module.exports=router;