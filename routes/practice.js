var express = require('express');
var router = express.Router();
var redirectLogin = require('../middleware/check').redirectLogin;
var connection = require('./db_connection.js');

//get api for practice problems by user
router.get('/', redirectLogin, function(req, res, next) {
  res.render('practice.ejs');
});


//post api to fetch problems from table according to the different filters choosen by the user
router.post('/',redirectLogin,function(req,res,next){
    var status = req.body.status;
    var difficulty = req.body.difficulty;
    var subdomain = req.body.subdomain;
    
    status = status.split(' ');
    difficulty = difficulty.split(' ');
    subdomain = subdomain.split(' ');
    status = status.slice(0,status.length-1);
    difficulty = difficulty.slice(0,difficulty.length-1);
    subdomain = subdomain.slice(0,subdomain.length-1);
    
    var difficulty_parameters = '',subdomain_parameters = '';
    for (var i = 0;i < difficulty.length;i++)
        difficulty_parameters += "'" + difficulty[i] + "',";

    difficulty_parameters = difficulty_parameters.slice(0,difficulty_parameters.length-1);

    for (var i = 0;i < subdomain.length;i++)
         subdomain_parameters += "'" + subdomain[i] + "',";

    subdomain_parameters = subdomain_parameters.slice(0,subdomain_parameters.length-1);


    //query for fetching problems data on the basis of the user applied filters
    connection.query('SELECT id FROM user WHERE username = ?',[req.session.username],function(err,rows,fields){
      if (err) throw err
      var user_id = rows[0]['id'];
      var sql_query = "SELECT vp.problem_id, vp.problem_name,vp.difficulty,vp.subdomain,sub.status FROM verified_problems AS vp ";
      var table_join = "";
      var submission_query = " submission AS sub ON (sub.problem_id = vp.problem_id AND sub.user_id = ? AND sub.status = 'AC') ";
      var where_query = "";
      var order_by_query = "";
      var order_by_date = "vp.date DESC";
      var difficulty_all_parameters = "'easy','medium','hard'";
      var subdomain_all_parameters = "'search','arrays','strings','sorting','recursion','bitman','greedy','dp','graph','game','algorithm','np'";
      
      if (difficulty.length != 0 && difficulty.length != 3 && subdomain.length != 0 && subdomain.length != 12){
          where_query = "WHERE vp.difficulty IN  (" + difficulty_parameters + ") AND vp.subdomain IN (" + subdomain_parameters + ")" ;
          order_by_query = "ORDER BY FIELD(vp.difficulty," + difficulty_parameters + ") ASC,FIELD(vp.subdomain," + subdomain_parameters + ") ASC,";
      }

      else if (difficulty.length != 0 && difficulty.length != 3){
          where_query = "WHERE vp.difficulty IN  (" + difficulty_parameters + ")";
          order_by_query = "ORDER BY FIELD(vp.difficulty," + difficulty_parameters + ") ASC,FIELD(vp.subdomain," + subdomain_all_parameters + ") ASC,";
      }

      else if (subdomain.length != 0 && subdomain.length != 12){
          where_query = "WHERE vp.subdomain IN  (" + subdomain_parameters + ")";
          order_by_query = "ORDER BY FIELD(vp.difficulty," + difficulty_all_parameters + ") ASC,FIELD(vp.subdomain," + subdomain_parameters + ") ASC,";
      }
      
      else
          order_by_query = "ORDER BY FIELD(vp.difficulty," + difficulty_all_parameters + ") ASC,FIELD(vp.subdomain," + subdomain_all_parameters + ") ASC,";

      if (status.length == 1 && status[0] == '1')
          table_join = " INNER JOIN";
      
      else
          table_join = " LEFT JOIN";

      sql_query = sql_query + table_join + submission_query + where_query + order_by_query + order_by_date;
    
       connection.query(sql_query, [user_id], function(err, rows, fields) {
            if (err) throw err
            if (!rows) {
            res.write('No problems match your search');
            }
            else {
                for (var i = 0; i < rows.length; i++) {
                  if (rows[i]['status'] === 'AC' && status.length == 1 && status[0] == '0')
                    continue;
                  var problem_points = 0,
                    problem_status;
                  if (rows[i]['difficulty'] === 'easy')
                    problem_points = 30;
                  else if (rows[i]['difficulty'] === 'medium')
                    problem_points = 60;
                  else
                    problem_points = 100;
                  if (rows[i]['status'] === null)
                    problem_status = 'Unsolved';
                  else
                    problem_status = 'solved';
                  var senddata = '<tr><td><a href="/practice/' + rows[i]['problem_id'] + '">' + rows[i]['problem_name'] + '</a></td><td>' + rows[i]['difficulty'] + '</td><td>' + problem_points + '</td><td>' + rows[i]['subdomain'] + '</td><td>' + problem_status + '</td></tr>';
                  res.write(senddata);
                }
                res.end();
              }
          });
     });
});

//get api for displaying problem on the basis of users choice
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
            status: 'verified',
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
