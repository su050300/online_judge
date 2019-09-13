var express=require('express'); 
var router=express.Router();     
var redirectContestLogin = require('../middleware/check').redirectContestLogin; 
var connection = require('./db_connection.js');   
var fileUpload = require('express-fileupload');     //npm module for processsing uploaded files
var fs = require('fs');                             // npm module to handle files and folders
var unzip = require('unzip');                       //npm module to unzip the zipped folder
router.use(fileUpload());


//get api for adding a challenge either existing or a new challenge into the contest by the contest setter
router.get('/' ,redirectContestLogin,(function(req,res,next){
    res.render('add_challenge.ejs',{message:''});
}));


//post api for adding a challenge either existing or a new challenge into the contest by the contest setter
router.post('/',redirectContestLogin,function(req,res,next){
    console.log(req.body.search);
    connection.query("SELECT problem_name,problem_id FROM verified_problems WHERE problem_name LIKE ? AND problem_id NOT IN(SELECT problem_id FROM contest_old_problems) LIMIT 6",['%'+req.body.search+'%'],function(err,rows,fields){
      if(err) throw err

      if(!rows){
        res.send("rows not found");
      }
      else{
        res.send(rows);
      }
    });
});


//post api for adding an existing challenge into the contest by the contest setter
router.post('/select_existing_challenge',redirectContestLogin,function(req,res,next){
    connection.query("INSERT INTO contest_old_problems SET contest_id = ?, problem_id=? ",[req.session.contest_id,req.body.problem_id],function(err,rows,fields){
      if(err)throw err
    });
    res.end('end');
});


//get api for adding a new challenge into the contest by the contest setter
router.get('/new_challenge',redirectContestLogin,function(req,res,send){
  res.render('contest_problem_set',{message:""});
});


//post api for adding a new challenge into the contest by the contest setter
router.post('/new_challenge',redirectContestLogin,function(req,res,next){
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

                    //getting current time from server computer
                    var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
                    indiaTime = new Date(indiaTime);
                    indiaTime = indiaTime.toLocaleString().split(',');
                    indiaTime[0] = indiaTime[0].split('/').reverse().join('-');
                    
                    const problem = {
                        contest_id:req.session.contest_id,   
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
                        date : indiaTime[0],
                        status:'0'
                    }
                    
                    //inserting new problem into the contest_new_problems table with status 0
                    connection.query('INSERT INTO contest_new_problems SET ?', [problem], function (err, rows,fields) {
                        if (err) throw err

                        else {
                            connection.query('SELECT problem_id FROM contest_new_problems WHERE problem_name = ?',[problem_name], function(err,rows,fields){
                                if (err) throw err
                                
                                //handling and moving image to image folder in contest_new_problems
                                if (req.files.image){
                                    var image_name = req.files.image.name.split('.')
                                    image_name = rows[0]['problem_id'] + '.' + image_name[image_name.length-1];

                                    req.files.image.mv('contest_new_problems/image/' + image_name,function(err){
                                        if (err) throw err
                                
                                    });
                                }
                            
                                var dir = 'contest_new_problems/testcase/' + rows[0]['problem_id'];
                                req.files.testcase.mv(dir + '.zip',function(err){
                                    if (err) throw err

                                    if (!fs.existsSync(dir)){
                                        fs.mkdirSync(dir);
                                    }
                                    //unziping the zipped folder and moving it to contest_new_problems folder
                                    var inputFileName = dir + '.zip';
                                    var extractToDirectory = dir;
                                    fs.createReadStream(inputFileName).pipe(unzip.Extract({
                                        path: extractToDirectory
                                    }));

                                    //deleting the zip file
                                    fs.unlinkSync(dir + '.zip',(err)=>{
                                        if (err) throw err;
                                    });
                                });
                                res.render('contest_problem_set',{message:4});  //4 for Your problem is added to the verification list.You will be notified when your problem gets verified
                            });
                        }
                    });
                }
            });
        }
    });
});


//post api for fetching details about the problems already setted by the contest setter
router.post('/get_challenge',redirectContestLogin,function(req,res,next){
    connection.query("SELECT problem_name,subdomain,difficulty FROM verified_problems WHERE problem_id IN (SELECT problem_id FROM contest_old_problems WHERE contest_id=?) UNION SELECT problem_name,subdomain,difficulty FROM contest_new_problems WHERE contest_id=? AND status='1' ",[req.session.contest_id,req.session.contest_id],function(err,rows1,fields){
        if(err)throw err
        
        connection.query("SELECT problem_name,subdomain,difficulty FROM contest_new_problems WHERE contest_id=? AND status='0'",[req.session.contest_id],function(err,rows2,fields){
            if(err)throw err
            var rows={rows1,rows2};
            res.send(rows);
        });
    });
});
    
module.exports=router;
