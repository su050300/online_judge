var express=require('express');
var app=express();
var session=require('express-session');
var bodyParser = require('body-parser');
var path=require('path');
var cookieParser = require('cookie-parser');
var MemoryStore = require('memorystore')(session);
var FIXED = require('./routes/constant.js');
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({extended: true  }));
app.use(bodyParser.json());


  app.use(session({

    name:FIXED['SESS_NAME'],
    resave: false,
    saveUninitialized: false,
    secret: FIXED['SESS_SECRET'],
    cookie:{
      maxAge: FIXED['SESS_LIFETIME'],
      sameSite: true
    },
    store: new MemoryStore({
     checkPeriod: FIXED['SESS_LIFETIME'] 
   })
  }));
  require('./routes')(app);
app.listen(FIXED['PORT'],function(){

});
