var express=require('express');
var app=express();
var session=require('express-session');
var bodyParser = require('body-parser');
//require('./routes')(app,session);
var path=require('path');
var flash=require('connect-flash');
var cookieParser = require('cookie-parser');
var MemoryStore = require('memorystore')(session);
// var PORT = 3000;
var PORT = require('./routes/constant.js');
//app.use(require('./routes/index.js')(app,session));
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({extended: true  }));
app.use(bodyParser.json());



  var SESS_NAME='user';
  var SESS_SECRET='secret word';
  var SESS_LIFETIME=1000*60*60*2;

  app.use(session({

    name:SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie:{
      maxAge: SESS_LIFETIME,
      sameSite: true
    },
    store: new MemoryStore({
     checkPeriod: SESS_LIFETIME // prune expired entries every 24h
   })
  }));

  app.use(flash());

  // console.log(session.userId);
  require('./routes')(app);
// console.log(PORT['PORT']);
app.listen(PORT['PORT'],function(){

});
