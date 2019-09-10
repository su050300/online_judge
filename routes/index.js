// require('./cron_jobs');
module.exports = function (app) {
    app.get('/', function (req, res) {
        res.redirect('./home');

    });
    app.get('/admin', function (req, res) {
        res.redirect('./admin/login');

    });
    app.get('/contest', function (req, res) {
        res.redirect('./contest/login');

    });

    app.use('/home',require('./home'));
    app.use('/register',require('./register'));
    app.use('/login', require('./login'));
    app.use('/logout', require('./logout'));
    app.use('/problem_set', require('./problem_set'));
    app.use('/practice', require('./practice'));
    app.use('/admin/problem_verification', require('./problem_verification'));
    app.use('/admin/login', require('./adminlogin'));
    app.use('/admin/home', require('./adminhome'));
    app.use('/admin/logout', require('./adminlogout'));
    app.use('/contest/create_details', require('./contest_details'));
    app.use('/contest/login', require('./contestlogin'));
    app.use('/contest/home', require('./contesthome'));
    app.use('/contest/add_challenge', require('./add_challenge'));
    app.use('/contest/logout', require('./contestlogout'));
    app.use('/admin/contest_verification', require('./contest_verification'));

   //404 page
    app.set(function (req, res) {
        if (!res.headersSent) {
            res.status(404).render('404');
        }
    });

};
