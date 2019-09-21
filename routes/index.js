require('./cron_jobs');
module.exports = function (app) {
    //get api using express app and redirecting to basic home page for / request
    app.get('/', function (req, res) {
        if (!req.session.username)
            res.render('homepge',{message:''});
        else
            res.render('homepge',{message:req.session.username});
    });

    app.get('/homepge', function (req, res) {
        if (!req.session.username)
            res.render('homepge',{message:''});
        else
            res.render('homepge',{message:req.session.username});

    });
    
    //get api using express app and redirecting to admin login page for /admin request
    app.get('/admin', function (req, res) {
        res.redirect('./admin/login');

    });

    //get api using express app and redirecting to contest login page for /contest request
    app.get('/contest', function (req, res) {
        res.redirect('./contest/login');

    });

    //requiring different files on the basis of url called
    app.use('/home',require('./home'));
    app.use('/register',require('./register'));
    app.use('/forget_password',require('./forget_password'));
    app.use('/login', require('./login'));
    app.use('/user_profile', require('./user_profile'));
    app.use('/auth/github', require('./auth-routes'));
    app.use('/logout', require('./logout'));
    app.use('/problem_set', require('./problem_set'));
    app.use('/practice', require('./practice'));
    app.use('/admin/problem_verification', require('./problem_verification'));
    app.use('/admin/contest_problem_verification', require('./contest_problem_verification'));
    app.use('/admin/login', require('./adminlogin'));
    app.use('/admin/home', require('./adminhome'));
    app.use('/admin/logout', require('./adminlogout'));
    app.use('/compete', require('./user_contest'));
    app.use('/contest/login', require('./contestlogin'));
    app.use('/contest/submission', require('./contest_submission'));
    app.use('/contest/home', require('./contesthome'));
    app.use('/contest/add_challenge', require('./add_challenge'));
    app.use('/contest/logins_signups', require('./logins_signups'));
    app.use('/contest/logout', require('./contestlogout'));
    app.use('/admin/contest_verification', require('./contest_verification'));
    app.use('/editor', require('./editor'));
    app.use('/chat',require('./chat'));



   //404 page
    app.set(function (req, res) {
        if (!res.headersSent) {
            res.status(404).render('404');
        }
    });

};
