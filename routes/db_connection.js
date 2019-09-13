//setting up connection from the mysql using the npm mysql module
var mysql = require('mysql');

//creating connection here ....from the database online_judge
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'online_judge',
    timezone: 'Z'
})

//display connected and ensure proper connection has been setup
connection.connect(function(err) {
    if (err) throw err
    console.log('You are now connected...')
});

module.exports = connection;
