var express=require('express');
var router=express.Router();
var redirectLogin = require('../middleware/check').redirectLogin;
var connection = require('./db_connection.js');
var PORT = require('./constant.js');          //importing a file that contains the constant values 
var nodemailer = require('nodemailer');   //npm module for sending mails using gmail service

//creating nodemailer transporter
var transporter = nodemailer.createTransport({
  service: 'gmail',
  port: PORT['PORT'],
  secure: true,
  auth: {
    user: 'blackhat050300@gmail.com',
    pass: 'Mnnit@123456'
  }
});

//setting mail options to send mail using nodemailer
var mailOptions = {
  from: 'blackhat050300@gmail.com',
};


//get api for  user profile page
router.get('/',redirectLogin,function(req,res,next){
    connection.query('SELECT * FROM user WHERE id = ?',[req.session.userId],function(err,rows,fields){
        if (err) throw err
        connection.query('SELECT * FROM followers WHERE following_id = ?',[req.session.userId],function(err,rows1,fields){
            if (err) throw err 
            connection.query('SELECT * FROM followers WHERE follower_id = ?',[req.session.userId],function(err,rows2,fields){
                if (err) throw err 
                connection.query('SELECT * FROM friend WHERE friend2 = ? OR friend1 = ?',[req.session.userId,req.session.userId],function(err,rows3,fields){
                  if (err) throw err 
                res.render('user_profile.ejs',{username:rows[0]['username'],name:rows[0]['name'],points:rows[0]['points'],city:rows[0]['city'],state:rows[0]['state'],college:rows[0]['college'],followers:rows1.length,following:rows2.length,friends:rows3.length});
            });
          });
        });
    });
});


//post api for getting user profile page and informaion of all submissions of the user
router.post('/',redirectLogin,function(req,res,next){
  connection.query("SELECT DISTINCT problem_id,status FROM submission WHERE user_id = ? GROUP BY problem_id,status",[req.session.userId],function(err,rows,fields){
      if (err) throw err
      var ac = 0,wa = 0,tle = 0,re = 0,ce = 0; 
      for (var i = 0;i < rows.length;i++){
        if (rows[i]['status'] == 'AC')
          ac++;
        else if (rows[i]['status'] == 'WA')
          wa++;
        else if (rows[i]['status'] == 'TLE')
          tle++;
        else if (rows[i]['status'] == 'RE')
          re++;
        else
          ce++;
        while(i+1 < rows.length && rows[i]['problem_id'] === rows[i+1]['problem_id'])
          i++;  
      }

      connection.query("SELECT DISTINCT problem_id,status FROM contest_submission WHERE user_id = ? GROUP BY problem_id,status",[req.session.userId],function(err,rows1,fields){
        if (err) throw err

        for (var i = 0;i < rows1.length;i++){
          if (rows1[i]['status'] == 'AC')
            ac++;
          else if (rows1[i]['status'] == 'WA')
            wa++;
          else if (rows1[i]['status'] == 'TLE')
            tle++;
          else if (rows1[i]['status'] == 'RE')
            re++;
          else
            ce++;
          
          while(i+1 < rows1.length && rows1[i]['problem_id'] === rows1[i+1]['problem_id'])
            i++;  
        }
        var data = {ac,wa,tle,re,ce}
        res.send(data);      
      })
  });
});

//get api for followers page
router.get('/followers/:page_no', redirectLogin, function(req, res, next) {
  res.render('followers.ejs', {message: ''});
});


//post api for fetching the followers list
router.post('/followers/:page_no',redirectLogin,function(req,res,next){
  var page_no = req.params.page_no; 
  connection.query("SELECT us.username,us.college,us.id FROM user AS us INNER JOIN followers AS fr ON (fr.following_id = ? AND fr.follower_id = us.id)",[req.session.userId],function(err,rows,fields){
    if(err) throw err

    if (!rows.length) {
      res.send('No current followers');
    } else {
      
      //setting info for pagination
      var pages = Math.ceil(rows.length*1.0/20.0);
      var page_info = "";
      for (var i = 1;i <= pages;i++){
        page_info += "<a href = '/user_profile/follower/" + i + "'>" + i + "</a>"; 
      }

      var senddata = "";
      var upper_bound = page_no*20;
      if (page_no*20 > rows.length)
        upper_bound = rows.length;

      for (var i = (page_no-1)*20;i < upper_bound;i++){
        senddata += '<tr><td><a href="/user_profile/follower/' + page_no + '/' +rows[i]['id'] + '">' + rows[i]['username'] + '</a></td><td>' + rows[i]['college']  + '</td></tr>';
      }

      var data = {senddata,page_info}
      res.send(data);
    }
  });
});

//get api for opening follower displayed on followers page
router.get('/follower/:page_no/:id', redirectLogin, function(req, res) {
  var user_id = req.params.id;
  res.redirect('/user_profile/find_user/'+user_id);
});

//get api for following page
router.get('/following/:page_no', redirectLogin, function(req, res, next) {
  res.render('following.ejs', {message: ''});
});


//post api for following users page
router.post('/following/:page_no',redirectLogin,function(req,res,next){
  var page_no = req.params.page_no; 
  connection.query("SELECT us.username,us.college,us.id FROM user AS us INNER JOIN followers AS fr ON (fr.follower_id = ? AND fr.following_id = us.id)",[req.session.userId],function(err,rows,fields){
    if(err) throw err

    if (!rows.length) {
      res.send('Not following to anyone');
    } else {
      
      //setting info for pagination
      var pages = Math.ceil(rows.length*1.0/20.0);
      var page_info = "";
      for (var i = 1;i <= pages;i++){
        page_info += "<a href = '/user_profile/following/" + i + "'>" + i + "</a>"; 
      }

      var senddata = "";
      var upper_bound = page_no*20;
      if (page_no*20 > rows.length)
        upper_bound = rows.length;

      for (var i = (page_no-1)*20;i < upper_bound;i++){
        senddata += '<tr><td><a href="/user_profile/follower/' + page_no + '/' +rows[i]['id'] + '">' + rows[i]['username'] + '</a></td><td>' + rows[i]['college']  + '</td></tr>';
      }

      var data = {senddata,page_info}
      res.send(data);
    }
  });
});


//get api for opening following users displayed on following page
router.get('/following/:page_no/:id', redirectLogin, function(req, res) {
  var user_id = req.params.id;
  res.redirect('/user_profile/find_user/'+user_id);
});

//get api for friends page
router.get('/friends/:page_no', redirectLogin, function(req, res, next) {
  res.render('friends.ejs', {message: ''});
});

//post api for friends list page
router.post('/friends/:page_no',redirectLogin,function(req,res,next){
  var page_no = req.params.page_no; 
  connection.query("SELECT us.username,us.college,us.id FROM user AS us INNER JOIN friend AS frd ON ((frd.friend1 = ? AND frd.friend2 = us.id) OR (frd.friend2 = ? AND frd.friend1 = us.id))",[req.session.userId,req.session.userId],function(err,rows,fields){
    if(err) throw err

    if (!rows.length) {
      res.send('Not friends yet');
    } else {
      
      //setting info for pagination
      var pages = Math.ceil(rows.length*1.0/20.0);
      var page_info = "";
      for (var i = 1;i <= pages;i++){
        page_info += "<a href = '/user_profile/friends/" + i + "'>" + i + "</a>"; 
      }

      var senddata = "";
      var upper_bound = page_no*20;
      if (page_no*20 > rows.length)
        upper_bound = rows.length;

      for (var i = (page_no-1)*20;i < upper_bound;i++){
        senddata += '<tr><td><a href="/user_profile/friends/' + page_no + '/' +rows[i]['id'] + '">' + rows[i]['username'] + '</a></td><td>' + rows[i]['college']  + '</td></tr>';
      }

      var data = {senddata,page_info}
      res.send(data);
    }
  });
});


//get api for opening friends users displayed on friends page
router.get('/friends/:page_no/:id', redirectLogin, function(req, res) {
  var user_id = req.params.id;
  res.redirect('/user_profile/find_user/'+user_id);
});

//get api for friend requests
router.get('/requests/:page_no', redirectLogin, function(req, res, next) {
  res.render('requests.ejs', {message: ''});
});


//post api for incoming friend requests
router.post('/requests/:page_no',redirectLogin,function(req,res,next){
  var page_no = req.params.page_no; 
  connection.query("SELECT us.username,us.college,us.id FROM user AS us INNER JOIN pending_friend AS pfrd ON (pfrd.friend2 = ? AND pfrd.friend1 = us.id)",[req.session.userId],function(err,rows,fields){
    if(err) throw err

    if (!rows.length) {
      res.send('No more requests to answer');
    } else {
      
      //setting info for pagination
      var pages = Math.ceil(rows.length*1.0/20.0);
      var page_info = "";
      for (var i = 1;i <= pages;i++){
        page_info += "<a href = '/user_profile/requests/" + i + "'>" + i + "</a>"; 
      }

      var senddata = "";
      var upper_bound = page_no*20;
      if (page_no*20 > rows.length)
        upper_bound = rows.length;

      for (var i = (page_no-1)*20;i < upper_bound;i++){
        senddata += '<tr><td><a href="/user_profile/requests/' + page_no + '/' +rows[i]['id'] + '">' + rows[i]['username'] + '</a></td><td>' + rows[i]['college']  + '</td><td><a href="/user_profile/requests/' + page_no + '/' +rows[i]['id'] + '/' + 'accept' +'">Accept</a>    <a href="/user_profile/requests/' + page_no + '/' +rows[i]['id'] + '/' + 'decline' +'">Decline</a></td></tr>';
      }

      var data = {senddata,page_info}
      res.send(data);
    }
  });
});


//get api for opening requests displayed on requests page
router.get('/requests/:page_no/:id', redirectLogin, function(req, res) {
  var user_id = req.params.id;
  res.redirect('/user_profile/find_user/'+user_id);
});


//get api for accept the opening requests displayed on requests page
router.get('/requests/:page_no/:id/accept', redirectLogin, function(req, res) {
  connection.query("INSERT INTO friend SELECT * FROM pending_friend WHERE friend1 = ? AND friend2 = ?",[req.params.id,req.session.userId],function(err,rows,fields){
    if(err) throw err

    connection.query("DELETE FROM pending_friend WHERE friend1 = ? AND friend2 = ?",[req.params.id,req.session.userId],function(err,rows,fields){
      if(err) throw err
      connection.query("SELECT email FROM user WHERE id = ?",[req.params.id],function(err,rows,fields){
        if(err) throw err
      
        mailOptions.subject = 'Friend request accepted notification from codespark',
        mailOptions.to = rows[0]['email'];
        mailOptions.text = req.session.username + 'has accepted your friend request';
        transporter.sendMail(mailOptions, function(error, info) {

            if (error) {
                console.log(error);
            }
            else {
                console.log('mailed');
                console.log('Email sent: ' + info.response);
            }
        });
        res.redirect('/user_profile/requests/'+req.params.page_no);
      });
    });
  });
});


//get api for declining the friend requests displayed on requests page
router.get('/requests/:page_no/:id/decline', redirectLogin, function(req, res) {
    connection.query("DELETE FROM pending_friend WHERE friend1 = ? AND friend2 = ?",[req.params.id,req.session.userId],function(err,rows,fields){
      if(err) throw err
      connection.query("SELECT email FROM user WHERE id = ?",[req.params.id],function(err,rows,fields){
        if(err) throw err
      
        mailOptions.subject = 'Friend request rejected notification from codespark',
        mailOptions.to = rows[0]['email'];
        mailOptions.text = req.session.username + 'has rejected your friend request';
        transporter.sendMail(mailOptions, function(error, info) {

            if (error) {
                console.log(error);
            }
            else {
                console.log('mailed');
                console.log('Email sent: ' + info.response);
            }
        });
        res.redirect('/user_profile/requests/'+req.params.page_no);
      });
    });
});

//post api for providing user facility to search other users
router.post('/search_user',redirectLogin,function(req,res,next){
    connection.query("SELECT username,id FROM user WHERE username LIKE ? AND username NOT IN (?) LIMIT 5",['%'+req.body.search+'%',req.session.username],function(err,rows,fields){
      if(err) throw err

      if(!rows){
        res.send("rows not found");
      }
      else{
        res.send(rows);
      }
    });
});

//getting the user details for whom user is searching
router.get('/find_user/:id',redirectLogin,function(req,res,next){
    connection.query("SELECT * FROM user WHERE id = ?",[req.params.id],function(err,rows,fields){
      if (err) throw err
        connection.query('SELECT * FROM followers WHERE following_id = ?',[req.params.id],function(err,rows1,fields){
            if (err) throw err 
            connection.query('SELECT * FROM followers WHERE follower_id = ?',[req.params.id],function(err,rows2,fields){
                if (err) throw err 
                connection.query('SELECT * FROM friend WHERE friend2 = ? OR friend1 = ?',[req.params.id,req.params.id],function(err,rows3,fields){
                  if (err) throw err 
                  res.render('find_user_profile',{username:rows[0]['username'],name:rows[0]['name'],points:rows[0]['points'],city:rows[0]['city'],state:rows[0]['state'],college:rows[0]['college'],followers:rows1.length,following:rows2.length,friends:rows3.length});
            });
          });
        });
    });
});


//post api for getting users details 
router.post('/find_user/:id',redirectLogin,function(req,res,next){
    var follow = "",friend = "";
    connection.query('SELECT * FROM followers WHERE following_id = ? AND follower_id = ?',[req.params.id,req.session.userId],function(err,rows,fields){
        if (err) throw err 
        if (rows.length)
          follow = "followed";
          connection.query('SELECT * FROM friend WHERE (friend2 = ? AND friend1 = ?) OR (friend2 = ? AND friend1 = ?)',[req.params.id,req.session.userId,req.session.userId,req.params.id],function(err,rows,fields){
            if (err) throw err2
            if (rows.length){
              friend = "friends";
              var data = {follow:follow,friend:friend};
                  res.send(data);
            }
            else{
                connection.query('SELECT * FROM pending_friend WHERE (friend1 = ? AND friend2 = ?)',[req.params.id,req.session.userId,req.session.userId,req.params.id],function(err,rows,fields){
                  if (err) throw err 
                  if (rows.length){
                    friend = "request pending from your side";
                    var data = {follow:follow,friend:friend};
                        res.send(data);
                  }
                  else{
                    connection.query('SELECT * FROM pending_friend WHERE (friend2 = ? AND friend1 = ?)',[req.params.id,req.session.userId,req.session.userId,req.params.id],function(err,rows,fields){
                      if (err) throw err 
                      if (rows.length)
                        friend = "request pending from other side";
                        var data = {follow:follow,friend:friend};
                        res.send(data);
                    });   
                  }  
                });
            }  
        });
    });
});


//post api for getting find users submissions details
router.post('/find_user/:id/info',redirectLogin,function(req,res,next){
  connection.query("SELECT DISTINCT problem_id,status FROM submission WHERE user_id = ? GROUP BY problem_id,status",[req.params.id],function(err,rows,fields){
      if (err) throw err
      var ac = 0,wa = 0,tle = 0,re = 0,ce = 0; 
      for (var i = 0;i < rows.length;i++){
        if (rows[i]['status'] == 'AC')
          ac++;
        else if (rows[i]['status'] == 'WA')
          wa++;
        else if (rows[i]['status'] == 'TLE')
          tle++;
        else if (rows[i]['status'] == 'RE')
          re++;
        else
          ce++;
        while(i+1 < rows.length && rows[i]['problem_id'] === rows[i+1]['problem_id'])
          i++;  
      }

      connection.query("SELECT DISTINCT problem_id,status FROM contest_submission WHERE user_id = ? GROUP BY problem_id,status",[req.params.id],function(err,rows1,fields){
        if (err) throw err

        for (var i = 0;i < rows1.length;i++){
          if (rows1[i]['status'] == 'AC')
            ac++;
          else if (rows1[i]['status'] == 'WA')
            wa++;
          else if (rows1[i]['status'] == 'TLE')
            tle++;
          else if (rows1[i]['status'] == 'RE')
            re++;
          else
            ce++;
          
          while(i+1 < rows1.length && rows1[i]['problem_id'] === rows1[i+1]['problem_id'])
            i++;  
        }
        var data = {ac,wa,tle,re,ce}
        res.send(data);      
      })
  });
});

//checking if user is following the find user or not
router.get('/find_user/:id/follow',redirectLogin,function(req,res,next){
  connection.query('INSERT INTO followers (follower_id,following_id) VALUES (?,?)',[req.session.userId,req.params.id],function(err,rows,fields){
    if (err) throw err 
    connection.query('SELECT email FROM user WHERE id = ?',[req.params.id],function(err,rows,fields){
      if (err) throw err
      mailOptions.subject = 'Follower notification from codespark',
      mailOptions.to = rows[0]['email'];
      mailOptions.text = 'Person with username as ' + req.session.username + ' is now following you on codespark';
      transporter.sendMail(mailOptions, function(error, info) {
          console.log('mailed');
          if (error) {
              console.log(error);
          }
          else {
              console.log('Email sent: ' + info.response);
          }
      });
      res.redirect('/user_profile/find_user/' + req.params.id);
    });  
  });
});

//checking whether the user is friends with other user or not 
router.get('/find_user/:id/friend_request',redirectLogin,function(req,res,next){
  connection.query('INSERT INTO pending_friend(friend1,friend2) VALUES (?,?)',[req.session.userId,req.params.id],function(err,rows,fields){
    if (err) throw err 
    connection.query('SELECT email FROM user WHERE id = ?',[req.params.id],function(err,rows,fields){
      if (err) throw err
      mailOptions.subject = 'Friend Request notification from codespark',
      mailOptions.to = rows[0]['email'];
      mailOptions.text = 'You got a new friend request from ' + req.session.username + ' . Accept request to start a private chat';
      transporter.sendMail(mailOptions, function(error, info) {
          console.log('mailed');
          if (error) {
              console.log(error);
          }
          else {
              console.log('Email sent: ' + info.response);
          }
      });
      res.redirect('/user_profile/find_user/' + req.params.id);
    });  
  });
});


module.exports = router;
