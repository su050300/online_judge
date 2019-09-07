var express=require('express');
var router=express.Router();
var connection = require('./db_connection.js');



router.get('/' ,(function(req,res,next){
    if(req.session.adminname)
        res.render('adminhome.ejs',{message:req.session.adminname})

    else
        res.render('adminhome.ejs',{message:''});
}));
module.exports=router;
