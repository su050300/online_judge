var crypto=require('crypto');   //npm module for creating hash password using algorithm
var express=require('express');
var router=express.Router();
var redirectHome = require('../middleware/check').redirectHome;
var connection = require('./db_connection.js');


//get api for login page
router.get('/',redirectHome,function(req,res,next){
  res.render('login.ejs',{message:''});

});


//post api for login page and checking for valid credentials
router.post('/',redirectHome,function(req,res,next){

      //finding hashed password of the entered password
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
              connection.query('SELECT * FROM user WHERE username = ?', [req.body.username], function (err, rows,fields) {
                  if (err) throw err
                  req.session.username = req.body.username;
                  req.session.userId = rows[0]['id'];
                  res.redirect('/home');
              });
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
