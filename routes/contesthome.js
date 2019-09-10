var express=require('express');
var router=express.Router();
var connection = require('./db_connection.js');
var redirectContestLogin = require('../middleware/check').redirectContestLogin;



router.get('/' ,redirectContestLogin,(function(req,res,next){
    res.render('contesthome.ejs',{message:''});
}));

router.post('/',redirectContestLogin,function(req,res,next)
{
  var contest_id=req.session.contest_id;
  connection.query('SELECT * FROM verified_contest_details WHERE contest_id=?',[contest_id],function(err,rows,fields){
    start_date=rows[0]['start_date'];
    start_date=start_date.toISOString().slice(0,10);
    // start_date = start_date.split("-").reverse().join("-");
    start_time= rows[0]['start_time'];
    start_time=start_time.slice(0,5);
    end_time= rows[0]['end_time'];
    end_time=end_time.slice(0,5);
    end_date=rows[0]['end_date'];
    end_date=end_date.toISOString().slice(0,10);
    // end_date = end_date.split("-").reverse().join("-");
    var contest_info = {
      contest_id:rows[0]['contest_id'],
      contest_name: rows[0]['contest_name'],
      contest_link:'localhost:3000/compete/'+ rows[0]['contest_id'],
      start_date:start_date,
      start_time:start_time,
      end_date: end_date,
      end_time:end_time,
      org_type: rows[0]['org_type'],
      org_name: rows[0]['org_name'],
      description: rows[0]['description'],
      prizes: rows[0]['prizes'],
      rules: rows[0]['rules'],
      scoring: rows[0]['scoring']


    }
    res.json(contest_info);
    res.end();

  });
});




router.post('/change',redirectContestLogin,function(req,res,next)
{
  connection.query('UPDATE verified_contest_details SET ? WHERE contest_id=? ',[req.body,req.session.contest_id],function(err,rows,fields){
    if (err) throw err
    console.log(rows[0]);
    res.redirect('/contest/home');
     //2 for Your contest is added to the verification list.You will be notified when your contest gets verified
  })
});
module.exports=router;
