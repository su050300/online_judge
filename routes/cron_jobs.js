var cron = require('node-cron');
var connection = require('./db_connection.js');
var nodemailer = require('nodemailer');
var PORT = require('./constant.js');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  port: PORT['PORT'],
  secure: true,
  auth: {
    user: 'blackhat050300@gmail.com',
    pass: 'Mnnit@123456'
  }
});

var mailOptions = {
  from: 'blackhat050300@gmail.com',
  subject: 'Contest verification response from codespark'
};

cron.schedule('* * * * * *', () => {
    
var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
indiaTime = new Date(indiaTime);
indiaTime.setHours(indiaTime.getHours() + 1);
indiaTime = indiaTime.toLocaleString().split(',');

indiaTime[0] = indiaTime[0].split('/').reverse().join('-');
indiaTime[1] = indiaTime[1].slice(1,indiaTime[1].length);
console.log(indiaTime[0]);
console.log(indiaTime[1]);
var sql_query = 'SELECT cs.user_id,vcd.contest_name,us.email FROM contest_signups AS cs INNER JOIN verified_contest_details AS vcd ON (vcd.contest_id = cs.contest_id AND vcd.start_date = ? AND vcd.start_time = ?) INNER JOIN user AS us ON (us.id = cs.user_id)';
connection.query(sql_query,[indiaTime[0],indiaTime[1]],function(err,rows,fields){
    if (err) throw err
    if (rows.length){
    console.log(rows);
    for (var i = 0;i < rows.length;i++){
        mailOptions.to = rows[i]['email'];
        mailOptions.html = '<p>You have registered for the contest ' + rows[i]['contest_name'] + ' that is going to start at ' + indiaTime[1] + 'on ' + indiaTime[0]  + '. </p>';
        transporter.sendMail(mailOptions, function(error, info) {
            console.log(rows[i]['email']);
            console.log('mailed');
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
    }
}
})

});