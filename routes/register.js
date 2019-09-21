var crypto=require('crypto');   //npm module for creating hash password using algorithm
var express=require('express');
var router=express.Router();
var redirectHome = require('../middleware/check').redirectHome;
var connection = require('./db_connection.js');


//get api for register page
router.get('/',redirectHome,function(req,res,next){
  res.render('register.ejs',{message:''});

});


//post api for register page
router.post('/',redirectHome,function(req,res,next){
  
  //checking for existing username
  connection.query('SELECT * FROM user WHERE username = ?',[req.body.username], function (err, rows, fields) {
    if (err) throw err
    if(rows.length){
      res.render('register',{message:'Username already exists'});
    }
    else{
      connection.query('SELECT * FROM user WHERE email = ?', [req.body.email], function (err, rows, fields) {
        if (err) throw err
    
        if(rows.length){
      res.render('register',{message:'Email already exists'});
        }
        else{
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

      //inserting new user data into table
         connection.query('INSERT INTO user SET ?', [user], function (err, rows,fields) {
            if (err) throw err
            connection.query('SELECT * FROM user WHERE username = ?', [user.username], function (err, rows,fields) {
              if (err) throw err
            req.session.username = user.username;
            req.session.userId = rows[0]['id'];
            res.redirect('/home');
            });
         });

        }
      });
    }
  });
});


// function for creating hashed password
function saltHashPassword(password)
{
  var salt = "aejjdgerjrxzcxzvbfahjaer";
  var hash = crypto.createHmac('sha512', salt);   //algorithm used using crypto
  hash.update(password);
  var value = hash.digest('hex');
  value=value.slice(0,40);
  return value;

}
module.exports=router;
