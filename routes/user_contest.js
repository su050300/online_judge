var express = require('express');
var router = express.Router();
var connection = require('./db_connection.js');
var redirectLogin = require('../middleware/check').redirectLogin;
const min_points_required = 5000;        //minimum points required to become a contest setter
var async = require('asyncawait/async'); 
var await = require('asyncawait/await');

//function for comparing two strings and returns true if first string is greater than second otherwise false
function isLater(dateString1, dateString2) {
     return dateString1 > dateString2;
}

  
//get api for fetching data about present past and future contests
router.get('/', redirectLogin, function(req, res, next) {
     
     //calculating current time and date of server computer
     var curr_datetime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
     curr_datetime = new Date(curr_datetime);
     curr_datetime = curr_datetime.toLocaleString().split(',');
     curr_datetime[0] = curr_datetime[0].split('/').reverse().join('-');
     curr_datetime[1] = curr_datetime[1].slice(1,curr_datetime[1].length);
     curr_datetime = curr_datetime[0] + " " + curr_datetime[1];
     
     //query for fetching data about present and past contests and order in descending order of start date and start time
      connection.query('SELECT contest_id,contest_name,org_name,start_date,start_time,end_date,end_time FROM verified_contest_details ORDER BY start_date DESC,start_time DESC',function(err,rows,fields){
          var past = "",present =""; 
          for (var i = 0;i < rows.length;i++){
                var contest_start_datetime,contest_end_datetime;

                contest_start_datetime = (rows[i]['start_date'].toISOString()).slice(0,10) + " " + rows[i]['start_time'];  

                contest_end_datetime = (rows[i]['end_date'].toISOString()).slice(0,10) + " " + rows[i]['end_time'];
                
                //checking for past contests
                if(isLater(curr_datetime,contest_end_datetime)){
                    
                    past += "<tr><td><a href='/compete/"+rows[i]['contest_id'] + "'>" + rows[i]['contest_name'] + "</a></td><td>" + rows[i]['org_name'] + "</td><td>" + rows[i]['start_date'].toISOString().slice(0,10) + "</td><td>" + rows[i]['start_time'] + "</td><td>" + rows[i]['end_date'].toISOString().slice(0,10) + "</td><td>" + rows[i]['end_time'] + "</td></tr>";
                    
               }
               
               //checking for present contests
                else if(!isLater(curr_datetime,contest_end_datetime) && isLater(curr_datetime,contest_start_datetime)){
                 
                present += "<tr><td><a href='/compete/"+rows[i]['contest_id'] + "'>" + rows[i]['contest_name'] + "</a></td><td>" + rows[i]['org_name'] + "</td><td>" + rows[i]['start_date'].toISOString().slice(0,10) + "</td><td>" + rows[i]['start_time'] + "</td><td>" + rows[i]['end_date'].toISOString().slice(0,10) + "</td><td>" + rows[i]['end_time'] + "</td></tr>";
          }
     }

     //query for fetching data about future contests and order in ascending order of start date and start time
          connection.query('SELECT contest_id,contest_name,org_name,start_date,start_time,end_date,end_time FROM verified_contest_details ORDER BY start_date ASC,start_time ASC',function(err,rows,fields){
               if (err) throw err
               var future = "";
               for (var i = 0;i < rows.length;i++){
                    var contest_start_datetime,contest_end_datetime;

                    contest_start_datetime = (rows[i]['start_date'].toISOString()).slice(0,10) + " " + rows[i]['start_time'];

                    contest_end_datetime = (rows[i]['end_date'].toISOString()).slice(0,10) + " " + rows[i]['end_time'];

                    //checking for future contests
                    if(isLater(contest_start_datetime,curr_datetime)){   
                    future += "<tr><td><a href='/compete/"+rows[i]['contest_id'] + "'>" + rows[i]['contest_name'] + "</a></td><td>" + rows[i]['org_name'] + "</td><td>" + rows[i]['start_date'].toISOString().slice(0,10) + "</td><td>" + rows[i]['start_time'] + "</td><td>" + rows[i]['end_date'].toISOString().slice(0,10) + "</td><td>" + rows[i]['end_time'] + "</td></tr>";
                    }    
               }
                    res.render('user_contest.ejs',{message1:present,message2:future,message3:past});

       });

     });
});

//get api for checking for benchmark points and redirecting the user accordingly
router.get('/create_contest', redirectLogin, function(req, res, next) {
     
      connection.query('SELECT points FROM user WHERE username = ?',[req.session.username], function (err, rows, fields) {
           if (err) throw err
           if (rows[0]['points'] < min_points_required)
               res.render('contest_details',{message:0});  // 0 for low number of points
           else{
               var username =req.session.username
               res.render('contest_details',{message:username});
               }
           });
         
   });

//post api for checking for the already existing contest name and otherwise send the users contest details to the admin for verification
router.post('/create_contest', redirectLogin, function(req, res, next) {
     
       var user_id;
       connection.query('SELECT id FROM user WHERE username = ?',[req.session.username], function (err, rows, fields) {
         if (err) throw err
         user_id = rows[0]['id'];
       });

       //checking for existing name
       connection.query('SELECT contest_name FROM verified_contest_details WHERE contest_name = ?',[req.body.contest_name], function (err, rows, fields) {
         if (err) throw err
         if(rows.length){
           res.render('contest_details',{message:1}); // 1 for contest name already exists
         }
         else{

           //checking for existing name
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
           //inserting into table for admin verification
           connection.query('INSERT INTO contest_details SET ?',[contest_details],function(err,rows,fields){
             if (err) throw err
             res.render('contest_details',{message:2}); //2 for Your contest is added to the verification list.You will be notified when your contest gets verified
           })
         }
   
       });
     }
   });
   });
   

//get api for loading contest base main page
router.get('/:contest_id', redirectLogin, function(req, res, next) {
       res.render('contest.ejs');
  });

//post api for handling the main contest page and change the main page accordingly whether the user is registered or not or he is the contest setter or the contest is live or the contest is ended, etc 
router.post('/:contest_id', redirectLogin, function(req, res, next) {
   var contest_id = req.params.contest_id;
   var curr_datetime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
   curr_datetime = new Date(curr_datetime);
   curr_datetime = curr_datetime.toLocaleString().split(',');
   curr_datetime[0] = curr_datetime[0].split('/').reverse().join('-');
   curr_datetime[1] = curr_datetime[1].slice(1,curr_datetime[1].length);
   curr_datetime = curr_datetime[0] + " " + curr_datetime[1];
   
   connection.query('SELECT * FROM verified_contest_details WHERE contest_id = ?',[contest_id],function(err,rows,fields){
          if (err) throw err
          connection.query('SELECT * FROM contest_signups WHERE contest_id = ? AND user_id = ?',[contest_id,req.session.userId],function(err,rows1,fields){
               if (err) throw err
               
               contest_start_datetime = (rows[0]['start_date'].toISOString()).slice(0,10) + " " + rows[0]['start_time'];  

               contest_end_datetime = (rows[0]['end_date'].toISOString()).slice(0,10) + " " + rows[0]['end_time'];
               
               var csd=new Date(contest_start_datetime);
               csd=csd.getTime();
               var ced=new Date(contest_end_datetime);
               ced=ced.getTime();
               let startDate = new Date();
               startDate = startDate.getTime();
               var startdt;
               var enddt;

               if (rows1.length){
                    var register = "";
                    register = "registered";    //check for registered user     
                    startdt=startDate;
                    enddt=csd;   
                    

                    var contest_start_datetime,contest_end_datetime;
                    
                    //check for live contest
                    if(isLater(curr_datetime,contest_start_datetime) && isLater(contest_end_datetime,curr_datetime)){
                         register = "Solve Problems";
                         startdt=startDate;
                         enddt=ced;
                    }

                    //check for contest ended
                    else if(isLater(curr_datetime,contest_end_datetime)){
                         register = "Practice Problems";
                         startdt=startDate;
                         enddt=ced;
                    }
                    // console.log(startdt + " " + enddt);
                    var data = {rows,register,startdt,enddt};
                    res.send(data);
               }
               else{
                    //check whether the user himself the contest setter
                    connection.query('SELECT * FROM verified_contest_details WHERE contest_id = ? AND user_id = ?',[contest_id,req.session.userId],function(err,rows2,fields){
                         if (err) throw err
                         var register = "Not Registered";
                         startdt=startDate;
                         endt=csd;
                         if (rows2.length === 1){
                              register = "Not Allowed";
                              startdt=startDate;
                              enddt=ced;
                         }
                         else{
                              if(isLater(curr_datetime,contest_end_datetime)){
                                   register = "Practice Problems";
                                   startdt=startDate;
                                   enddt=ced;
                              }
                         }
                         
                         
                         var data = {rows,register,startdt,enddt};
                         res.send(data);    
                    });       
                    
               } 
               
          });
   });  

});

//get api for fetching leaderboard data for particular contest id
router.get('/:contest_id/leaderboard', redirectLogin, async function(req, res, next) {
     var contest_id = req.params.contest_id;
     
     //query for choosing the names of the problems in a particular contest
     await connection.query('SELECT vp.problem_name FROM contest_old_problems AS cop INNER JOIN verified_problems AS vp ON (vp.problem_id = cop.problem_id AND contest_id = ?)',[contest_id],async function(err,rows,fields){ 
          if (err) throw err
          
          var senddata = "";
          for (var i = 0;i < rows.length;i++){
               senddata += '<td>' + rows[i]['problem_name'] + '</td>';          
          }
          await res.render('leaderboard',{message:senddata});
        });
});


//post api for fetching leaderboard data for particular contest id
router.post('/:contest_id/leaderboard', redirectLogin,async function(req, res, next) {
     var contest_id = req.params.contest_id;

     //checking if there exists any problem in contest or not
          await connection.query('SELECT vp.problem_name FROM contest_old_problems AS cop INNER JOIN verified_problems AS vp ON (vp.problem_id = cop.problem_id AND contest_id = ?)',[contest_id],async function(err,rows2,fields){ 
          if (err) throw err
          if (rows2.length){
            
          //getting the users list of those users who entered the contest when it is live      
          await connection.query("SELECT us.username,cl.user_id FROM contest_logins AS cl INNER JOIN user AS us ON (cl.user_id = us.id AND cl.contest_id = ?)",[contest_id],async function(err,rows,fields){ 
               if (err) throw err
               var user_list = [];
               if (!rows.length)
                    res.send('No registered users for the contest');
               else{
                    await rows.forEach(async (user)=>{
                         var idid = user['user_id'];
                         
                         //finding the last submission time for a user
                         await connection.query("SELECT MAX(cs.datetime) FROM contest_submission AS cs WHERE cs.user_id = " + idid + " AND cs.contest_id = ? AND cs.status = 'AC'",[contest_id],async function(err,rows3,fields){ 
                              if (err) throw err
                              var temp_user = {};

                              //finding the points or the number of problems solved by a particular user
                         await connection.query("SELECT DISTINCT vp.problem_name,cs.problem_id FROM contest_submission AS cs INNER JOIN verified_problems AS vp ON (cs.problem_id = vp.problem_id) WHERE cs.user_id = ? AND cs.contest_id = ? AND cs.status = 'AC'",[idid,contest_id],async function(err,rows1,fields){ 
                                   if (err) throw err

                              // getting the username from user_id  
                         await connection.query("SELECT username from user WHERE id = ?",[idid],async function(err,rows4,fields){ 
                                   if (err) throw err
                                   temp_user.username = rows4[0]['username'];
                              });
                                   temp_user.points = rows1.length*100;
                                   temp_user.datetime = rows3[0]['MAX(cs.datetime)'];
                                   temp_user.data = "";
                                   for (var j = 0;j < rows2.length;j++){
                                        var flag = 0;
                                        for (var k = 0;k < rows1.length;k++){
                                             if (rows2[j]['problem_name'] === rows1[k]['problem_name']){
                                                  temp_user.data += "<td>100</td>";
                                                  flag = 1;
                                                  break;
                                             }
                                        }
                                        if (flag == 0){
                                             temp_user.data += "<td>0</td>";
                                        }
                                   }
                                   temp_user.data += "";
                                   
                                   //pushing each users data as object in an array
                                   user_list.push(temp_user);
                              });
                    
                         })
               });
          }
          //sorting the array on the basis of compare function first criteria points and second criteria the time of submission
          setTimeout((err)=> {user_list.sort(function(a,b){
                    if (a.points === b.points){
                         if (a.datetime < b.datetime) {return -1;}
                         if (a.datetime > b.datetime) {return 1;}
                    }
                    return b.points-a.points;           
               })
               
          res.send(user_list);
          },200);     
          });
     }
});
});


//get api to register a user into the contest
router.get('/:contest_id/register', redirectLogin, function(req, res, next) {
     var contest_id = req.params.contest_id;
     connection.query('INSERT INTO contest_signups (contest_id,user_id) VALUES (?,?)',[contest_id,req.session.userId],function(err,rows,fields){ 
          if (err) throw err
          res.redirect('/compete/' + contest_id);
        });
});


//get api to let user enter the contest once it is started and let him see the problems of the contest
router.get('/:contest_id/solve_problems', redirectLogin, function(req, res, next) {

     var contest_id = req.params.contest_id;
     connection.query('SELECT * FROM contest_logins WHERE contest_id = ? AND user_id = ?',[contest_id,req.session.userId],function(err,rows,fields){ 
          if (err) throw err
        if (!rows.length){

     //collecting user logins data during contest
     connection.query('INSERT INTO contest_logins (contest_id,user_id) VALUES (?,?)',[contest_id,req.session.userId],function(err,rows,fields){ 
          if (err) throw err
        });
     }
     });
     res.render('solve_problems.ejs', {
          message: ''
        });
});


//get api to let user enter the contest once it is started and let him see the problems of the contest
router.post('/:contest_id/solve_problems', redirectLogin, function(req, res, next) {
     contest_id = req.params.contest_id;

     //fetching problem data from verified_problems table
     connection.query('SELECT vp.problem_id,vp.problem_name,vp.difficulty,vp.subdomain FROM verified_problems AS vp INNER JOIN contest_old_problems AS cop ON (cop.problem_id = vp.problem_id AND cop.contest_id = ?)',[contest_id],function(err,rows,fields){ 
          if (err) throw err
          if (!rows) {
          res.write('No problems match your search');
          } else { 
          for (var i = 0; i < rows.length; i++) {
               var problem_points = 0,problem_status;
               if (rows[i]['difficulty'] === 'easy')
               problem_points = 30;
               else if (rows[i]['difficulty'] === 'medium')
               problem_points = 60;
               else
               problem_points = 100;
              
               var senddata = '<tr><td><a href="/compete/' +contest_id + '/solve_problems/' + rows[i]['problem_id'] + '">' + rows[i]['problem_name'] + '</a></td><td>' + rows[i]['difficulty'] + '</td><td>' + problem_points + '</td><td>' + rows[i]['subdomain'] + '</td></tr>';
               res.write(senddata);
          }
          res.end();   
          }
          });
});


//get api for opening the problem of the contest
router.get('/:contest_id/solve_problems/:problem_id',redirectLogin, function(req,res){
     var problem_id=req.params.problem_id;
     connection.query('SELECT * FROM verified_problems WHERE problem_id = ?', [problem_id], function(err, rows, fields) {
       if (err) throw err
       if (!rows.length) {
         res.redirect('/:contest_id/solve_problems/');
       } else {
         connection.query('SELECT username FROM user WHERE id = ?', [rows[0]['user_id']], function(err, rows1, fields) {
           if (err) throw err
           var problem = {
             check_id : req.params.contest_id,
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


 //get api for practicing the contest problems once the contest has ended
 router.get('/:contest_id/practice_problems', redirectLogin, function(req, res, next) {
     var contest_id = req.params.contest_id;
     res.render('practice_problems.ejs', {message: ''});
});


 //post api for practicing the contest problems once the contest has ended
router.post('/:contest_id/practice_problems', redirectLogin, function(req, res, next) {
     contest_id = req.params.contest_id;
     connection.query('SELECT vp.problem_id,vp.problem_name,vp.difficulty,vp.subdomain FROM verified_problems AS vp INNER JOIN contest_old_problems AS cop ON (cop.problem_id = vp.problem_id AND cop.contest_id = ?)',[contest_id],function(err,rows,fields){ 
          if (err) throw err
          if (!rows) {
          res.write('No problems match your search');
          } else { 
          for (var i = 0; i < rows.length; i++) {
               var problem_points = 0,problem_status;
               if (rows[i]['difficulty'] === 'easy')
               problem_points = 30;
               else if (rows[i]['difficulty'] === 'medium')
               problem_points = 60;
               else
               problem_points = 100;
              
               var senddata = '<tr><td><a href="/compete/' +contest_id + '/practice_problems/' + rows[i]['problem_id'] + '">' + rows[i]['problem_name'] + '</a></td><td>' + rows[i]['difficulty'] + '</td><td>' + problem_points + '</td><td>' + rows[i]['subdomain'] + '</td></tr>';
               res.write(senddata);
          }
          res.end();
          }
          });
});


//get api for opening problems in practice problems
router.get('/:contest_id/practice_problems/:problem_id',redirectLogin, function(req,res){
     var problem_id=req.params.problem_id;
     connection.query('SELECT * FROM verified_problems WHERE problem_id = ?', [problem_id], function(err, rows, fields) {
       if (err) throw err
       if (!rows.length) {
         res.redirect('/:contest_id/practice_problems/');
       } else {
         connection.query('SELECT username FROM user WHERE id = ?', [rows[0]['user_id']], function(err, rows1, fields) {
           if (err) throw err
           var problem = {
             check_id:0,
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


//get api for getting the submissions of a user during a particular contest
 router.get('/:contest_id/submission', redirectLogin, function(req, res, next) {
     var contest_id = req.params.contest_id;
     
  res.render('submission');

});

//post api for fetching details of the submissions of a user during a particular contest
router.post('/:contest_id/submission', redirectLogin, function(req, res, next) {
     var contest_id = req.params.contest_id;
     var user_id=req.session.userId;
     var data;
     connection.query('SELECT cs.id,cs.language,cs.datetime,cs.status,vp.problem_name,us.username FROM contest_submission AS cs INNER JOIN verified_problems AS vp ON (cs.problem_id=vp.problem_id) INNER JOIN user AS us ON (cs.user_id=us.id) WHERE cs.user_id=? AND contest_id=? ORDER BY cs.datetime DESC',[user_id,contest_id], function(err, rows, fields) {
          if (err) throw err
          if (!rows.length) {
            var senddata = '0';
          data = {senddata}
          } 
          else {
               data = rows;
          }
          res.json(data);
     });

});



//get api for opening the submitted solution during a contest
router.get('/:contest_id/submission/:sid', redirectLogin, function(req, res, next) {
     var contest_id = req.params.contest_id;
     var user_id=req.session.userId;
     var sid=req.params.sid;
     
     connection.query('SELECT cs.solution,cs.language,cs.id,cs.datetime,cs.status,vp.problem_name,us.username FROM contest_submission AS cs INNER JOIN verified_problems AS vp ON (cs.problem_id=vp.problem_id) INNER JOIN user AS us ON (cs.user_id=us.id) WHERE cs.user_id=? AND contest_id=? AND cs.id=? ORDER BY cs.datetime DESC',[user_id,contest_id,sid], function(err, rows, fields) {
          if (err) throw err

          data = rows;
          res.render('solution',rows[0]);
          
     });

});


//get api for rendering the same page as the submissions of a contest and will show the submissions for a contest
router.get('/:contest_id/practice_problems/:problem_id/submission', redirectLogin, function(req, res, next) {
     
  res.render('submission');

});

//post api for fetching the details of the submissions of a contest and will show the submissions for a contest
router.post('/:contest_id/practice_problems/:problem_id/submission', redirectLogin, function(req, res, next) {
     var contest_id = req.params.contest_id;
     var user_id=req.session.userId;
     var problem_id=req.params.problem_id;
     var data;
     connection.query('SELECT cs.id,cs.language,cs.datetime,cs.status,vp.problem_name,us.username FROM contest_submission AS cs INNER JOIN verified_problems AS vp ON (cs.problem_id=vp.problem_id) INNER JOIN user AS us ON (cs.user_id=us.id) WHERE cs.user_id=? AND contest_id = ? AND cs.problem_id=? ORDER BY cs.datetime DESC',[user_id,contest_id,problem_id], function(err, rows, fields) {
          if (err) throw err
          if (!rows.length) {
            var senddata = '0';
          data = {senddata}
          } 
          else {
               data = rows;
          }
          res.json(data);
     });


});


//opening the code that is submitted during a contest using particular submission id
router.get('/:contest_id/practice_problems/:problem_id/submission/:sid', redirectLogin, function(req, res, next) {
     var contest_id = req.params.contest_id;
     var user_id=req.session.userId;
     var sid=req.params.sid;
     
     connection.query('SELECT cs.solution,cs.language,cs.id,cs.datetime,cs.status,vp.problem_name,us.username FROM contest_submission AS cs INNER JOIN verified_problems AS vp ON (cs.problem_id=vp.problem_id) INNER JOIN user AS us ON (cs.user_id=us.id) WHERE cs.user_id=? AND contest_id = ? AND cs.id=? ORDER BY cs.datetime DESC',[user_id,contest_id,sid], function(err, rows, fields) {
          if (err) throw err

          data = rows;
          res.render('solution',rows[0]);
          
     });

});


//get api for the submissions of a user for a problem id during a contest 
router.get('/:contest_id/solve_problems/:problem_id/submission', redirectLogin, function(req, res, next) {
     
  res.render('submission');

});


//post api for the submissions of a user for a problem id during a contest 
router.post('/:contest_id/solve_problems/:problem_id/submission', redirectLogin, function(req, res, next) {
     var contest_id = req.params.contest_id;
     var user_id=req.session.userId;
     var problem_id=req.params.problem_id;
     var data;
     connection.query('SELECT cs.id,cs.language,cs.datetime,cs.status,vp.problem_name,us.username FROM contest_submission AS cs INNER JOIN verified_problems AS vp ON (cs.problem_id=vp.problem_id) INNER JOIN user AS us ON (cs.user_id=us.id) WHERE cs.user_id=? AND contest_id=? AND cs.problem_id=? ORDER BY cs.datetime DESC',[user_id,contest_id,problem_id], function(err, rows, fields) {
          if (err) throw err
          if (!rows.length) {
            var senddata = '0';
          data = {senddata}
          } 
          else {
               
               data = rows;
          }
          res.json(data);
     });


});


//get api for opening the submissions of a user for a problem id 
router.get('/:contest_id/solve_problems/:problem_id/submission/:sid', redirectLogin, function(req, res, next) {
     var contest_id = req.params.contest_id;
     var user_id=req.session.userId;
     var sid=req.params.sid;

     connection.query('SELECT cs.solution,cs.language,cs.id,cs.datetime,cs.status,vp.problem_name,us.username FROM contest_submission AS cs INNER JOIN verified_problems AS vp ON (cs.problem_id=vp.problem_id) INNER JOIN user AS us ON (cs.user_id=us.id) WHERE cs.user_id=? AND contest_id=? AND cs.id=? ORDER BY cs.datetime DESC',[user_id,contest_id,sid], function(err, rows, fields) {
          if (err) throw err

          data = rows;
          res.render('solution',rows[0]);
          
     });

});

module.exports = router;
