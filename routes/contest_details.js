var express = require('express');
var router = express.Router();
var connection = require('./db_connection.js');
var redirectLogin = require('../middleware/check').redirectLogin;
const min_points_required = 5000;

router.get('/', redirectLogin, function(req, res, next) {
  if (!req.session.username) {
    res.render('login.ejs', {message: 'You are not logged in'});
  }
  else {
    connection.query('SELECT points FROM user WHERE username = ?',[req.session.username], function (err, rows, fields) {
        if (err) throw err
        if (rows[0]['points'] < min_points_required)
            res.render('contest_details.ejs',{message:0});  // 0 for low number of points
        else{
            var username =req.session.username
            res.render('contest_details.ejs',{message:username});
            }
        });
        }
});
router.post('/', redirectLogin, function(req, res, next) {
  if (!req.session.username) {
    res.render('login.ejs', {message: 'You are not logged in'});
  } else {

    var user_id
    connection.query('SELECT id FROM user WHERE username = ?',[req.session.username], function (err, rows, fields) {
      if (err) throw err
      user_id = rows[0]['id'];
    });
    connection.query('SELECT contest_name FROM verified_contest_details WHERE contest_name = ?',[req.body.contest_name], function (err, rows, fields) {
      if (err) throw err
      if(rows.length){
        res.render('contest_details',{message:1}); // 1 for contest name already exists
      }
      else{
        connection.query('SELECT contest_name FROM contest_details WHERE contest_name = ?',[req.body.contest_name], function (err, rows, fields) {
          if (err) throw err
          if(rows.length){
            res.render('contest_details',{message:1}); // 1 for contest name already exists
          }
        else{
          var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
          indiaTime = new Date(indiaTime);
          indiaTime = indiaTime.toLocaleString().split(',');
          indiaTime[0] = indiaTime[0].split('/').reverse().join('-');

          const contest_details = {
          user_id: user_id,
          contest_name : req.body.contest_name,
          start_date : req.body.start_date + '',
          start_time : req.body.start_time + ':00',
          end_date : req.body.end_date + '',
          end_time : req.body.end_time + ':00',
          org_type : req.body.org_type,
          org_name : req.body.org_name,
          date : indiaTime[0]
      }
        connection.query('INSERT INTO contest_details SET ?',[contest_details],function(err,rows,fields){
          if (err) throw err
          res.render('contest_details',{message:2}); //2 for Your contest is added to the verification list.You will be notified when your contest gets verified
        })
      }

    });
  }
});
  }
});


module.exports = router;
