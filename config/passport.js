// config/passport.js

var LocalStrategy   = require('passport-local').Strategy;

// Modelos
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

var UserModel = require('../models/user');


connection.query('USE ' + dbconfig.database);

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup 
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // sign up
    // =========================================================================
    passport.use(
        'local-signup',
        
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },

        function(req, username, password, done) {

             // encuentra un usuario cuyo correo electrónico es el mismo que el correo electrónico de formularios
             // estamos revisando para ver si ya existe el usuario que intenta ingresar
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {

                    //  sino existe lo creamos
                    var newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                    };


                    var insertQuery = "INSERT INTO users ( username, password ) values (?,?)";

                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.password],function(err, rows) {
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    // =========================================================================
    // LOGIN  acceder
    // =========================================================================
    // estamos utilizando estrategias nombradas ya que tenemos una para el inicio de sesión y otra para la suscripción
    // por defecto, si no había nombre, simplemente se llamaría 'local'
    passport.use(
        'local-login',

        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },

        function(req, username, password, done) { 

            connection.query("SELECT * FROM users WHERE username = ?", [username], function(err, filaUsuario){
                if (err)
                    return done(err);
                if (!filaUsuario.length) {
                    return done(null, false, req.flash('loginMessage', 'No se encuenra usuario')); 
                }

                if (!bcrypt.compareSync(password, filaUsuario[0].password))
                    return done(null, false, req.flash('loginMessage', 'Error en contraseña, verificar')); 


                return done(null, filaUsuario[0]);
            });
        })
    );
};
