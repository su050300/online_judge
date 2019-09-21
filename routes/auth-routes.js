var express=require('express');
var router=express.Router();
var connection = require('./db_connection.js');
var passport = require('passport');           //passport js module for authentication using github
var GitHubStrategy = require('passport-github2').Strategy;

//serializing the user
passport.serializeUser(function(user, done) {
  done(null, user);
});


//deserializing the user
passport.deserializeUser(function(user, done) {
  done(null, user);
});

//initializing the passport using router
router.use(passport.initialize());


//using passprt js for authenticated login using github
passport.use(new GitHubStrategy({
    clientID: "e2f5209b92dfdb7a4a5e",
    clientSecret: '1c6dcbcbf2f8fd8662f9169b42b177128423a20e',
    callbackURL: "http://localhost:3000/auth/github/redirect"
  },
  function(req,accessToken, refreshToken, profile, done) {
    return done(null,profile);    
  }
));

//get api for redirecting to github profile page
router.get('/',
  passport.authenticate('github', { scope: ['user'] }));


 //get api for redirecting url 
router.get('/redirect', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect github_login_response.
    

    //checking for already exists username as well as email id
    if (!req.user.emails){
      res.render('login',{message:'Please make your email id public in GitHub to login using Github'});
    }
    else{
      connection.query('SELECT * FROM user WHERE username = ? AND email = ?',[req.user.username,req.user.emails[0]['value']],function(err,rows,fileds){
        if (err) throw err
        
        if (rows.length){
          req.session.username = rows[0]['username'];
          req.session.userId = rows[0]['id'];
          res.redirect('/home');
        }
        else{
          //if username and email id not exists making his vredentials and redirecting to more info page
          connection.query('SELECT * FROM user WHERE username = ?',[req.user.username],function(err,rows,fileds){
              if (err) throw err

              if (rows.length){
                res.render('login',{message:'Username already exists'});
              }
              else{
                connection.query('SELECT * FROM user WHERE email = ?',[req.user.emails[0]['value']],function(err,rows,fileds){
                  if (err) throw err

                  if (rows.length){
                    res.render('login',{message:'Email Id already exists'});
                  }
                  else{
                      res.render('github_login_response',{message1:req.user.username,message2:req.user.emails[0]['value']});
                  }
                });
              }
            
          });
        }
    });
    }

});


//getting additional details of the user logging through github for the first time
router.post('/form',function(req,res,next){
     const user = {
         name : req.body.name,
         username : req.body.username,
         email : req.body.email,
         password : 'harshitharshitharshitharshitharshitharsh',
         gender : req.body.gender,
         city : req.body.city,
         state : req.body.state,
         college : req.body.college
      }

      //inserting new user data into table
         connection.query('INSERT INTO user SET ?', [user], function (err, rows,fields) {
            if (err) throw err

            connection.query('SELECT * FROM user WHERE username = ?', [req.body.username], function (err, rows,fields) {
              if (err) throw err

              req.session.username = user.username;
              req.session.userId = rows[0]['id'];
              res.redirect('/home');
            });
         });

});


module.exports = router;