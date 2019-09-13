var crypto=require('crypto');   //npm module for creating hash password using algorithm
var express=require('express');
var router=express.Router();
var redirectAdminHome = require('../middleware/check').redirectAdminHome;
var connection = require('./db_connection.js');


//get api for admin login page
router.get('/',redirectAdminHome,function(req,res,next){
    res.render('adminlogin.ejs',{message:''});
});


//post api for admin login page and checking for valid credentials
router.post('/',redirectAdminHome,function(req,res,next){

    var  pass = saltHashPassword(req.body.password);
    connection.query('SELECT password FROM admin WHERE username = ?',[req.body.username], function (err, rows, fields) {
        if (err) throw err
       
        if(!rows.length){
            res.render('adminlogin.ejs',{message:'Username not exists'});
        }
        else if(rows[0]['password'] !== pass){
           res.render('adminlogin.ejs',{message:'Username and password do not match'});
        }
        else {
           req.session.adminname = req.body.username;
           res.redirect('/admin/home');
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
