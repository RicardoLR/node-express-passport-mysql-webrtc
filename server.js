// server.js

// ======================================================================

var express  	= 	require('express');
var http 		=   require('http');
var session  	= 	require('express-session');
var cookieParser = 	require('cookie-parser');
var bodyParser  = 	require('body-parser');
var morgan 	 	= 	require('morgan');
var app      	= 	express();
var port     	= 	process.env.PORT || 8080;

var server = http.createServer(app);
var io  = require('socket.io').listen(server);


var passport 	= 	require('passport');
var flash    	= 	require('connect-flash');

// configuration ===============================================================
// connect to our database

require('./config/passport')(passport); // pasamos passport para configuracion

app.use(morgan('dev')); // debug

app.use(cookieParser()); // read cookies (con auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

// nuestro motor de template
app.set('view engine', 'ejs');


// required for passport
app.use(session({
	secret: 'keysupersecret',
	resave: true,
	saveUninitialized: true
 } )); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistencia sesiones
app.use(flash()); // usamos connect-flash para almacenamiento de sesiones con flash 


/** ==========================================================
	routes 
========================================================== */
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

require('./app/chat-sockets.js')(app, io); // load our routes and pass in our app and fully configured passport


server.listen(port, null, function() {
    console.log("Listening on port " + port);
});
