var express = require('express');
var router = express.Router();
var redirectLogin = require('../middleware/check').redirectLogin;
var connection = require('./db_connection.js');

router.get('/', redirectLogin, function(req, res, next) {
  res.render('practice.ejs');
});

router.get('/:problem_id',redirectLogin, function(req,res){
    var problem_id=req.params.problem_id;
    connection.query('SELECT * FROM verified_problems WHERE problem_id = ?', [problem_id], function(err, rows, fields) {
      if (err) throw err
      if (!rows.length) {
        res.redirect('/practice/');
      } else {
        connection.query('SELECT username FROM user WHERE id = ?', [rows[0]['user_id']], function(err, rows1, fields) {
          if (err) throw err
          var problem = {
            author: rows1[0]['username'],
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
      }
    });
});
module.exports = router;
