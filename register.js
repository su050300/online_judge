//*jshint esversion:6


module.exports = function(app,connection,bodyParser,crypto){
 app.use(bodyParser.urlencoded({
    extended: true
    }));
    //const checksession = require('./checksession.js');

    app.get('/register', (req,res) => {
         res.sendFile(__dirname + '/register.html');
    });

    app.post('/register', (req,res) => {

      var  pass=saltHashPassword(req.body.password);
      const user = {
         name : req.body.name,
         username : req.body.username,
         email : req.body.email,
         password : pass,
         gender : req.body.gender,
         city : req.body.city,
         state : req.body.state,
         college : req.body.college
      }
      console.log(user.name);
        connection.query('SELECT * FROM user WHERE username = ?',[user.username], function (err, rows, fields) {
            if (err) throw err
             if(rows.length){
                res.write('Username already  exists');
             }
        });

        connection.query('SELECT * FROM user WHERE email = ?', [user.email], function (err, rows, fields) {
         if (err) throw err
        console.log('jhm');
          if(rows.length){
             res.write('Email already exists');
             console.log(user.password);
          }
          res.end();
         })
         var query = connection.query('INSERT INTO user SET ?', [user], function (err, rows,fields) {
            console.log(query.sql);
            if (err) throw err



         })
         function saltHashPassword(password)
          {
            var salt = "aejjdgerjrxzcxzvbfahjaer";
            var hash = crypto.createHmac('sha512', salt);
            hash.update(password);
            var value = hash.digest('hex');
            value=value.slice(0,40);
            return value;

          }





         // const user = [
         //    {
         //    name,username,email,password,gender,city,state,college
         //    }
         // ]
         //        users.push(user)
    //             req.session.userId = user.id
    //             return res.redirect('/home')
    //         }
       //  }
    //     res.redirect('/register')
   });

}
