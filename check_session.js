
  module.exports={
  redirectLogin:function (req,res,next)
  {if(!req.session)
      res.redirect(__dirname+'/login');
    else next();
  },
  createSession:function(app)
  {  const session = require('express-session');
    const cookieparser=require("cookie-parser");
    app.use(cookieparser());

    var SESS_NAME='user'
    var SESS_SECRET='secret word';
    var SESS_LIFETIME=1000*60*60*2;
    console.log("top");
    var ssn;

    app.use(session({

      name:SESS_NAME,
      resave: false,
      saveUninitialized: false,
      secret: SESS_SECRET,
      cookie:{

        maxAge: SESS_LIFETIME,
        sameSite: true
      }}));
    app.get("/",function(req,res){
      ssn=req.session;
      // ssn.name=SESS_NAME;
      req.session.userId=0;
      // if(ssn.name)
      console.log(ssn.userId);
      // if(ssn.name)

    });
  // ,
  // redirectHome:function (req,res,next)
  // {if(req.session)
  //     res.redirect(__dirname+'/home');
  //   else next();
  // }
}
