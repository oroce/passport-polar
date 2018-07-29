require('dotenv').load();
var express = require('express');
var passport = require('passport');
var Strategy = require('../').Strategy;
var got = require('got');
passport.use(new Strategy({
  clientID: process.env.POLAR_CLIENT_ID,
  clientSecret: process.env.POLAR_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/polar/callback',
  scope: 'accesslink.read_all'
},
async function (accessToken, refreshToken, params, profile, cb) {
  const response = await got(`https://www.polaraccesslink.com/v3/users/${params.x_user_id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    json: true
  });
  let user = response.body;
  if (user === '') {
    const registration = await got('https://www.polaraccesslink.com/v3/users', {
      json: true,
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: {
        'member-id': params.x_user_id
      }
    });
    user = registration.body;
  }

  cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// Create a new Express application.
var app = express();

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
  if (!req.user) {
    return res.send('No user logged in, go to /login');
  }
  res.json(req.user);
});

app.get('/login', passport.authenticate('polar'));

app.get('/auth/polar/callback', passport.authenticate('polar', { failureRedirect: '/?err' }), function (req, res) {
  res.redirect('/');
});
app.listen(process.env.PORT);
