var express = require('express');
var router = express.Router();
var connection = require('./db_connection.js');
var PORT = require('./constant.js');
var redirectAdminLogin = require('../middleware/check').redirectAdminLogin;
var fs = require('fs-extra');

var path = require("path");

router.get('/', redirectAdminLogin, function(req, res, next) {
  // res.writeHead(200,{'Content-Type':'text/h2tml'});

  res.render('problem_verification.ejs', {
    message: ''
  });

});
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
  subject: 'Problem response from codespark'
};




router.post('/', redirectAdminLogin, function(req, res, next) {
  // res.writeHead(200,{'Content-Type':'text/html'});
  var i = 0;
  connection.query('SELECT problem_id,problem_name,difficulty,subdomain,date FROM problems ', function(err, rows, fields) {
    if (err) throw err
    if (!rows.length) {
      res.write('no more problems to verify');
    } else {
      while (rows[i]) {
        rows[i]['date'] = (rows[i]['date'].toISOString()).slice(0,10);
        var senddata = '<tr><td><a href="/admin/problem_verification/' + rows[i]['problem_id'] + '">' + rows[i]['problem_name'] + '</a></td><td>' + rows[i]['difficulty']  + '</td><td>' + rows[i]['subdomain'] + '</td><td>' + rows[i]['date'] + '</td></tr>';
        res.write(senddata);
        i++;
      }
      res.end();

    }

  });
});
router.get('/:problem_id', redirectAdminLogin, function(req, res) {
  var problem_id = req.params.problem_id;
  connection.query('SELECT * FROM problems WHERE problem_id = ?', [problem_id], function(err, rows, fields) {
    if (err) throw err
    if (!rows.length) {
      res.redirect('/admin/problem_verification/');
    } else {
      connection.query('SELECT username FROM user WHERE id = ?', [rows[0]['user_id']], function(err, rows1, fields) {
        if (err) throw err
        var problem = {
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


router.get('/:problem_id/verify/', redirectAdminLogin, function(req, res, next) {
  var problem_id = req.params.problem_id;
  connection.query('INSERT INTO verified_problems SELECT * FROM problems WHERE problem_id=?', [problem_id], function(err, rows, fields) {
    if (err) throw err
    else {
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



              connection.query('SELECT email FROM user WHERE id = ?', [user_id], function(err, rows, fields) {
                if (err) throw err

                mailOptions.to = rows[0]['email'];
                mailOptions.text = 'Your problem ' + problem_name + ' setted on ' + problem_date + ' has been verified and is added to the site';
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
        res.redirect('/admin/problem_verification/');
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
      var problem_name = rows[0]['problem_name'];
      var prevdir = __dirname + '/../problems/testcase/' + problem_id;
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









module.exports = router;
