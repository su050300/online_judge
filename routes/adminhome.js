var express=require('express');
var router=express.Router();
var redirectAdminLogin = require('../middleware/check').redirectAdminLogin;

//get api for rendering to the admin home page after valid login
router.get('/' ,redirectAdminLogin,(function(req,res,next){
    res.render('adminhome.ejs',{message:''});
}));
module.exports=router;
