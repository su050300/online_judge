var express = require('express');
var router = express.Router();
var connection = require('./db_connection.js');
var PORT = require('./constant.js');
var redirectAdminLogin = require('../middleware/check').redirectAdminLogin;
var fs = require('fs-extra');
var nodemailer = require('nodemailer');

router.get('/', redirectAdminLogin, function(req, res, next) {

  res.render('contest_problem_verification.ejs', {
    message: ''
  });

});


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
  subject: 'Contest problem response from codespark'
};


router.post('/', redirectAdminLogin, function(req, res, next) {
  var i = 0;
  connection.query("SELECT problem_id,problem_name,difficulty,subdomain,date FROM contest_new_problems WHERE status = '0'", function(err, rows, fields) {
    if (err) throw err
    if (!rows.length) {
      res.write('No more problems to verify');
    } else {
      while (rows[i]) {
          
        rows[i]['date'] = (rows[i]['date'].toISOString()).slice(0,10);  
        var senddata = '<tr><td><a href="/admin/contest_problem_verification/' + rows[i]['problem_id'] + '">' + rows[i]['problem_name'] + '</a></td><td>' + rows[i]['difficulty']  + '</td><td>' + rows[i]['subdomain'] + '</td><td>' + rows[i]['date'] + '</td></tr>';
        res.write(senddata);
        i++;
      }
      res.end();

    }

  });
});
router.get('/:problem_id', redirectAdminLogin, function(req, res) {
  var problem_id = req.params.problem_id;
  var sql_query = "SELECT us.username,cnp.problem_id,cnp.problem_name,cnp.difficulty,cnp.subdomain,cnp.time_limit,cnp.memory_limit,cnp.problem_statement,cnp.input,cnp.constraints,cnp.output,cnp.sample_in,cnp.sample_out,cnp.explanation FROM contest_new_problems AS cnp INNER JOIN verified_contest_details AS vcd ON (cnp.problem_id = ? AND vcd.contest_id = cnp.contest_id) INNER JOIN user AS us ON vcd.user_id = us.id";
  connection.query(sql_query, [problem_id], function(err, rows, fields) {
    if (err) throw err
        var problem = {
          author: rows[0]['username'],
          problem_id:rows[0]['problem_id'],
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
});

router.get('/:problem_id/verify/', redirectAdminLogin, function(req, res, next) {
  var problem_id = req.params.problem_id;
        connection.query("UPDATE contest_new_problems SET status = '1' WHERE problem_id = ?", [problem_id], function(err, rows, fields) {
            if (err) throw err
        });
        var sql_query = "SELECT us.email,vcd.contest_name,cnp.problem_name,cnp.date FROM contest_new_problems AS cnp INNER JOIN verified_contest_details AS vcd ON (cnp.problem_id = ? AND vcd.contest_id = cnp.contest_id) INNER JOIN user AS us ON vcd.user_id = us.id";
        connection.query(sql_query, [problem_id], function(err, rows, fields) {
            if (err) throw err

            mailOptions.to = rows[0]['email'];
            mailOptions.text = 'Your problem ' + rows[0]['problem_name'] + ' setted on ' + rows[0]['date'] + ' for contest ' + rows[0]['contest_name'] + ' has been verified and is added to your contest';
            transporter.sendMail(mailOptions, function(error, info) {
            console.log('mailed');
             if (error) {
                console.log(error);
            } else {
                 console.log('Email sent: ' + info.response);
            }
            });

            });
            res.redirect('/admin/contest_problem_verification/');
    
          })
        

router.get('/:problem_id/discard', redirectAdminLogin, function(req, res, next) {
  var problem_id = req.params.problem_id;
  var sql_query = "SELECT us.email,vcd.contest_name,cnp.problem_name,cnp.date FROM contest_new_problems AS cnp INNER JOIN verified_contest_details AS vcd ON (cnp.poblem_id = ? AND vcd.contest_id = cnp.contest_id) INNER JOIN user AS us ON vcd.user_id = us.id";
  connection.query(sql_query, [problem_id], function(err, rows, fields) {
    if (err) throw err
    else {
          mailOptions.to = rows[0]['email'];
          mailOptions.text = 'Your problem ' + rows[0]['problem_name'] + ' setted on ' + rows[0]['date'] + ' for contest ' + rows[0]['contest_name'] + ' has been disqualified due to certain reasons';
          transporter.sendMail(mailOptions, function(error, info) {
             console.log('mailed');
             if (error) {
               console.log(error);
             } else {
                console.log('Email sent: ' + info.response);
             }
            });
            connection.query('DELETE FROM contest_new_problems WHERE problem_id = ?',[problem_id],function(err,rows,fields){
                if (err) throw err
            });
     }
  });
  
  res.redirect('/admin/contest_problem_verification/');
});

module.exports = router;