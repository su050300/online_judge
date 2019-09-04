var express=require('express');
var router=express.Router();
var connection = require('./db_connection.js');

// var async=require('asyncawait/async');
// // var await=require('asyncawait/await');
// var redirectLogin = require('../middleware/check').redirectLogin;


router.get('/' ,(function(req,res,next){
    if(req.session.username)
        res.render('home.ejs',{message:req.session.username})

    else
        res.render('home.ejs',{message:''});
}));
module.exports=router;
