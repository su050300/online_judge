var express=require('express'); 
var router=express.Router();     
var redirectContestLogin = require('../middleware/check').redirectContestLogin; 
var connection = require('./db_connection.js');   

//get api for rendering to the page having details about the logins and signups of the users for a particular contest
router.get('/',redirectContestLogin,function(req,res,next){
    res.render('logins_signups',{message:''});
});

//post api for getching details about the logins and signups of the users for a particular contest
router.post('/',redirectContestLogin,function(req,res,next){

      connection.query('SELECT * FROM contest_signups WHERE contest_id = ?',[req.session.contest_id], function (err, rows, fields) {
          if (err) throw err
          connection.query('SELECT * FROM contest_logins WHERE contest_id = ?',[req.session.contest_id], function (err, rows1, fields) {
            if (err) throw err
             var data = {signups:rows.length,logins:rows1.length};
             
            res.send(data);
      });
    });
    
});


module.exports=router;
