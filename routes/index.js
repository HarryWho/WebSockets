var express=require('express');

var router = express.Router();


router.get('/',(req, res)=>{
    res.render('index',{show:true,title:"Chat Room"});
});

module.exports = router;