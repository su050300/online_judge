var express=require('express');
var router=express.Router();
var connection = require('./db_connection.js');
var redirectContestLogin = require('../middleware/check').redirectContestLogin;



router.get('/' ,redirectContestLogin,(function(req,res,next){
    res.render('contesthome.ejs',{message:''});
}));
module.exports=router;
