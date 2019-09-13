var express = require('express');
var router = express.Router();
var redirectContestLogin = require('../middleware/check').redirectContestLogin;


//get api for logout for the contest and destroying the session for the contest 
router.get('/', redirectContestLogin, function(req, res, next) {
  req.session.contest_username = null;

  res.redirect('/contest/login');
});
module.exports = router;
