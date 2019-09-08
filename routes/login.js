//*jshint esversion:6
var crypto=require('crypto');
var express=require('express');
var router=express.Router();
var redirectHome = require('../middleware/check').redirectHome;
var connection = require('./db_connection.js');


router.get('/',redirectHome,function(req,res,next){
  res.render('login.ejs',{message:''});

});
router.post('/',redirectHome,function(req,res,next){


      var  pass = saltHashPassword(req.body.password);
        connection.query('SELECT password FROM user WHERE username = ?',[req.body.username], function (err, rows, fields) {
            if (err) throw err
            if(!rows.length){
                res.render('login.ejs',{message:'Username not exists'});
             }
             else if(rows[0]['password'] !== pass){
                res.render('login.ejs',{message:'Username and password do not match'});
             }
             else {
                req.session.username = req.body.username;
                res.redirect('/home');
            }
      });


});


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
