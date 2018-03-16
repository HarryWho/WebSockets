var express=require('express');

var router = express.Router();


router.get('/chat', EnsureAuthenticated,(req, res)=>{
    res.render('index',{show:true,title:"Chat Room"});
    //console.log(req.user.username);
});
router.get('/',(req,res)=>{
    res.render('home',{show:true,title:'Home Page'});
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