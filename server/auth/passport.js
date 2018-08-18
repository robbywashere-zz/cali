const GoogleStrategy = require('passport-google-oauth20').Strategy;
const logger = require('../lib/logger');
const passport = require('passport');
const { Router } = require('express');
const config = require('config');
const { User, GoogleAccount } = require('../models'); 
const { sign } = require('./jwt');

function AnyOAuth({ 
  clientID, 
  clientSecret, 
  loginPath,
  baseURL,
  callbackPath,
  strategy,
  params,
  authenticate,
  success,
}){

  const router = new Router();

  const callbackURL = baseURL.replace(/\/$/,'') + '/' + callbackPath.replace(/^\//,'');

  const strategyInstance = new strategy({
    clientID,
    clientSecret,
    callbackURL
  },
    authenticate
  );

  passport.use(strategyInstance);

  router.get(loginPath, passport.authenticate(strategyInstance.name, params));

  router.get(
    callbackPath, 
    passport.authenticate(strategyInstance.name, { session: false }),
    success
  );

  return router;
}


function GoogleAuth({ 
  clientID, 
  clientSecret, 
  loginPath,
  baseURL,
  callbackPath,
  authenticate,
  success
}){

  const router = new Router();

  const callbackURL = baseURL.replace(/\/$/,'') + '/' + callbackPath.replace(/^\//,'');

  passport.use(new GoogleStrategy({
    clientID,
    clientSecret,
    callbackURL
  },
    authenticate
  ));

  router.get(loginPath, passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'email',
      'openid',
      'https://www.googleapis.com/auth/plus.me'
    ],
    access_type: 'offline',
    prompt: 'consent'
  }));

  router.get(
    callbackPath, 
    passport.authenticate('google', { session: false }),
    success
  );

  return router;
}

function GoogleAnyOAuth(){

  return AnyOAuth({
    clientID: config.get('G_CLIENT_ID'),
    clientSecret: config.get('G_CLIENT_SECRET'),
    loginPath: '/login',
    baseURL: config.get('BASE_URL'),
    callbackPath: config.get('G_REDIRECT_PATH'),
    strategy: GoogleStrategy,
    authenticate: async (accessToken, refresh_token , profile, cb) => {
      try {
        const email = profile.emails.find(email=>email.type === "account").value;
        const user = (await User.findBy({ email })) || (await User.create({ 
          email,
          GoogleAccount: { refresh_token }
        },{ include: [ GoogleAccount ] }));
        cb(null, user);
      } catch(e) {
        logger.error(e);
        cb(e);
      }
    },
    success: (req, res) => {
      const jwt = sign({ data: req.user.email });
      res.cookie('jwt', JSON.stringify(jwt), { maxAge: 60*1000, httpOnly: false });
      res.redirect('/');
    },
    params: {
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'email',
        'openid',
        'https://www.googleapis.com/auth/plus.me'
      ],
      access_type: 'offline',
      prompt: 'consent'
    }
  });

}


module.exports = { GoogleAuth, GoogleAuthMiddleware: GoogleAnyOAuth }
