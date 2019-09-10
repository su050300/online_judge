var express = require('express');
var router = express.Router();
var connection = require('./db_connection.js');
var redirectLogin = require('../middleware/check').redirectLogin;

function isLater(dateString1, dateString2) {
     return dateString1 > dateString2;
}

router.get('/', redirectLogin, function(req, res, next) {
     var present = "",past = "",future = "";
     var curr_datetime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
      curr_datetime = new Date(curr_datetime);
      curr_datetime = curr_datetime.toLocaleString().split(',');
      curr_datetime[0] = curr_datetime[0].split('/').reverse().join('-');
      curr_datetime[1] = curr_datetime[1].slice(1,curr_datetime[1].length);
      curr_datetime = curr_datetime[0] + " " + curr_datetime[1];
      

      connection.query('SELECT contest_name,org_name,start_date,start_time,end_date,end_time FROM verified_contest_details ORDER BY start_date DESC,start_time DESC',function(err,rows,fields){
           for (var i = 0;i < rows.length;i++){
                var contest_start_datetime,contest_end_datetime;
                contest_start_datetime = (rows[i]['start_date'].toISOString()).slice(0,10) + " " + rows[i]['start_time'];  
                contest_end_datetime = (rows[i]['end_date'].toISOString()).slice(0,10) + " " + rows[i]['end_time'];
                
                if(isLater(curr_datetime,contest_end_datetime)){
                    console.log(past);
                    past += "<tr><td>" + rows[i]['contest_name'] + "</td><td>" + rows[i]['org_name'] + "</td><td>" + rows[i]['start_date'].toISOString().slice(0,10) + "</td><td>" + rows[i]['start_time'] + "</td><td>" + rows[i]['end_date'].toISOString().slice(0,10) + "</td><td>" + rows[i]['end_time'] + "</td></tr>";
                    
               }
                else if(!isLater(curr_datetime,contest_end_datetime) && isLater(curr_datetime,contest_start_datetime)){
                console.log(present);    
                present += "<tr><td>" + rows[i]['contest_name'] + "</td><td>" + rows[i]['org_name'] + "</td><td>" + rows[i]['start_date'].toISOString().slice(0,10) + "</td><td>" + rows[i]['start_time'] + "</td><td>" + rows[i]['end_date'].toISOString().slice(0,10) + "</td><td>" + rows[i]['end_time'] + "</td></tr>";
          }
     }
          connection.query('SELECT contest_name,org_name,start_date,start_time,end_date,end_time FROM verified_contest_details ORDER BY start_date ASC,start_time ASC',function(err,rows,fields){
               for (var i = 0;i < rows.length;i++){
                    var contest_start_datetime,contest_end_datetime;
                    contest_start_datetime = (rows[i]['start_date'].toISOString()).slice(0,10) + " " + rows[i]['start_time'];  
                    contest_end_datetime = (rows[i]['end_date'].toISOString()).slice(0,10) + " " + rows[i]['end_time'];
                    
                    if(isLater(contest_start_datetime,curr_datetime)){
                    console.log(future);    
                    future += "<tr><td>" + rows[i]['contest_name'] + "</td><td>" + rows[i]['org_name'] + "</td><td>" + rows[i]['start_date'].toISOString().slice(0,10) + "</td><td>" + rows[i]['start_time'] + "</td><td>" + rows[i]['end_date'].toISOString().slice(0,10) + "</td><td>" + rows[i]['end_time'] + "</td></tr>";
                    }    
               }
                    res.render('user_contest.ejs',{message1:present,message2:future,message3:past});

       });

 });
});
module.exports = router;
