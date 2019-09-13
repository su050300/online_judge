//this file includes functions that checks for user, admin as well as contest login and
// redirects the unauthorized users accordingly

module.exports = {
    //for redirecting to the user login page if user is not logged in
    redirectLogin: function redirectLogin(req, res, next) {
        if (!req.session.username) {
            return res.redirect('/home');
        }
        next();
    },
    // for redirecting to the user home page if user is logged in
    redirectHome: function redirectHome(req, res, next) {
        if (req.session.username) {
            return res.redirect('/home');
        }
        next();
    },
    //for redirecting to the admin login page if admin is not logged in
    redirectAdminLogin: function redirectAdminLogin(req, res, next) {
        if (!req.session.adminname) {
            return res.redirect('/admin/login');
        }
        next();
    },
    //for redirecting to the admin home page if admin is logged in
    redirectAdminHome: function redirectAdminHome(req, res, next) {
        if (req.session.adminname) {
            return res.redirect('/admin/home');
        }
        next();
    },
    //for redirecting to the contest login page if contest setter is not logged in
    redirectContestLogin: function redirectContestLogin(req, res, next) {
        if (!req.session.contest_username){
            return res.redirect('/contest/login');
        }
        next();
    },
    //for redirecting to the contest home page if contest setter is logged in
    redirectContestHome: function redirectContestHome(req, res, next) {
        if (req.session.contest_username) {
            return res.redirect('/contest/home');
        }
        next();
    }
}
