// app/routes.js

var loggedMiddleware  =  require('../middlewares/rutasprotegidas');


/**  @params  app y passport de server.js */
module.exports = function(app, passport) {

	// =====================================
	// Pagina principal con login (links) 
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs'); 
	});

	// =====================================
	// LOGINformulario
	// =====================================
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP 
	// =====================================
	// mostrar formulario de entrada
	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// seccion de perfil con middleware: isLoggedIn
	// =====================================
	app.get('/profile', loggedMiddleware, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT 
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

