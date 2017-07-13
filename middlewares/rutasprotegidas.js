


var loggedMiddleware = function (req, res, next){// metodo llamado next()
	
	// si el usuario está autenticado en la sesión, continúe
	if (req.isAuthenticated())
		return next();

	// si no los redireccionan a la página de inicio	
	res.redirect('/');
};

module.exports = loggedMiddleware;