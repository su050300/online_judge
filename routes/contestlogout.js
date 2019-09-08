var express = require('express');
var router = express.Router();
var redirectContestLogin = require('../middleware/check').redirectContestLogin;

router.get('/', redirectContestLogin, function(req, res, next) {
  res.clearCookie('user');
  req.session.contest_username = null;

  res.redirect('/contest/login');
});
module.exports = router;
