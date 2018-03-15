var express=require('express');

var router = express.Router();


router.get('/', EnsureAuthenticated,(req, res)=>{
    res.render('index',{show:true,title:"Chat Room"});
    //console.log(req.user.username);
});

function EnsureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('error_msg', "Please login to view this page");
        res.redirect('/users/login');
    }
}
module.exports = router;