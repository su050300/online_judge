const bodyParser = require("body-parser");
var crypto = require('crypto');
module.exports = function(app, connection) {
  app.get("/", function(req, res) {
    res.send(`<a href = "/register">Register</h3>`);
  });
  require('./register.js')(app, connection, bodyParser,crypto);
  require('./login.js')(app, connection, bodyParser,crypto);
}
