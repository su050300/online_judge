var express = require('express');
var router = express.Router();
var fileUpload = require('express-fileupload');     //npm module for processsing uploaded files
var fs = require('fs');                             // npm module to handle files and folders
var unzip = require('unzip');                       //npm module to unzip the zipped folder
var connection = require('./db_connection.js');
var redirectLogin = require('../middleware/check').redirectLogin;
const benchmark_points = 1000;    //minimum points required for being a problem setter


router.use(fileUpload());


//get api for checking whether user have minimum number of points required or not
router.get('/',redirectLogin,function(req,res,next){
    if (!req.session.username){
        res.render('login.ejs',{message:'You are not logged in'});
    }
    else {
        connection.query('SELECT points FROM user WHERE username = ?',[req.session.username], function (err, rows, fields) {
            if (err) throw err
            if (rows[0]['points'] < benchmark_points)
                res.render('problem_set.ejs',{message:0});  // 0 for low number of points
            else{
                var username =req.session.username
                res.render('problem_set.ejs',{message:username});
                }
            });
            }
      });


// post api for checking existing problem name and existing problem statement . Also it allows the user to post only 5 problems a day and if limit reached shows an alert  
router.post('/',redirectLogin,function(req,res,next){
    var problem_name = req.body.problem_name;
    problem_name = problem_name.toLowerCase();

    //checking for already existing problem name
    connection.query('SELECT problem_name FROM verified_problems WHERE problem_name = ? UNION SELECT problem_name FROM problems WHERE problem_name = ? UNION SELECT problem_name FROM contest_new_problems WHERE problem_name = ?',[problem_name,problem_name,problem_name], function (err, rows, fields) {
        if (err) throw err
        if(rows.length){
            res.render('problem_set',{message:2});  // 2 for Problem name already exists
        }
        else{

            //checking for already existing problem statement
            connection.query('SELECT problem_statement FROM verified_problems WHERE problem_statement = ? UNION SELECT problem_statement FROM problems WHERE problem_statement = ?  UNION SELECT problem_statement FROM contest_new_problems WHERE problem_statement = ?',[req.body.problem_statement,req.body.problem_statement,req.body.problem_statement], function (err, rows, fields) {
                if (err) throw err
                if(rows.length){
                     res.render('problem_set',{message:3});  // 3 for This problem  already exists
                }
                else{
                    var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
                    indiaTime = new Date(indiaTime);
                    indiaTime = indiaTime.toLocaleString().split(',');
                    indiaTime[0] = indiaTime[0].split('/').reverse().join('-');
                    currdate=indiaTime[0];

                    //checking for the days problem setting limit
                    connection.query('SELECT * FROM verified_problems WHERE date = ? UNION SELECT * FROM problems WHERE date = ?',[currdate,currdate], function (err, rows, fields) {
                        if (err) throw err
                        if(rows.length >= 5){
                            res.render('problem_set',{message:1});   // 1 for days maximum limit reached
                        }
                        else{

                        connection.query('SELECT id FROM user WHERE username = ?',[req.session.username], function (err, rows, fields) {
                            if (err) throw err

                            const problem = {
                                user_id: rows[0]['id'],       
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
                                explanation : req.body.explanation,
                                date : indiaTime[0]
                            }
                            connection.query('INSERT INTO problems SET ?', [problem], function (err, rows,fields) {
                                if (err) throw err
                                else {
                                connection.query('SELECT problem_id FROM problems WHERE problem_name = ?',[problem_name], function(err,rows,fields){
                                    if (err) throw err
                                    if (req.files.image){
                                    var image_name = req.files.image.name.split('.')

                                    image_name = rows[0]['problem_id'] + '.' + image_name[image_name.length-1];

                                    req.files.image.mv('problems/image/' + image_name,function(err){
                                        if (err) throw err
                                        });
                                    }
                                        var dir = 'problems/testcase/' + rows[0]['problem_id'];
                                        
                                        //making the necessary operations on the uploaded folder and image
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
                                    res.render('problem_set',{message:4});  //4 for Your problem is added to the verification list.You will be notified when your problem gets verified

                                    })
                                }
                        })
                    })
                  }

                  })

                }
              })
            }
        })
    })

module.exports = router;
