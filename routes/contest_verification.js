var express = require('express');
var router = express.Router();
var connection = require('./db_connection.js');
var PORT = require('./constant.js');
var redirectAdminLogin = require('../middleware/check').redirectAdminLogin;
var fs = require('fs-extra');
var crypto=require('crypto');


var path = require("path");
var nodemailer = require('nodemailer');

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
  subject: 'Contest verification response from codespark'
};

router.get('/', redirectAdminLogin, function(req, res, next) {
  // res.writeHead(200,{'Content-Type':'text/h2tml'});

  res.render('contest_verification.ejs', {
    message: ''
  });

});


router.post('/', redirectAdminLogin, function(req, res, next) {
  var i = 0;
  connection.query('SELECT contest_id,contest_name FROM contest_details', function(err, rows, fields) {
    if (err) throw err
    if (!rows.length) {
      res.write('no more contest to verify');
    } else {
      while (rows[i]) {
        var senddata = '<tr><td>' + rows[i]['contest_id'] + '</td><td><a href="/admin/contest_verification/' + rows[i]['contest_id'] + '">' + rows[i]['contest_name'] + '</a></td></tr>';
        res.write(senddata);
        i++;
      }
      res.end();

    }

  });
});
router.get('/:contest_id', redirectAdminLogin, function(req, res) {
  var contest_id = req.params.contest_id;
  connection.query('SELECT * FROM contest_details WHERE contest_id = ?', [contest_id], function(err, rows, fields) {
    if (err) throw err
    if (!rows.length) {
      res.redirect('/admin/contest_verification/');
    } else {
      connection.query('SELECT username FROM user WHERE id = ?', [rows[0]['user_id']], function(err, rows1, fields) {
        if (err) throw err
        var contest_info = {
          author: rows1[0]['username'],
          contest_id:rows[0]['contest_id'],
          contest_name: rows[0]['contest_name'],
          start_date: rows[0]['start_date'],
          start_time: rows[0]['start_time'],
          end_date: rows[0]['end_date'],
          end_time: rows[0]['end_time'],
          org_type: rows[0]['org_type'],
          org_name: rows[0]['org_name']
        }
        res.render('contest_info', contest_info);
      });
    }
  });
});







router.get('/:contest_id/verify/', redirectAdminLogin, function(req, res, next) {
  var contest_id = req.params.contest_id;
  connection.query('SELECT * FROM contest_details WHERE contest_id=?', [contest_id], function(err, rows, fields) {
    if (err) throw err
    else {
              var date=rows[0]['date'];
              var user_id = rows[0]['user_id'];
              var contest_name=rows[0]['contest_name'];
              var username=contest_name+contest_id;
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
                password:hashpassword
              }
              connection.query('INSERT INTO verified_contest_details SET ?',[contest_details],function(err, rows, fields){
                if(err)throw err
                connection.query('DELETE FROM contest_details WHERE contest_id=?', [contest_id], function(err, rows, fields) {
                    if (err) throw err
                    else {

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
        res.redirect('/admin/contest_verification/');

    });
      });
}

});
});

router.get('/:problem_id/discard', redirectAdminLogin, function(req, res, next) {
  var problem_id = req.params.problem_id;
  connection.query('SELECT * FROM problems WHERE problem_id = ?', [problem_id], function(err, rows, fields) {
    if (err) throw err
    else {
      var problem_date = rows[0]['date'];
      var user_id = rows[0]['user_id'];
      var problem_id = rows[0]['problem_id'];
      var problem_name=rows[0]['problem_name'];
      var prevdir =__dirname+'/../problems/testcase/' + problem_id;
      fs.removeSync(prevdir);
      connection.query('SELECT email FROM user WHERE id = ?', [user_id], function(err, rows, fields) {
        if (err) throw err
        else {
          mailOptions.to = rows[0]['email'];
          mailOptions.text = 'Your problem ' + problem_name + ' setted on ' + problem_date + ' has been disqualified due to certain reasons';
          connection.query('DELETE FROM problems WHERE problem_id = ?', [problem_id], function(err, rows, fields) {
            if (err) throw err
            transporter.sendMail(mailOptions, function(error, info) {
              console.log('mailed');
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
            res.redirect('/admin/problem_verification/');
          });
        }
      });
      res.redirect('/admin/problem_verification/');
    }
  })
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
