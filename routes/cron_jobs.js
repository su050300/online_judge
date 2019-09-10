var cron = require('node-cron');
var connection = require('./db_connection.js');
var nodemailer = require('nodemailer');
var PORT = require('./constant.js');
var fs = require('fs-extra');

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
  subject: 'Contest starting reminder from codespark'
};

cron.schedule('* * * * * *', () => {
    
// var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
// indiaTime = new Date(indiaTime);
// indiaTime.setHours(indiaTime.getHours() + 1);
// indiaTime = indiaTime.toLocaleString().split(',');

// indiaTime[0] = indiaTime[0].split('/').reverse().join('-');
// indiaTime[1] = indiaTime[1].slice(1,indiaTime[1].length);
//  console.log(indiaTime[0]);
//  console.log(indiaTime[1]);
// var sql_query_notification = 'SELECT cs.user_id,vcd.contest_name,us.email FROM contest_signups AS cs INNER JOIN verified_contest_details AS vcd ON (vcd.contest_id = cs.contest_id AND vcd.start_date = ? AND vcd.start_time = ?) INNER JOIN user AS us ON (us.id = cs.user_id)';
// connection.query(sql_query_notification,[indiaTime[0],indiaTime[1]],function(err,rows,fields){
//     if (err) throw err
//     if (rows.length){
//     console.log(rows);
//     for (var i = 0;i < rows.length;i++){
//         mailOptions.to = rows[i]['email'];
//         mailOptions.html = '<p>You have registered for the contest ' + rows[i]['contest_name'] + ' that is going to start at ' + indiaTime[1] + 'on ' + indiaTime[0]  + '. </p>';
//         transporter.sendMail(mailOptions, function(error, info) {
//             console.log(rows[i]['email']);
//             console.log('mailed');
//           if (error) {
//             console.log(error);
//           } else {
//             console.log('Email sent: ' + info.response);
//           }
//         });
//     }
// }
// })
var time = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
time = new Date(time);
console.log(time.toLocaleString());
time.setSeconds(time.getSeconds() + 5);
time = time.toLocaleString().split(',');
time[0] = time[0].split('/').reverse().join('-');
time[1] = time[1].slice(1,time[1].length);
console.log(time[0]);
console.log(time[1])

var arr = [];
var delete_query = "DELETE FROM contest_new_problems WHERE problem_id IN (";
var sql_query_contest_start = 'INSERT INTO problems (user_id,problem_name,difficulty,subdomain,time_limit,memory_limit,problem_statement,input,constraints,output,sample_in,sample_out,explanation,date) SELECT vcd.user_id,cnp.problem_name,cnp.difficulty,cnp.subdomain,cnp.time_limit,cnp.memory_limit,cnp.problem_statement,cnp.input,cnp.constraints,cnp.output,cnp.sample_in,cnp.sample_out,cnp.explanation,cnp.date FROM contest_new_problems AS cnp INNER JOIN verified_contest_details AS vcd ON (vcd.contest_id = cnp.contest_id AND vcd.start_date = ? AND vcd.start_time = ?) ';
connection.query(sql_query_contest_start,[time[0],time[1]],function(err,rows,fields){
    if (err) throw err
    var rows_inserted = rows.affectedRows;
    var start_id = rows.insertId;
    if (rows_inserted > 0){
      sql_query_contest_start = 'SELECT cnp.problem_id,cnp.contest_id,cnp.status FROM contest_new_problems AS cnp INNER JOIN verified_contest_details AS vcd ON (vcd.contest_id = cnp.contest_id AND vcd.start_date = ? AND vcd.start_time = ?) ';
      connection.query(sql_query_contest_start,[time[0],time[1]], function(err, rows, fields) {
        if (err) throw err
        for (var i = 0;i < rows.length;i++){
            delete_query +=  rows[i]['problem_id'] + ",";
            var new_problem_id = start_id+i;
            if (rows[i]['status'] === '1'){
                arr.push([rows[i]['contest_id'],new_problem_id]);
                var prevdir =__dirname+'/../contest_new_problems/testcase/' + rows[i]['problem_id'];
                var nextdir =__dirname+'/../verified_problems/testcase/' + new_problem_id;
              fs.copySync(prevdir, nextdir);
              fs.removeSync(prevdir);
              var ext=['.png', '.jpg', '.jpeg'];
              ext.forEach(function(imgext)
              {
                var previmg =__dirname+'/../contest_new_problems/image/' + rows[i]['problem_id'] + imgext;
                if(fs.existsSync(previmg))
                {
                    var nextimg =__dirname+'/../verified_problems/image/' + new_problem_id + imgext;
                    fs.moveSync(previmg, nextimg);
                }
              });
            }
            else {
              var prevdir =__dirname+'/../contest_new_problems/testcase/' + rows[i]['problem_id'];
              var nextdir =__dirname+'/../problems/testcase/' + new_problem_id;
            fs.copySync(prevdir, nextdir);
            fs.removeSync(prevdir);
            var ext=['.png', '.jpg', '.jpeg'];
            ext.forEach(function(imgext)
            {
              var previmg =__dirname+'/../contest_new_problems/image/' + rows[i]['problem_id'] + imgext;
              if(fs.existsSync(previmg))
              {
                  var nextimg =__dirname+'/../problems/image/' + new_problem_id + imgext;
                  fs.moveSync(previmg, nextimg);
              }
            });
          }
        }
        delete_query = delete_query.slice(0,delete_query.length-1) + ")"; 
        connection.query('INSERT INTO contest_old_problems (contest_id,problem_id) VALUES ?',[arr], function(err, rows, fields) {
          if (err) throw err  
        }); 
        sql_query_contest_start = "INSERT INTO verified_problems SELECT * FROM problems WHERE problem_id IN (";
      var problem_id_query = "";  
      for (var i = 0;i < rows_inserted;i++){
        if (rows[i]['status'] === '1')
          problem_id_query += (start_id+i) + ",";
        }
          problem_id_query = problem_id_query.slice(0,problem_id_query.length-1);
          sql_query_contest_start += problem_id_query + ")";   
        connection.query(sql_query_contest_start, function(err, rows, fields) {
          if (err) throw err
          sql_query_contest_start = "DELETE FROM problems WHERE problem_id IN (" + problem_id_query + ")";
          connection.query(sql_query_contest_start, function(err, rows, fields) {
            if (err) throw err          
          });
        });
        
        connection.query(delete_query, function(err, rows, fields) {
          if (err) throw err  
        }); 
      });    
      }
});
});