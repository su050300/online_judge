var express = require('express');
var router = express.Router();
var connection = require('./db_connection.js');

router.get('/', function(req, res, next) {

  res.render('problem_verification.ejs', {
    message: ''
  });

});
router.post('/', function(req, res, next) {
  var i = 0;
  connection.query('SELECT problem_id,problem_name FROM problems ', function(err, rows, fields) {
    if (err) throw err
    if (!rows.length) {
      res.send('no more problems to verify');
    } else {
      while (rows[i]) {
        var senddata = '<tr><td>' + rows[i]['problem_id'] + '</td><td><a href="/admin/problem_verification/'+rows[i]['problem_name']+'">' + rows[i]['problem_name'] + '</a></td></tr>';
        res.write(senddata);
        i++;
      }
      res.send();

    }

  });
});
// router.get('/:problem_name', function(req, res) {
//   var problem_name = req.params.problem_name;
//   connection.query('SELECT * FROM problems WHERE problem_name = ?', [problem_name], function(err, rows, fields) {
//     if (err) throw err
//     if (!rows.length) {
//       res.redirect('/admin/problem_verification/');
//     } else {
//       connection.query('SELECT username FROM user WHERE id = ?', [rows[0]['user_id']], function(err, rows1, fields) {
//         if (err) throw err
//         var problem = {
//           author: rows1[0]['username'],
//           problem_name: rows[0]['problem_name'],
//           difficulty: rows[0]['difficulty'],
//           subdomain: rows[0]['subdomain'],
//           time_limit: rows[0]['time_limit'],
//           memory_limit: rows[0]['memory_limit'],
//           problem_statement: rows[0]['problem_statement'],
//           input: rows[0]['input'],
//           constraints: rows[0]['constraints'],
//           output: rows[0]['output'],
//           sample_in: rows[0]['sample_in'],
//           sample_out: rows[0]['sample_out'],
//           explanation: rows[0]['explanation']
//         }
//         res.render('problem.ejs',problem);
//       });
//     }
//   });
// });

router.post('/verify/:problem_name', function(req, res, next) {
  var problem_name = req.params.problem_name;
  connection.query('INSERT INTO verified_problems SELECT * FROM problems WHERE problem_name=?',[problem_name], function(err, rows, fields) {
    if (err) throw err    });
  connection.query('DELETE FROM problems WHERE problem_name=?',[problem_name], function(err, rows, fields) {
      if (err) throw err
    res.redirect('/admin/problem_verification/');
    });
  });

  router.post('/discard/:problem_name', function(req, res, next) {
    var problem_name = req.params.problem_name;
    connection.query('DELETE FROM problems WHERE problem_name=?',[problem_name], function(err, rows, fields) {
        if (err) throw err
    res.redirect('/admin/problem_verification/');
      });
    });




module.exports = router;
