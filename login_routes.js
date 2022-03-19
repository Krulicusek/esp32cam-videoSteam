var express = require('express');
var app = express();
var passport = require("passport");
const path = require('path');
var fs = require('fs');
var request = require('request');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const user = {email: "a",
id: 1}
app.get('/login', function (req, res, next) {
	if (req.isAuthenticated()) {
		res.redirect('/client');
	}
	else {
		const pathToHtml = path.resolve("./login.html");
		res.sendFile(pathToHtml);
	}
});

app.get('/logout', function (req, res) {
	console.log(req.isAuthenticated());
	req.logout();
	console.log(req.isAuthenticated());
	req.flash('success', "Logged out. See you soon!");
	res.redirect('/');
});


app.post('/login', passport.authenticate('local', {
	successRedirect: '/client',
	failureRedirect: '/login',
	failureFlash: true
}), function (req, res) {
	if (req.body.remember) {
		req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
	} else {
		req.session.cookie.expires = false; // Cookie expires at end of session
	}
	res.redirect('/');
});
var pwd = bcrypt.hash("Metalika554", 10);

passport.use('local', new LocalStrategy({
	usernameField: 'username',
	passwordField: 'password',
	passReqToCallback: true
}, (req, username, password, done) => {
	loginAttempt();
	async function loginAttempt() {
		bcrypt.compare(password, pwd, function (err, check) {
			if (err) {
				console.log('Error while checking password');
				return done();
			}
			else if (check) {
				console.log("password correct");
				return done(null, user.rows[0]);
				
			}
			else {
				req.flash('danger', "Oops. Incorrect login details.");
				console.log("incorrect password");
				return done(null, false);
			}
		});
	}
}));



passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (id, done) {
	(err, user) => {
		done(err, user);
	}
});
module.exports = app;