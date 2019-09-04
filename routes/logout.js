var express=require('express');
var router=express.Router();
var redirectLogin = require('../middleware/check').redirectLogin;

router.get('/',redirectLogin,function(req,res,next){
    // if (err) throw err
    // req.session.destroy(err => {
    //     if (err){
    //         res.redirect('/home');
    //     }
    res.clearCookie('user');
         req.session = null;
        
        res.redirect('/login');
    // });
});
module.exports=router;