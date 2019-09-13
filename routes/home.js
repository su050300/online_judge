var express=require('express');
var router=express.Router();



//get api for the home page of user after login is successful
router.get('/' ,(function(req,res,next){
    if(req.session.username)
        res.render('home.ejs',{message:req.session.username})

    else
        res.render('home.ejs',{message:''});
}));
module.exports=router;
