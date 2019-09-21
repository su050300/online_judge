var express = require('express');
var router = express.Router();
var connection = require('./db_connection.js');
var PORT = require('./constant.js');          //importing a file that contains the constant values 
var redirectAdminLogin = require('../middleware/check').redirectAdminLogin;
var fs = require('fs-extra');         //npm module for handling files and folders
var nodemailer = require('nodemailer');   //npm module for sending mails using gmail service

//creating nodemailer transporter
var transporter = nodemailer.createTransport({
  service: 'gmail',
  port: PORT['PORT'],
  secure: true,
  auth: {
    user: 'blackhat050300@gmail.com',
    pass: 'Mnnit@123456'
  }
});

var mailOptions = {
  from: 'blackhat050300@gmail.com',
  subject: 'Problem response from codespark'
};


//get api for getting problem verfication admin page according to page number
router.get('/:page_no', redirectAdminLogin, function(req, res, next) {
  res.render('problem_verification.ejs', {message: ''});
});


//post api for getting problem verfication admin page according to page number
router.post('/:page_no', redirectAdminLogin, function(req, res, next) {
  var page_no = req.params.page_no; 
  var i = 0;
  connection.query('SELECT problem_id,problem_name,difficulty,subdomain,date FROM problems ', function(err, rows, fields) {
    if (err) throw err
    if (!rows.length) {
      var senddata = '0';
      var data = {senddata}
      res.send(data);
    } 
    else {

      //setting info for pagination
      var pages = Math.ceil(rows.length*1.0/20.0);
      var page_info = "";
      for (var i = 1;i <= pages;i++){
        page_info += "<li class='page-item'><a class='page-link' href = '/admin/problem_verification/" + i + "'>" + i + "</a></li>"; 
      }

      var senddata = "";
      var upper_bound = page_no*20;
      if (page_no*20 > rows.length)
        upper_bound = rows.length;

      for (var i = (page_no-1)*20;i < upper_bound;i++){
        rows[i]['date'] = (rows[i]['date'].toISOString()).slice(0,10);
        senddata += '<tr><td><a href="/admin/problem_verification/' + page_no + '/'  +rows[i]['problem_id'] + '">' + rows[i]['problem_name'] + '</a></td><td>' + rows[i]['difficulty']  + '</td><td>' + rows[i]['subdomain'] + '</td><td>' + rows[i]['date'] + '</td></tr>';
      }

      var data = {senddata,page_info}
      res.send(data);
     }
  });
});


//get api for opening problem that is displayed on the problem verification page
router.get('/:page_no/:problem_id', redirectAdminLogin, function(req, res) {
  var problem_id = req.params.problem_id;
  
  //fetching problem details
  connection.query('SELECT * FROM problems WHERE problem_id = ?', [problem_id], function(err, rows, fields) {
    if (err) throw err
    
    if (!rows.length) {
      res.redirect('/admin/problem_verification/' + page_no);
    }
    else {

      connection.query('SELECT username FROM user WHERE id = ?', [rows[0]['user_id']], function(err, rows1, fields) {
        if (err) throw err
        
        var problem = {
          check_id:-1,
          contest_id:0,
          status: 'unverified',
          author: rows1[0]['username'],
          problem_id: rows[0]['problem_id'],
          problem_name: rows[0]['problem_name'],
          difficulty: rows[0]['difficulty'],
          subdomain: rows[0]['subdomain'],
          time_limit: rows[0]['time_limit'],
          memory_limit: rows[0]['memory_limit'],
          problem_statement: rows[0]['problem_statement'],
          input: rows[0]['input'],
          constraints: rows[0]['constraints'],
          output: rows[0]['output'],
          sample_in: rows[0]['sample_in'],
          sample_out: rows[0]['sample_out'],
          explanation: rows[0]['explanation']
        }
        
        res.render('problem', problem);
      });
    }
  });
});

//get api for sending mail to notify the user about the completed verification of his setted problem  
router.get('/:page_no/:problem_id/verify/', redirectAdminLogin, function(req, res, next) {
  var problem_id = req.params.problem_id;

  //inserting the verified problem data into verified_problems table
  connection.query('INSERT INTO verified_problems SELECT * FROM problems WHERE problem_id=?', [problem_id], function(err, rows, fields) {
    if (err) throw err
    
    else {
      //deleting that verified problem data from problems table
      connection.query('DELETE FROM problems WHERE problem_id=?', [problem_id], function(err, rows, fields) {
        if (err) throw err

        else {
          connection.query('SELECT * FROM verified_problems WHERE problem_id = ?', [problem_id], function(err, rows, fields) {
            if (err) throw err
            else {
              var problem_date = rows[0]['problem_date'];
              var user_id = rows[0]['user_id'];
              var problem_id = rows[0]['problem_id'];
              var problem_name = rows[0]['problem_name'];
              var prevdir = __dirname + '/../problems/testcase/' + problem_id;
              var nextdir = __dirname + '/../verified_problems/testcase/' + problem_id;
              
              //moving and copying the testcase and the image to the correct position 
              fs.copySync(prevdir, nextdir);
              fs.removeSync(prevdir);
              var ext = ['.png', '.jpg', '.jpeg'];
              ext.forEach(function(imgext) {
                previmg = __dirname + '/../problems/image/' + problem_id + imgext;
                if (fs.existsSync(previmg)) {
                  var nextimg = __dirname + '/../verified_problems/image/' + problem_id + imgext;
                  fs.moveSync(previmg, nextimg);
                }
              });


              //sending verification completed email via gmail service
              connection.query('SELECT email FROM user WHERE id = ?', [user_id], function(err, rows, fields) {
                if (err) throw err

                mailOptions.to = rows[0]['email'];
                mailOptions.text = 'Your problem ' + problem_name + ' has been verified and is added to the site';
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
          })
        }
        res.redirect('/admin/problem_verification/'+req.params.page_no);
      });

    }
  });
});


//get api for sending mail to notify the user about discarding of his setted problem due to some reason/issue 
router.get('/:page_no/:problem_id/discard', redirectAdminLogin, function(req, res, next) {
  var problem_id = req.params.problem_id;

  connection.query('SELECT * FROM problems WHERE problem_id = ?', [problem_id], function(err, rows, fields) {
    if (err) throw err

    else {
      var problem_date = rows[0]['date'];
      var user_id = rows[0]['user_id'];
      var problem_id = rows[0]['problem_id'];
      var problem_name = rows[0]['problem_name'];
      var prevdir = __dirname + '/../problems/testcase/' + problem_id;
      
      //removing the unwanted testcase and image of dicarded question
      fs.removeSync(prevdir);
      connection.query('SELECT email FROM user WHERE id = ?', [user_id], function(err, rows, fields) {
        if (err) throw err

        else {
          
          mailOptions.to = rows[0]['email'];
          mailOptions.text = 'Your problem ' + problem_name + ' setted on ' + problem_date + ' has been disqualified due to certain reasons';

          //deleting entry from the table
          connection.query('DELETE FROM problems WHERE problem_id = ?', [problem_id], function(err, rows, fields) {
            if (err) throw err

            //sending email about problem discarding
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
      });
      res.redirect('/admin/problem_verification/'+req.params.page_no);
    }
  })
});



module.exports = router;
