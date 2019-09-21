var express=require('express'); 
var router=express.Router();     
var redirectContestLogin = require('../middleware/check').redirectContestLogin; 
var connection = require('./db_connection.js');

router.get('/', redirectContestLogin, function(req, res, next){
     res.render('contest_submission');
})


router.post('/', redirectContestLogin, function(req, res, next) {
    var contest_id = req.session.contest_id;
    var data;
    connection.query('SELECT cs.id,cs.language,cs.datetime,cs.status,vp.problem_name,us.username FROM contest_submission AS cs INNER JOIN verified_problems AS vp ON (cs.problem_id=vp.problem_id) INNER JOIN user AS us ON (cs.user_id=us.id) WHERE contest_id=? ORDER BY cs.datetime DESC',[contest_id], function(err, rows, fields) {
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



router.get('/:sid', redirectContestLogin, function(req, res, next) {
    var contest_id = req.params.contest_id;
    var sid=req.params.sid;
    
    connection.query('SELECT cs.solution,cs.language,cs.id,cs.datetime,cs.status,vp.problem_name,us.username FROM contest_submission AS cs INNER JOIN verified_problems AS vp ON (cs.problem_id=vp.problem_id) INNER JOIN user AS us ON (cs.user_id=us.id) WHERE cs.id=?',[sid], function(err, rows, fields) {
         if (err) throw err

         data = rows;
         res.render('solution',rows[0]);
         
    });

});
module.exports = router;