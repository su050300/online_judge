const express=require("express");
const app=express();

//require('./db_connection.js');


var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'online_judge'
  })

  connection.connect(function(err) {
    if (err) throw err
    console.log('You are now connected...')
  })

require('./api_file_list.js')(app,connection);
/*
app.post("/",function(req,res){
  res.send(`<h3>Register</h3>`);
  var submission=req.body.submission;
  var input=req.body.input;
  fs.writeFile(__dirname+"/codes/a.c",submission,function(){
    var resultPromise = c.runFile(__dirname+"/codes/a.c", { stdin:input});
resultPromise
    .then(result => {
      res.set('Content-Type', 'text/plain');
      if (result['stderr'] != "" || result['errorType'] != null){
        console.log(result['stderr']);
        console.log(result['memoryUsage']);
        console.log(result['cpuUsage']);
        //res.write(result['stdout']);
        res.write(result['errorType'] + " error" + "\n");
        res.write(result['stderr']);
        res.end();
      }
      else{
        console.log(result['memoryUsage']);
        console.log(result['cpuUsage']);
        res.send(result['stdout']);
        //res.send(result);
      }

    })
    .catch(err => {
        console.log(err);
    });

  });

});*/
app.listen(3000,function(){

});
