# passport-polar

[![Build](https://circleci.com/gh/oroce/passport-polar.svg?style=svg)](https://circleci.com/gh/oroce/passport-polar)


[Passport](http://passportjs.org/) strategy for authenticating with [Polar](https://www.polar.com/accesslink-api)
using the OAuth 2.0 API.

This module lets you authenticate using Polar in your Node.js applications.
By plugging into Passport, Polar authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-polar

## Usage

#### Create an Application

Before using `passport-polar`, you must register an application with
Polar. If you have not already done so, a new application can be created at
[Polar Admin](https://admin.polaraccesslink.com/).  Your application will
be issued an app ID and app secret, which need to be provided to the strategy.
You will also need to configure a redirect URI which matches the route in your
application.

Please note: even though the Polar Access Link asks for `domain` when you are setting up a new app, actually they mean URL, it's enough to set `http://myapp.com`, you have to set `http://myapp.com/auth/polar/callback`.

#### Configure Strategy

The Polar authentication strategy authenticates users using a Polar
account and OAuth 2.0 tokens.  The app ID and secret obtained when creating an
application are supplied as options when creating the strategy.  The strategy
also requires a `verify` callback, which receives the access token and optional
refresh token, as well as `profile` and `params`.
Unlikely to other strategies the `profile` won't be set, it will be always an empty object (`{}`). But the params will contain the user id.

```
{ 
  access_token: 'access-token',
  token_type: 'bearer',
  expires_in: 473039999,
  x_user_id: 123445566
}
```

Here you have to register your user as the documentation [describes](https://www.polar.com/accesslink-api/?javascript--nodejs#register-user).

The `verify` callback must call `cb` providing a user to
complete authentication.

```js
passport.use(new PolarStrategy({
    clientID: POLAR_APP_ID,
    clientSecret: POLAR_APP_SECRET,
    callbackURL: 'http://localhost:3000/auth/polar/callback',
    scope: 'accesslink.read_all'
  },
  function (accessToken, refreshToken, params, profile, cb) {
    /*
     1. fetch https://www.polaraccesslink.com/v3/users/${params.x_user_id}(https://www.polar.com/accesslink-api/?javascript--nodejs#get-user-information)
     2. if empty string is returned, then we need to register the user, otherwise call the `cb` with the fetched data
     3. register the user (https://www.polar.com/accesslink-api/?javascript--nodejs#register-user)
     4. call the `cb` with received user information
   */
  }
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'polar'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
app.get('/auth/polar',
  passport.authenticate('polar'));

app.get('/auth/polar/callback',
  passport.authenticate('polar', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```

## Examples

You can find a complete example in the `example`, you can try it out:

1. get your client id and client secret
2. `cd example`
3. `cp .env.example .env`
4. add these parameters to `.env`
5. `node app.js`
6. navigate to `http://localhost:3000`
7. you should receive: `No user logged in, go to /login`
8. navigate to `http://localhost:3000/login`
9. you should get redirected to the Polar page and once you approve the app, redirected back to `http://localhost:3000` where you should your profile's information.

## Tests

The test suite is located in the `test/` directory.  All new features are
expected to have corresponding test cases.  Ensure that the complete test suite
passes by executing:
 
```bash
npm test
```

## Acknowledgement

Thanks Jared Hanson <http://jaredhanson.net/> for making Passport.js happen.

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2018 Robert Oroszi

