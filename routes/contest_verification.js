var express = require('express');
var router = express.Router();
var connection = require('./db_connection.js');
var PORT = require('./constant.js');
var redirectAdminLogin = require('../middleware/check').redirectAdminLogin;
var fs = require('fs-extra');

var path = require("path");

router.get('/', redirectAdminLogin, function(req, res, next) {
  // res.writeHead(200,{'Content-Type':'text/h2tml'});

  res.render('contest_verification.ejs', {
    message: ''
  });

});


router.post('/', redirectAdminLogin, function(req, res, next) {
  var i = 0;
  connection.query('SELECT contest_id,contest_name FROM contest_details ', function(err, rows, fields) {
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
  var problem_id = req.params.contest_id;
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


module.exports=router;
