var express=require('express');
var router=express.Router();
var connection = require('./db_connection.js');
var redirectContestLogin = require('../middleware/check').redirectContestLogin;


//get api for the home page of contest after login is successful
router.get('/' ,redirectContestLogin,(function(req,res,next){
    res.render('contesthome.ejs',{message:''});
}));


//post api for the home page of user after login is successful
router.post('/',redirectContestLogin,function(req,res,next)
{
  var contest_id=req.session.contest_id;
  connection.query('SELECT * FROM verified_contest_details WHERE contest_id=?',[contest_id],function(err,rows,fields){
    start_date=rows[0]['start_date'];
    start_date=start_date.toISOString().slice(0,10);
  
    start_time= rows[0]['start_time'];
    start_time=start_time.slice(0,5);
    end_time= rows[0]['end_time'];
    end_time=end_time.slice(0,5);

    end_date=rows[0]['end_date'];
    end_date=end_date.toISOString().slice(0,10);


    //this provides the contest setter a panel through which he can manage the contest
    //add new problems as well as existing problems
    //change end time and end date of the contest as well as change the main contest page as required
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



//post api for saving and updating all the changes made by contest setter in contest main page
router.post('/change',redirectContestLogin,function(req,res,next)
{
  connection.query('UPDATE verified_contest_details SET ? WHERE contest_id=? ',[req.body,req.session.contest_id],function(err,rows,fields){
    if (err) throw err

    res.redirect('/contest/home');
  })
});
module.exports=router;
