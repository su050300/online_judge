var express=require('express');                               //npm module to create express server
var app=express();
var session=require('express-session');                       //npm module to create session
var bodyParser = require('body-parser');                      //npm module to read files from HTML data
var path=require('path');                                     //npm module for paths
var cookieParser = require('cookie-parser');                  //npm module to use and change cookies
var MemoryStore = require('memorystore')(session);             //npm module to stoe session variables
var FIXED = require('./routes/constant.js');                   //file containing constants
app.set('views',path.join(__dirname,'views'));                  //setting views directory(containing all the ejs files) as default view engine directory
app.set('view engine','ejs');
app.use(cookieParser());                                        //using cookie-parser
app.use(express.static(path.join(__dirname,'public')));          //setting public directory as static
app.use(bodyParser.urlencoded({extended: true  }));             //setting body parser to get HTML form data
app.use(bodyParser.json());                                   //setting body parser to get json data


  app.use(session({                                           //setting session parameters

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
  require('./routes')(app);                                   //requiring routes to all the API's in the routes directory
app.listen(FIXED['PORT'],function(){                          //setting up the server on port PORT

});
