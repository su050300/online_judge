var express=require('express');
var router=express.Router();
var redirectLogin = require('../middleware/check').redirectLogin;
var connection = require('./db_connection.js');

router.get('/',redirectLogin,function(req,res,next){
    console.log('good');
    res.render('practice.ejs');
});

router.post('/',redirectLogin,function(req,res,next){
    // console.log('verygood');
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
    
    connection.query('SELECT id FROM user WHERE username = ?',[req.session.username],function(err,rows,fields){
      if (err) throw err
      var user_id = rows[0]['id'];
      var sql_query = "SELECT vp.problem_name,vp.difficulty,vp.subdomain,sub.status FROM verified_problems AS vp ";
      var table_join = "";
      var submission_query = " submission AS sub ON (sub.problem_id = vp.problem_id AND sub.user_id = ? AND sub.status = 'AC') ";
      var where_query = "";
      var order_by_query = "";
      var order_by_date = "vp.date DESC";
      var difficulty_all_parameters = "'easy','medium','hard'";
      var subdomain_all_parameters = "'search','arrays','strings','sorting','recursion','bitman','greedy','dp','graph','game','algorithm','np'";
      // (sub.problem_id = vp.problem_id AND sub.user_id = ? AND sub.status = 'AC') ORDER BY FIELD(vp.difficulty,'easy','medium','hard') ASC , FIELD(vp.subdomain,'search','arrays','recursion','bitman','greedy','dp','graph','game','algorithm','np') ASC , vp.date DESC";    
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
      console.log(sql_query);
      connection.query(sql_query,[user_id], function(err, rows, fields) {
        if (err) throw err
        if (!rows) {
          res.write('No problems match your search');
        } else {        
          console.log(rows.length);  
           for (var i = 0;i < rows.length;i++) {
            if (rows[i]['status'] === 'AC' && status.length == 1 && status[0] == '0')
              continue;
            var problem_points = 0,problem_status;
            if (rows[0]['difficulty'] === 'easy')
                problem_points = 30;
            else if (rows[0]['difficulty'] === 'medium')
                problem_points = 60;
            else

                problem_points = 100;    
            if (rows[i]['status'] === null)
              problem_status = 'Unsolved';
            else 
              problem_status = 'solved';
              // console.log('mja aa gya');    
            var senddata = '<tr><td><a href="/practice/' + rows[i]['problem_name']+'">'+ rows[i]['problem_name']+ '</a></td><td>' + rows[i]['difficulty']+ '</td><td>' + problem_points + '</td><td>' + rows[i]['subdomain'] + '</td><td>' + problem_status + '</td></tr>';
            res.write(senddata);
          }
          res.end();
        }
      });  
      });
});

module.exports=router;


