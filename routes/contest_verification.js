var express = require('express');
var router = express.Router();
var connection = require('./db_connection.js');
var PORT = require('./constant.js');          //importing a file that contains the constant values 
var redirectAdminLogin = require('../middleware/check').redirectAdminLogin;
var crypto=require('crypto');   //npm module for creating hash password using algorithm
var nodemailer = require('nodemailer');   //npm module for sending mails using gmail service


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
  subject: 'Contest verification response from codespark'
};


//get api for getting the pending contest to be verified in admin panelaccording to page number
router.get('/:page_no', redirectAdminLogin, function(req, res, next) {
  res.render('contest_verification.ejs', {message: ''});
});


//get api for getting the pending contest to be verified in admin panel according to page number 
router.post('/:page_no', redirectAdminLogin, function(req, res, next) {
  var i = 0;
  var page_no = req.params.page_no; 
  connection.query('SELECT contest_id,contest_name FROM contest_details', function(err, rows, fields) {
    if (err) throw err
    
    if (!rows.length) {
      var senddata = '0';
      var data = {senddata}
      res.send(data);
    } 
    else {
      var pages = Math.ceil(rows.length*1.0/20.0);
      var page_info = "";

      //setting info for pagination
      for (var i = 1;i <= pages;i++){
        page_info += "<li class='page-item'><a class='page-link' href = '/admin/contest_verification/" + i + "'>" + i + "</a></li>"; 
      }

      var senddata = "";
      var upper_bound = page_no*20;
      if (page_no*20 > rows.length)
        upper_bound = rows.length;

      for (var i = (page_no-1)*20;i < upper_bound;i++) {
        senddata += '<tr><td>' + rows[i]['contest_id'] + '</td><td><a href="/admin/contest_verification/' + page_no + '/' + rows[i]['contest_id'] + '">' + rows[i]['contest_name'] + '</a></td></tr>';
      }

      var data = {senddata,page_info}
      res.send(data);
    }

  });
});


//get api for opening contest info that is displayed on the contest verification page
router.get('/:page_no/:contest_id', redirectAdminLogin, function(req, res) {
  var contest_id = req.params.contest_id;
  connection.query('SELECT * FROM contest_details WHERE contest_id = ?', [contest_id], function(err, rows, fields) {
    if (err) throw err
    if (!rows.length) {
      res.redirect('/admin/contest_verification/' + page_no);
    } else {
      var startDate = rows[0]['start_date'];
      var endDate = rows[0]['end_date'];
      
      startDate = startDate.toUTCString();
      startDate =startDate.slice(0,16);
      endDate = endDate.toUTCString();
      endDate = endDate.slice(0,16);
      connection.query('SELECT username FROM user WHERE id = ?', [rows[0]['user_id']], function(err, rows1, fields) {
        if (err) throw err
        var contest_info = {
          author: rows1[0]['username'],
          contest_id:rows[0]['contest_id'],
          contest_name: rows[0]['contest_name'],
          start_date: startDate ,
          start_time: rows[0]['start_time'],
          end_date: endDate,
          end_time: rows[0]['end_time'],
          org_type: rows[0]['org_type'],
          org_name: rows[0]['org_name'],

        }
        //rendering the contest data
        res.render('contest_info', contest_info);
      });
    }
  });
});


//get api for sending mail to notify the user about the completed verification of his setted contest 
router.get('/:page_no/:contest_id/verify/', redirectAdminLogin, function(req, res, next) {
  var contest_id = req.params.contest_id;
  connection.query('SELECT * FROM contest_details WHERE contest_id=?', [contest_id], function(err, rows, fields) {
    if (err) throw err
    else {
        var date=rows[0]['date'];
        var user_id = rows[0]['user_id'];
        var contest_name=rows[0]['contest_name'];
        var username=contest_name+contest_id;
        
        //generating a 10 character long random password string hashing it using sha512 and hmac algorithm of crypto
        var password=crypto.randomBytes(5).toString('hex');
        console.log(password);
        var hashpassword=saltHashPassword(password);

       const contest_details = {
           contest_id:contest_id,
           user_id: user_id,
           contest_name : rows[0]['contest_name'],
           start_date :rows[0]['start_date'],
           start_time : rows[0]['start_time'],
           end_date :rows[0]['end_date'],
           end_time : rows[0]['end_time'],
           org_type : rows[0]['org_type'],
           org_name : rows[0]['org_name'],
           date : rows[0]['date'],
           username:username,
           password:hashpassword,
           description:"This contest is being organized by "+rows[0]['org_name'],
           prizes:"There are a lot of exciting prizes waiting for you like codespark t-shirts and codespark stickers and other goodies.",
           rules:"Do not copy code otherwise you will be disqualified from the contest.",
           scoring:"Each question contains equal marks and can be arranged in any order of difficulty."
        }
              
          //inserting the verified contest data into verified_contest_details table                
           connection.query('INSERT INTO verified_contest_details SET ?',[contest_details],function(err, rows, fields){
                if(err)throw err

                //deleting that verified contest data from contest_details table                
                connection.query('DELETE FROM contest_details WHERE contest_id=?', [contest_id], function(err, rows, fields) {
                    if (err) throw err
                    else {

                        //sending email to the contest setter about the verification of his setted contest as well as sending him the contest login username as well as 10 character long password to manage contest
                        connection.query('SELECT email FROM user WHERE id = ?', [user_id], function(err, rows, fields) {
                          if (err) throw err

                          mailOptions.to = rows[0]['email'];
                          mailOptions.html = '<p>Your contest ' + contest_name + ' submitted on ' + date + ' has been verified.</p><p> Login with following credentials:</p><p><strong>Username:'+ username + '</strong></p><p><strong> Password: ' + password + '</strong></p>';
                          
                          transporter.sendMail(mailOptions, function(error, info) {
                            console.log('mailed');
                            if (error) {
                              console.log(error);
                            } else {
                              console.log('Email sent: ' + info.response);
                            }
                          });
                        });
                      }

                    res.redirect('/admin/contest_verification/'+req.params.page_no);
              });
        });
    }

  });
});


//get api for sending mail to notify the user about discarding of his setted contest due to some reason/issue 
router.get('/:page_no/:contest_id/discard/', redirectAdminLogin, function(req, res, next) {
  var contest_id = req.params.contest_id;
  connection.query('SELECT * FROM contest_details WHERE contest_id=?', [contest_id], function(err, rows, fields) {
    if (err) throw err
    else {
        var date=rows[0]['date'];
        var user_id = rows[0]['user_id'];
        var contest_name=rows[0]['contest_name'];
    }
        //deleting entry from the table 
        connection.query('DELETE FROM contest_details WHERE contest_id=?', [contest_id], function(err, rows, fields) {
            if (err) throw err
      
            else {
                connection.query('SELECT email FROM user WHERE id = ?', [user_id], function(err, rows, fields) {
                   if (err) throw err

                  mailOptions.to = rows[0]['email'];
                  mailOptions.html = '<p>Your contest ' + contest_name + ' submitted on ' + date + ' has been discarded.</p>';
                  
                  //sending mail about discarding contest
                  transporter.sendMail(mailOptions, function(error, info) {
                    console.log('mailed');
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                });
           }
        res.redirect('/admin/contest_verification/'+req.params.page_no);
    });

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
