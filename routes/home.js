var express=require('express');
var router=express.Router();
var redirectLogin = require('../middleware/check').redirectLogin;


//get api for the home page of user after login is successful
router.get('/' ,redirectLogin,(function(req,res,next){
    if(req.session.username)
        res.render('home.ejs',{message:req.session.username})

    else
        res.render('home.ejs',{message:''});
}));

module.exports=router;
