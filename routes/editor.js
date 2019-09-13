var express = require('express');
var router = express.Router();
var request = require('request');
var connection = require('./db_connection.js');





router.get('/',function(req,res,next){
  res.render('editor.ejs');
});




router.post('/',function(req,res,next){
  console.log(req.body.language)
  var lid;
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
  var options = {
    headers: { "content-type": "application/json" },
    method: 'POST',
    uri: 'https://api.judge0.com/submissions/?base64_encoded=false&wait=false',
    body:body,
    json: true
};
request(options, function(err, result, body) {
  var i;
  console.log(body);
  i = body.token;
  var submission_option = 'https://api.judge0.com/submissions/' + i + '?base64_encoded=true';
  console.log(submission_option);

  function ff() {
    request(submission_option, function(err, results, bod) {
      console.log(results.statusCode);
      var obj = JSON.parse(bod);
      console.log(obj);
      if (obj.status.id > 2) {
        console.log(obj);
        res.json(obj);
        return;
      }
      setTimeout(ff, 100);
    });
  }
  ff();
});
});



router.post('/save',function(req,res,next){
  if(!req.session.username)
    res.end();
  else {
    var curr_datetime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
     curr_datetime = new Date(curr_datetime);
     curr_datetime = curr_datetime.toLocaleString().split(',');
     curr_datetime[0] = curr_datetime[0].split('/').reverse().join('-');
     curr_datetime[1] = curr_datetime[1].slice(1,curr_datetime[1].length);
     curr_datetime = curr_datetime[0] + " " + curr_datetime[1];
    
    const submitsave={
      problem_id:0,
      user_id:req.session.userId,
      date_time:curr_datetime,
      status:"AC",
      solution:req.body.submission,
      time:0.0,
      memory:0.0,
      language:req.body.language

    }
    console.log(submitsave);
    connection.query("SELECT * FROM editor_submission WHERE user_id=? AND problem_id=?",[req.session.userId,submitsave.problem_id],function(err,rows,fields){
      if(err) throw err;
      if(rows[0])
      {
        connection.query("UPDATE editor_submission SET ? WHERE user_id=? AND problem_id=0",[submitsave,req.session.userId]);
      }
      else{
        connection.query("INSERT INTO editor_submission SET ?",[submitsave]);
      }
      res.end();
    });
  }


});

module.exports=router;
