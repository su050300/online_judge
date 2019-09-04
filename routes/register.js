//*jshint esversion:6
var crypto=require('crypto');
var express=require('express');
var router=express.Router();

var redirectHome = require('../middleware/check').redirectHome;
var connection = require('./db_connection.js');

router.get('/',redirectHome,function(req,res,next){
  res.render('register.ejs',{message:''});

});
router.post('/',redirectHome,function(req,res,next){


  connection.query('SELECT * FROM user WHERE username = ?',[req.body.username], function (err, rows, fields) {
    if (err) throw err
    if(rows.length){
      res.render('register',{message:'Username already exists'});
    }
  });

  connection.query('SELECT * FROM user WHERE email = ?', [req.body.email], function (err, rows, fields) {
    if (err) throw err

    if(rows.length){
  res.render('register',{message:'Email already exists'});
    }
  });
      var  pass=saltHashPassword(req.body.password);
      const user = {
         name : req.body.name,
         username : req.body.username,
         email : req.body.email,
         password : pass,
         gender : req.body.gender,
         city : req.body.city,
         state : req.body.state,
         college : req.body.college
      }
         connection.query('INSERT INTO user SET ?', [user], function (err, rows,fields) {
            if (err) throw err
            req.session.username = user.username;
            res.redirect('/home');
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
