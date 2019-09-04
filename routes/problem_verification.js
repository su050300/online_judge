var express=require('express');
var router=express.Router();
var connection = require('./db_connection.js');

router.get('/',function(req,res,next){

  res.render('problem_verification.ejs',{message:''});

});
router.post('/',function(req,res,next){
  var i=0;
connection.query('SELECT problem_id,problem_name FROM problems ', function (err, rows, fields) {
    if (err) throw err
    if(!rows.length){
        res.send('no more problems to verify');
     }
     else {
       while(rows[i])
       {
         var senddata='<tr><td>'+rows[i]['problem_id']+'</td><td>'+rows[i]['problem_name']+'</td></tr>';
         res.write(senddata);
         i++;
       }
       res.send();

     }

});
});
module.exports=router;
