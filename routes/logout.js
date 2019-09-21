var express=require('express');
var router=express.Router();
var redirectLogin = require('../middleware/check').redirectLogin;


//get api to delete the setted cookie as well as session and set it to null
router.get('/',redirectLogin,function(req,res,next){
    req.session.username = null;
    req.session.userId = null;
        
    res.redirect('/homepge');
});

module.exports=router;