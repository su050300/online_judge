var express=require('express');
var router=express.Router();
var redirectContestLogin = require('../middleware/check').redirectContestLogin;


router.get('/' ,redirectContestLogin,(function(req,res,next){
    res.render('add_challenge.ejs',{message:''});
}));
module.exports=router;
