module.exports = function (app) {
    app.get('/', function (req, res) {

        res.redirect('./home');

    });

    app.use('/home',require('./home'));
    app.use('/register',require('./register'));
    app.use('/login', require('./login'));
    app.use('/logout', require('./logout'));
    app.use('/problem_set', require('./problem_set'));
    app.use('/admin/problem_verification', require('./problem_verification'));
   //404 page
    app.set(function (req, res) {
        if (!res.headersSent) {
            res.status(404).render('404');
        }
    });

};