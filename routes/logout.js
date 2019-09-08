var express=require('express');
var router=express.Router();
var redirectLogin = require('../middleware/check').redirectLogin;

router.get('/',redirectLogin,function(req,res,next){
    res.clearCookie('user');
         req.session.username = null;
        
        res.redirect('/login');
});
module.exports=router;