var express = require('express');
var router = express.Router();
var request = require('request');
var connection = require('./db_connection.js');
var fs = require('fs-extra');         //npm module for handling files and folders
var async = require('asyncawait/async'); //modules to apply async await on nodejs files.
var await = require('asyncawait/await');





//get api to render ide(editor)
router.get('/',function(req,res,next){
  res.render('editor.ejs',{problem_id:0});
});



//post api to run the editor code
router.post('/',function(req,res,next){
  var lid;
  // select language id according to the judge0 API
  switch(req.body.language)
  {
    case 'c':lid=4;break;
    case 'cpp':lid=10; break;
    case 'java':lid=27;break;
    case 'javascript':lid=29; break;
    case 'csharp':lid=17;break;
    case 'golang':lid=22;break;
    case 'python2':lid=36;break;
    case 'python3':lid=34;break;
    case 'ruby':lid=38;break;
    case 'rust':lid=42;break;
  }
var  body= {
      "source_code": req.body.source_code,
      "language_id": lid,
      "stdin":req.body.stdin
  }
  // set options to the judge0 API request call
  var options = {
    headers: { "content-type": "application/json" },
    method: 'POST',
    uri: 'https://api.judge0.com/submissions/?base64_encoded=false&wait=false',
    body:body,
    json: true
};
//requesting the judge0 API for token
request(options, function(err, result, body) {
  var i;
  i = body.token;
  var submission_option = 'https://api.judge0.com/submissions/' + i + '?base64_encoded=true';

  setTimeout(ff,3000);
// function to check for the status of the API request
  function ff() {
    // API request to fetch the result of the submitted problem
    request(submission_option, function(err, results, bod) {

      var obj = JSON.parse(bod);
      if (obj.status.id > 2) {
        res.json(obj);
        return;
      }
      setTimeout(ff, 100);
    });
  }
});
});


//post api which stores the previous code enter by the user as he left and set in the editor when he come back
router.post('/save',function(req,res,next){
  if(!req.session.username)
    res.end();
  else {

    const submitsave={
      problem_id:req.body.problem_id,
      user_id:req.session.userId,
      solution:req.body.submission,
      language:req.body.language

    }
    // queries to check for previously typed submission and save accordingly
    connection.query("SELECT * FROM editor_submission WHERE user_id=? AND language=? AND problem_id=?",[req.session.userId,submitsave.language,submitsave.problem_id],function(err,rows,fields){
      if(err) throw err;
      if(rows[0])
      {
        connection.query("UPDATE editor_submission SET ? WHERE user_id=? AND language=? AND problem_id=?",[submitsave,req.session.userId,submitsave.language,submitsave.problem_id]);
      }
      else{
        connection.query("INSERT INTO editor_submission SET ?",[submitsave]);
      }
      res.end();
    });
  }


});

//post api to submit the solution to check the sample testcases and return the answer
router.post('/submit',async function(req,res,next){
  var lid;


  problem_id=req.body.problem_id;
  // switch to select language id according to judge0 api
  switch(req.body.language)
  {
    case 'c':lid=4;break;
    case 'cpp':lid=10; break;
    case 'java':lid=27;break;
    case 'javascript':lid=29; break;
    case 'csharp':lid=17;break;
    case 'golang':lid=22;break;
    case 'python2':lid=36;break;
    case 'python3':lid=34;break;
    case 'ruby':lid=38;break;
    case 'rust':lid=42;break;
  }
  var inputdir=__dirname + '/../verified_problems/testcase/' + problem_id+'/input';
  var inputs=fs.readdirSync(inputdir);
  var  optionbody= {
        "source_code": req.body.source_code,
        "language_id": lid,
        "cpu_time_limit":req.body.time_limit,
        "memory_limit":req.body.memory_limit*1000
    };
    var sendresult=[];

//loop to read all the input and the output testcase files
for(element of inputs){
    optionbody.stdin=fs.readFileSync(inputdir+'/'+element).toString();
    var outid=element.slice(5,7);
    var outputfile=__dirname + '/../verified_problems/testcase/' + problem_id+'/output/output'+outid+'.txt';
    optionbody.expected_output=fs.readFileSync(outputfile).toString();

      var options = {
        headers: { "content-type": "application/json" },
        method: 'POST',
        uri: 'https://api.judge0.com/submissions/?base64_encoded=false&wait=false',
        body:optionbody,
        json: true
    };

    //function to send request to judge0 api to run the code
    function dorequest(url){
      return new Promise(function(resolve,reject){
        request(url, function(err, res, bod) {
          var obj=JSON.parse(bod)
          if (!err && res.statusCode == 200 && obj.status.id>2) {
            resolve(obj);
          } 
          else if(err){
            reject(err);
          }
          else{
            setTimeout(function(){
                resolve(dorequest(url));
            },1000);
          }
        })
      })
    }

//function to send request to judge0 api to get token
    function requesta(options){
      return new Promise(function(resolve,reject){
        request(options,function(err, res, body) {
          if (!err && res.statusCode == 201 ) {
            resolve(body);
          } 
          else{
            console.log(body);
 
          }
        })
      })
    }


      body=await requesta(options);
      var submission_option = 'https://api.judge0.com/submissions/' + body.token+ '?base64_encoded=true';
      sendresult.push(await dorequest(submission_option));



  }
var sendans={ans:sendresult};

res.json(JSON.stringify(sendans));
});



//post api to save the submission of the user to the database
router.post('/submit/save',function(req,res,next){
  if(!req.session.username)
    res.end();
  else {

    var curr_datetime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
     curr_datetime = new Date(curr_datetime);
     curr_datetime = curr_datetime.toLocaleString().split(',');
     curr_datetime[0] = curr_datetime[0].split('/').reverse().join('-');
     curr_datetime[1] = curr_datetime[1].slice(1,8);
     curr_datetime = curr_datetime[0] + " " + curr_datetime[1];

    const submitsave={
      problem_id:req.body.problem_id,
      user_id:req.session.userId,
      date_time:curr_datetime,
      status:req.body.status,
      solution:req.body.solution,
      time:req.body.time,
      memory:req.body.memory,
      language:req.body.language

    }
    if(submitsave.status==='AC')
    connection.query("SELECT DISTINCT status FROM submission where problem_id=? and status='AC'",[submitsave.problem_id],function(err,rows,fields){
      if(err) throw err;
      if(!rows[0]){
          connection.query("SELECT difficulty FROM verified_problems where problem_id=?",[submitsave.problem_id],function(err,rows1,fields){
              if(err) throw err;
              var addpoint;
              if(rows1[0].difficulty==='easy')
                addpoint=30;
              else if(rows1[0].difficulty==='medium')
                addpoint=60;
              else 
                addpoint=100;

              connection.query("UPDATE user SET points=points + ? WHERE id = ?",[addpoint,submitsave.user_id],function(err,rows2,fields){
                  if(err) throw err;

              });
          });
      }
 
    });
    
    connection.query("INSERT INTO submission SET ?",[submitsave],function(err,rows,fields){
      if(err) throw err;
      res.end();
    });
    

  }


});



//api to save the submission during contest
router.post('/submit/save/contest',function(req,res,next){
  if(!req.session.username)
    res.end();
  else {

    var curr_datetime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
     curr_datetime = new Date(curr_datetime);
     curr_datetime = curr_datetime.toLocaleString().split(',');
     curr_datetime[0] = curr_datetime[0].split('/').reverse().join('-');
     curr_datetime[1] = curr_datetime[1].slice(1,8);
     curr_datetime = curr_datetime[0] + " " + curr_datetime[1];

     connection.query("SELECT * FROM verified_contest_details WHERE contest_id = ?",[req.body.contest_id],function(err,rows,fields){
      if(err) throw err;

      var contest_end_datetime = (rows[0]['end_date'].toISOString()).slice(0,10) + " " + rows[0]['end_time'];      
      if (curr_datetime > contest_end_datetime){
        const submitsave={
          problem_id:req.body.problem_id,
          user_id:req.session.userId,
          date_time:curr_datetime,
          status:req.body.status,
          solution:req.body.solution,
          time:req.body.time,
          memory:req.body.memory,
          language:req.body.language
    
        }
        connection.query("INSERT INTO submission SET ?",[submitsave],function(err,rows,fields){
          if(err) throw err;
          res.send('timeup');
        });

      }
      else{
        const submitsave={
          problem_id:req.body.problem_id,
          contest_id:req.body.contest_id,
          user_id:req.session.userId,
          datetime:curr_datetime,
          status:req.body.status,
          solution:req.body.solution,
          time:req.body.time,
          memory:req.body.memory,
          language:req.body.language
    
        }
        connection.query("INSERT INTO contest_submission SET ?",[submitsave],function(err,rows,fields){
          if(err) throw err;
          res.send('intime');
        });
      }
      
    });
    
  }

});


//api to get the last entered code to set into editor
router.post('/getcurrent',function(req,res,next){
  if(!req.session.username)
    res.end();
  else {
    connection.query("SELECT solution FROM editor_submission WHERE user_id=? AND language=? AND problem_id=?",[req.session.userId,req.body.language,req.body.problem_id],function(err,rows,fields){
      if(err) throw err;
      if(rows[0])
      {
        
      res.json(rows[0]);
      }
      else{
        res.end();
      }

    });
  }


});


module.exports=router;
