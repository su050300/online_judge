var crypto=require('crypto');   //npm module for creating hash password using algorithm
var express=require('express');
var router=express.Router();
var redirectContestHome = require('../middleware/check').redirectContestHome;
var connection = require('./db_connection.js');


//get api for contest login page
router.get('/',redirectContestHome,function(req,res,next){
    res.render('contestlogin.ejs',{message:''});
});


//post api for contest login page and checking for valid credentials
router.post('/',redirectContestHome,function(req,res,next){

      //finding hashed password of the entered password    
      var  pass = saltHashPassword(req.body.password);
      connection.query('SELECT contest_id,password FROM verified_contest_details WHERE username = ?',[req.body.username], function (err, rows, fields) {
          if (err) throw err
          if(!rows.length){
              res.render('contestlogin.ejs',{message:'Username not exists'});
           }
           else if(rows[0]['password'] !== pass){
              res.render('contestlogin.ejs',{message:'Username and password do not match'});
           }
           else {
              req.session.contest_username = req.body.username;
              req.session.contest_id = rows[0]['contest_id']; 
              res.redirect('/contest/home');
          }
    });
    
});


// function for creating hashed password
function saltHashPassword(password)
{
var salt = "aejjdgerjrxzcxzvbfahjaer";
var hash = crypto.createHmac('sha512', salt);
hash.update(password);
var value = hash.digest('hex');
value=value.slice(0,40);
return value;

}
module.exports=router;
