module.exports = function(app, connection, bodyParser){
  app.get('/home',(req,res) => {
      res.send("horray");
  })
}
