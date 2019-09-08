var cron = require('node-cron');
var crypto=require('crypto');


function hello () {
  console.log("This will run recursively");
  var password=crypto.randomBytes(5).toString('hex');
  console.log(password);
  password=password.slice(0,10);
  console.log(password);
  


}
console.log("It will Print the data recursively after a delay of 2000ms again and again")
setInterval(hello,2000);
