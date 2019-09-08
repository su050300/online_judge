var express=require('express');
var router=express.Router();
var connection = require('./db_connection.js');
var redirectAdminLogin = require('../middleware/check').redirectAdminLogin;



router.get('/' ,redirectAdminLogin,(function(req,res,next){
    res.render('adminhome.ejs',{message:''});
}));
module.exports=router;
