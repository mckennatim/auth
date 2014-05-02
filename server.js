'use strict';
var express = require('express');
var _ = require('underscore');
var flash = require('connect-flash')
  , passport = require('passport')
  , util = require('util')
  , LocalStrategy = require('passport-localapikey').Strategy;

var users = [
    {id:1, user: 'tim', apikey: '1234567', email: 'mckenna.tim@gmail.com' }
  , {id:2, user: 'joe', apikey: 'birthday', email: 'joe@example.com' }
];  
console.log(users[0].user);

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}
function findByUsername(user, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.user === user) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}
function findByApiKey(apikey, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.apikey === apikey) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(apikey, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      findByApiKey(apikey, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown api ' + apikey }); }
        if (user.apikey!=apikey) { return done(null, false, { message: 'apikey' }); }
        return done(null, user);
      })
    });
  }
));  


var app = express();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.engine('ejs', require('ejs-locals'));
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(flash());
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/../../public'));
});

app.all('*', function(req,res,next){
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-xsrf-token");
  next();
});
app.get('/', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.jsonp({ message: "Authenticated" })
});    
app.get('/api/account', ensureAuthenticated, function(req, res){  
  res.jsonp({ message: "Authenticated" })
});

app.get('/api/unauthorized', function(req, res){
  res.jsonp({ message: "Authentication Error" })
});

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "apikey=asdasjsdgfjkjhg" http://127.0.0.1:3000/api/authenticate
    app.post('/api/authenticate', 
      passport.authenticate('localapikey', { failureRedirect: '/api/unauthorized'}),
      function(req, res) {
         res.json({ message: "Authenticated" })
      });
  
// POST /login
//   This is an alternative implementation that uses a custom callback to
//   acheive the same functionality.
/*
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/users/' + user.username);
    });
  })(req, res, next);
});
*/

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/flash', function(req, res){
  // Set a flash message by passing the key, followed by the value, to req.flash().
  res.jsonp('flash needs ejs and server side pages');
});



app.listen(3030);

console.log("Server running on port 3030");

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/api/unauthorized')
}

