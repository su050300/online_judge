var crypto=require('crypto');   //npm module for creating hash password using algorithm
var express=require('express');
var router=express.Router();
var redirectHome = require('../middleware/check').redirectHome;
var connection = require('./db_connection.js');
var nodemailer = require('nodemailer');   //npm module for sending mails using gmail service
var PORT = require('./constant.js');          //importing a file that contains the constant values 


//getting the transporter ready to connect to our account
var transporter = nodemailer.createTransport({
  service: 'gmail',
  port: PORT['PORT'],
  secure: true,
      auth: {
    user: 'blackhat050300@gmail.com',
    pass: 'Mnnit@123456'
  }

});


//details of email to be send
var mailOptions = {
  from: 'blackhat050300@gmail.com',
  subject: 'One time otp for password change from codespark'
};


//get api for forget password page
router.get('/',redirectHome,function(req,res,next){
 
  res.render('forget_password.ejs',{message:''});

});

//post api taking the username and sending him 4 digit random otp
router.post('/',redirectHome,function(req,res,next){

      connection.query('SELECT * FROM user WHERE username = ?',[req.body.username], function (err, rows, fields) {
          if (err) throw err
          if(!rows.length){
              res.render('forget_password.ejs',{message:'Username not exists'});
          }
          else {
            var val = Math.floor(1000 + Math.random() * 9000);
            mailOptions.to = rows[0]['email'];
            mailOptions.html = '<p>Your one time OTP password for reset password is ' + val +' .</p>';
                          
            transporter.sendMail(mailOptions, function(error, info) {
                console.log('mailed');
                if (error) {
                  console.log(error);
                } 
                else {
                  console.log('Email sent: ' + info.response);
                }
            });

            var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
            indiaTime = new Date(indiaTime);
            indiaTime = indiaTime.toLocaleString().split(',');

            indiaTime[0] = indiaTime[0].split('/').reverse().join('-');
            indiaTime[1] = indiaTime[1].slice(1,indiaTime[1].length);
            indiaTime[0] = indiaTime[0] + ' ' + indiaTime[1];
            
              connection.query('INSERT INTO otp_table (username,otp,datetime) VALUES (?,?,?)', [req.body.username,val,indiaTime[0]], function (err, rows,fields) {
                  if (err) throw err

                  res.render('otp',{message:'OTP is send to your registered email id',message1:req.body.username});
              });
          }
      });
});

//post api for matching the otp send and the otp given by the user
//validity of otp if for next 10 minutes from the time of setting
router.post('/otp_match',redirectHome,function(req,res,next){

    connection.query('SELECT * FROM otp_table WHERE username = ? ORDER BY datetime DESC',[req.body.username], function (err, rows, fields) {
        if (err) throw err
        if(!rows.length){
            res.render('otp',{message:'OTP mismatch',message1:req.body.username});
        }
        else {
            
            var date = rows[0]['datetime'];          
            date.setSeconds(date.getSeconds() - 330*60);
            date = date.toLocaleString();

            date = date.split(',');
            date[0] = date[0].split('/').reverse().join('-');
            
            date[1] = date[1].slice(1,date[1].length);
            date[0] = date[0] + ' ' + date[1];
            
            
            
            var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
            indiaTime = new Date(indiaTime);
            indiaTime.setSeconds(indiaTime.getSeconds() - 10*60);
            indiaTime = indiaTime.toLocaleString().split(',');
            indiaTime[0] = indiaTime[0].split('/').reverse().join('-');
            indiaTime[1] = indiaTime[1].slice(1,indiaTime[1].length);
            indiaTime[0] = indiaTime[0] + ' ' + indiaTime[1];
            

            if (indiaTime[0] > date[0] || req.body.otp != rows[0]['otp']){
                res.render('otp',{message:'OTP mismatch',message1:req.body.username});
            }
            else{
                res.render('new_password',{message:'',message1:req.body.username});                            
            } 
            
        }
    });
});

//post api for letting user set new password after otp match is done
router.post('/new_password',redirectHome,function(req,res,next){

    //finding hashed password of the entered password
    var  pass = saltHashPassword(req.body.password);
    connection.query('UPDATE user SET password = ? WHERE username = ?',[pass,req.body.username], function (err, rows, fields) {
        if (err) throw err
        
        connection.query('SELECT * FROM user WHERE username = ?', [req.body.username], function (err, rows,fields) {
                if (err) throw err

                req.session.username = req.body.username;
                req.session.userId = rows[0]['id'];
                res.redirect('/home');
        });
    });
})



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
