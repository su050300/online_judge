var express = require('express');
var router = express.Router();
var redirectAdminLogin = require('../middleware/check').redirectAdminLogin;

//get api for logout for the admin and destroying the session for the admin 
router.get('/', redirectAdminLogin, function(req, res, next) {
    
  req.session.adminname = null;

  res.redirect('/homepge');
});

module.exports = router;
