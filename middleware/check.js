module.exports = {
    redirectLogin: function redirectLogin(req, res, next) {
        if (!req.session.username) {
            // req.flash('error', 'Not logged in');
            return res.redirect('/home');
        }
        next();
    },

    redirectHome: function redirectHome(req, res, next) {
        if (req.session.username) {
            // req.flash('error', 'Has logged');
            return res.redirect('/home');
        }
        next();
    }
}