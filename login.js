//*jshint esversion:6





module.exports = function(app,connection,bodyParser,crypto){
 app.use(bodyParser.urlencoded({
    extended: true
    }));
    console.log("hello world");
    //const checksession = require('./checksession.js');

    app.get('/login', (req,res) => {
         res.sendFile(__dirname + '/login.html');
    });

    app.post('/login', (req,res) => {

      var  pass=saltHashPasswo(req.body.password);
        connection.query('SELECT password FROM user WHERE username = ?',[req.body.username], function (err, rows, fields) {
            if (err) throw err
            if(!rows.length){
                res.send('Username not exists');
             }
             console.log(rows['password']);
             // else
             // {
             //   if(pass===rows[0])
             // }


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
