var express = require('express');
var router = express.Router();
var fileUpload = require('express-fileupload');
var fs = require('fs');
var unzip = require('unzip');
var connection = require('./db_connection.js');
//var popupS = require('popups');
const benchmark_points = 50;


router.use(fileUpload());

router.get('/',function(req,res,next){
    if (!req.session.username){
        res.redirect('/login');
    }
    else {
        connection.query('SELECT points FROM user WHERE username = ?',[req.session.username], function (err, rows, fields) {
            if (err) throw err
            if (rows[0]['points'] < benchmark_points)
                res.render('problem_set.ejs',{message:''});
            else{
                res.render('problem_set.ejs',{message:req.session.username});
                }
            });
            }    
      });
    
    

router.post('/',function(req,res,next){
    var problem_name = req.body.problem_name;
    problem_name = problem_name.toLowerCase();
    connection.query('SELECT * FROM problems WHERE problem_name = ?',[problem_name], function (err, rows, fields) {
        if (err) throw err 
        if(rows.length){
            res.render('problem_set',{message:'Problem name already exists'});
        }else{
        connection.query('SELECT * FROM verified_problems WHERE problem_name = ?',[problem_name], function (err, rows, fields) {
            if (err) throw err
            if(rows.length){
                res.render('problem_set',{message:'Problem name already exists'});
            }
            else{
            connection.query('SELECT * FROM problems WHERE problem_statement = ?',[req.body.problem_statement], function (err, rows, fields) {
                if (err) throw err
                if(rows.length){
                    res.render('problem_set',{message:'This problem  already exists'});
                }
                else{
                connection.query('SELECT * FROM verified_problems WHERE problem_statement = ?',[req.body.problem_statement], function (err, rows, fields) {
                    if (err) throw err
                    if(rows.length){
                        res.render('problem_set',{message:'This problem  already exists'});
                    }
                    else{
                    const problem = {
                        user_id: 1,        // change user id here according to the session
                        problem_name : problem_name,
                        difficulty : req.body.difficulty,
                        subdomain : req.body.subdomain,
                        time_limit : req.body.time_limit,
                        memory_limit : req.body.memory_limit,
                        problem_statement : req.body.problem_statement,
                        input : req.body.input,
                        constraints : req.body.constraints,
                        output : req.body.output,
                        sample_in : req.body.sample_in,
                        sample_out : req.body.sample_out,
                        explanation : req.body.explanation
                     }
                     connection.query('INSERT INTO problems SET ?', [problem], function (err, rows,fields) {
                        if (err) throw err
                        else{
                        connection.query('SELECT problem_id FROM problems WHERE problem_name = ?',[problem_name], function(err,rows,fields){
                            if (err) throw err
                            var image_name = req.files.image.name.split('.')
                            
                            image_name = rows[0]['problem_id'] + '.' + image_name[image_name.length-1];
                            
                            req.files.image.mv('problems/image/' + image_name,function(err){
                                if (err) throw err
                                });
                                var dir = 'problems/testcase/' + rows[0]['problem_id'];
                                req.files.testcase.mv(dir + '.zip',function(err){
                                    if (err) throw err
                                    
                                    if (!fs.existsSync(dir)){
                                        fs.mkdirSync(dir);
                                    }      
                                var inputFileName = dir + '.zip';  
                                var extractToDirectory = dir;
                                    fs.createReadStream(inputFileName).pipe(unzip.Extract({
		                                path: extractToDirectory 
                                    }));
                                   
                                    
                                    fs.unlinkSync(dir + '.zip',(err)=>{
                                        if (err) throw err;
                                    });  
                                });
                            res.render('problem_set',{message:'Your problem is added to the verification list.You will be notified when your problem gets verified.'});
                            
                            });
                        }
                        });
                    }
                  });
                }
              });
            }
          });
        }
        });  


});

module.exports = router;