var express = require('express');
var router = express.Router();
var connection = require('./db_connection.js');
var redirectLogin = require('../middleware/check').redirectLogin;

router.get('/', redirectLogin, function(req, res, next) {
  if (!req.session.username) {
    res.render('login.ejs', {message: 'You are not logged in'});
  } else {
    res.render('contest_details.ejs',{message:''});
  }
});
router.post('/', redirectLogin, function(req, res, next) {
  if (!req.session.username) {
    res.render('login.ejs', {
      message: 'You are not logged in'
    });
  } else {
    connection.query('SELECT * FROM verified_contest_details WHERE contest_name = ? UNION SELECT * FROM contest_details WHERE contest_name = ?',[req.body.contest_name], function (err, rows, fields) {
      if (err) throw err
      if(rows.length){
        res.render('contest_details',{message:'Contest name already exists.!!'});
      }
    });
  }
});
module.exports = router;
