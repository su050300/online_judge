var express=require('express');
var router=express.Router();
var connection = require('./db_connection.js');



router.get('/' ,(function(req,res,next){
    if(req.session.username)
        res.render('home.ejs',{message:req.session.username})

    else
        res.render('home.ejs',{message:''});
}));
module.exports=router;
