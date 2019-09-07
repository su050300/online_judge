var express = require('express');
var router = express.Router();
var redirectAdminLogin = require('../middleware/check').redirectAdminLogin;

router.get('/', redirectAdminLogin, function(req, res, next) {
  res.clearCookie('user');
  req.session = null;

  res.redirect('/admin/login');
});
module.exports = router;
