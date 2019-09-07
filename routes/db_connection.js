var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'online_judge'
  })


  connection.connect(function(err) {
    if (err) throw err
    console.log('You are now connected...')
  })

  module.exports = connection;
