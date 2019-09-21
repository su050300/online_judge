var express=require('express');
var router=express.Router();
var redirectLogin = require('../middleware/check').redirectLogin;
var connection = require('./db_connection.js');

//get api for chatting with your friend
router.get('/',redirectLogin,function(req,res,next){
  res.render('chat.ejs');

});

//post api for sending the friends list data
router.post('/',redirectLogin,function(req,res,next){
    user_id=req.session.userId;
    connection.query('SELECT id,username FROM user WHERE id IN(SELECT friend1 AS user_id FROM friend WHERE friend2=? UNION SELECT friend2 AS friend FROM friend WHERE friend1=?) ORDER BY username',[user_id,user_id], function (err, rows, fields) {
        if (err) throw err;
       
        res.send(rows);
        });

});

//post api for getting the previous messages of chat with the selected user 
router.post('/message',redirectLogin,function(req,res,next){
  

    user_id=req.session.userId;
    id=req.body.id;
   
    connection.query('SELECT * FROM chat WHERE (sender_id =? AND receiver_id=?) OR (sender_id =? AND receiver_id=?) ',[user_id,id,id,user_id], function (err, rows, fields) {
        if (err) throw err;
       
        res.send(rows);
        });

});

//post api for sending message to our friend
router.post('/sendmessage',redirectLogin,function(req,res,next){
  

    user_id=req.session.userId;
    id=req.body.id;
  
    var data={
      sender_id:req.session.userId,
      receiver_id:req.body.id,
      message:req.body.message
    };
    connection.query('INSERT INTO chat SET ? ',[data], function (err, rows, fields) {
        if (err) throw err;
        res.send();
        });

});
module.exports=router;
