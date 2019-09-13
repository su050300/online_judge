var express = require('express');
var router = express.Router();
var connection = require('./db_connection.js');
var PORT = require('./constant.js');          //importing a file that contains the constant values 
var redirectAdminLogin = require('../middleware/check').redirectAdminLogin;
var nodemailer = require('nodemailer');   //npm module for sending mails using gmail service

//creating nodemailer transporter
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


//get api for getting contest problem verfication admin page according to page number
router.get('/:page_no', redirectAdminLogin, function(req, res, next) {
  res.render('contest_problem_verification.ejs', {message: ''});
});


//post api for getting contest problem verfication admin page according to page number
router.post('/:page_no', redirectAdminLogin, function(req, res, next) {
  var i = 0;
  var page_no = req.params.page_no; 
  connection.query("SELECT problem_id,problem_name,difficulty,subdomain,date FROM contest_new_problems WHERE status = '0'", function(err, rows, fields) {
    if (err) throw err

    if (!rows.length) {
      res.write('No more problems to verify');
    } 
    else {

      //setting info for pagination
      var pages = Math.ceil(rows.length*1.0/20.0);
      var page_info = "";

      for (var i = 1;i <= pages;i++){
        page_info += "<a href = '/admin/problem_verification/" + i + "'>" + i + "</a>"; 
      }

      //setting each page upper bound of problems
      var senddata = "";
      var upper_bound = page_no*20;
      if (page_no*20 > rows.length)
        upper_bound = rows.length;

      for (var i = (page_no-1)*20;i < upper_bound;i++) {    
        rows[i]['date'] = (rows[i]['date'].toISOString()).slice(0,10);  
        senddata += '<tr><td><a href="/admin/contest_problem_verification/' + page_no + '/' + rows[i]['problem_id'] + '">' + rows[i]['problem_name'] + '</a></td><td>' + rows[i]['difficulty']  + '</td><td>' + rows[i]['subdomain'] + '</td><td>' + rows[i]['date'] + '</td></tr>';
        
      }

      var data = {senddata,page_info}
      res.send(data);

    }

  });
});


//get api for opening contest problem that is displayed on the contest problem verification page
router.get('/:page_no/:problem_id', redirectAdminLogin, function(req, res) {
  
  var problem_id = req.params.problem_id;
  //fetching contest problem details
  var sql_query = "SELECT us.username,cnp.problem_id,cnp.problem_name,cnp.difficulty,cnp.subdomain,cnp.time_limit,cnp.memory_limit,cnp.problem_statement,cnp.input,cnp.constraints,cnp.output,cnp.sample_in,cnp.sample_out,cnp.explanation FROM contest_new_problems AS cnp INNER JOIN verified_contest_details AS vcd ON (cnp.problem_id = ? AND vcd.contest_id = cnp.contest_id) INNER JOIN user AS us ON vcd.user_id = us.id";
  
  connection.query(sql_query, [problem_id], function(err, rows, fields) {
    if (err) throw err
    
    if (!rows.length) {
      res.redirect('/admin/contest_problem_verification/' + page_no);
    }
    else {
        var problem = {
          status: 'unverified',
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

        //rendering the problem data
        res.render('problem', problem);
    }
  
});
})


//get api for sending mail to notify the user about the completed verification of his setted contest problem  
router.get('/:page_no/:problem_id/verify/', redirectAdminLogin, function(req, res, next) {
    var problem_id = req.params.problem_id;

  //inserting the contest_new_problems data and status to 1   
    connection.query("UPDATE contest_new_problems SET status = '1' WHERE problem_id = ?", [problem_id], function(err, rows, fields) {
        if (err) throw err
    });

    //fetching the user credentials who setted the contest
    var sql_query = "SELECT us.email,vcd.contest_name,cnp.problem_name,cnp.date FROM contest_new_problems AS cnp INNER JOIN verified_contest_details AS vcd ON (cnp.problem_id = ? AND vcd.contest_id = cnp.contest_id) INNER JOIN user AS us ON vcd.user_id = us.id";
    
    connection.query(sql_query, [problem_id], function(err, rows, fields) {
        if (err) throw err
        
        var date = rows[0]['date'];
        date = date.toUTCString();
        date = date.slice(0,16);
        mailOptions.to = rows[0]['email'];
        mailOptions.text = 'Your problem ' + rows[0]['problem_name'] + ' setted on ' + date + ' for contest ' + rows[0]['contest_name'] + ' has been verified and is added to your contest';
        
        //sending verification completed email via gmail service
        transporter.sendMail(mailOptions, function(error, info) {
            console.log('mailed');
            if (error) {
               console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
      });
      res.redirect('/admin/contest_problem_verification/'+req.params.page_no);
});
        

//get api for sending mail to notify the user about discarding of his setted contest problem due to some reason/issue 
router.get('/:problem_id/discard', redirectAdminLogin, function(req, res, next) {
  var problem_id = req.params.problem_id;

  //fetching the user credentials who setted the contest problem
  var sql_query = "SELECT us.email,vcd.contest_name,cnp.problem_name,cnp.date FROM contest_new_problems AS cnp INNER JOIN verified_contest_details AS vcd ON (cnp.poblem_id = ? AND vcd.contest_id = cnp.contest_id) INNER JOIN user AS us ON vcd.user_id = us.id";
  connection.query(sql_query, [problem_id], function(err, rows, fields) {
    if (err) throw err

    else {

          mailOptions.to = rows[0]['email'];
          mailOptions.text = 'Your problem ' + rows[0]['problem_name'] + ' setted on ' + rows[0]['date'] + ' for contest ' + rows[0]['contest_name'] + ' has been disqualified due to certain reasons';
          
          //sending email about problem discarding
          transporter.sendMail(mailOptions, function(error, info) {
             console.log('mailed');
             if (error) {
               console.log(error);
             } else {
                console.log('Email sent: ' + info.response);
             }
            });
            //deleting the discarded problem entry
            connection.query('DELETE FROM contest_new_problems WHERE problem_id = ?',[problem_id],function(err,rows,fields){
                if (err) throw err
            });
     }
  });
  res.redirect('/admin/contest_problem_verification/'+req.params.page_no);
});

module.exports = router;