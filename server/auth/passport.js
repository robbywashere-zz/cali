const GoogleStrategy = require('passport-google-oauth20').Strategy;
const logger = require('../lib/logger');
const passport = require('passport');
const { Router } = require('express');
const config = require('config');
const { User, GoogleAccount } = require('../models'); 
const AnyAuth = require('./anyauth');
const { sign } = require('./jwt');


function GoogleAuth(){

  return AnyAuth({
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


module.exports = { GoogleAuth }
