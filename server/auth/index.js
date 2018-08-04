const { BadRequest } = require('http-errors');
const logger = require('../lib/logger');
const { OAuth2Client } = require('google-auth-library');
const { sign } = require('./jwt');
const { GoogleAccount, User } = require('../models');
const { Router } = require('express');
const config = require('config');


function oaClient({ clientId, clientSecret, redirectURL } = {}){
  return new OAuth2Client(
    clientId || config.get(`G_CLIENT_ID`),
    clientSecret || config.get(`G_CLIENT_SECRET`),
    redirectURL || config.get(`G_REDIRECT_URL`)
  );
}

module.exports = function GoogleAuth({ clientId, clientSecret, redirectURL, redirectPath }){

  const router = new Router();


  router.get('/g_login',function(req,res, next){

    const oac = oaClient({ redirectURL, redirectPath });

    const authorizeUrl = oac.generateAuthUrl({
      // To get a refresh token, you MUST set access_type to `offline`.
      access_type: 'offline',
      // set the appropriate scopes
      scope: ['https://www.googleapis.com/auth/calendar', 'email', 'openid', 'https://www.googleapis.com/auth/plus.me'],
      // A refresh token is only returned the first time the user
      // consents to providing access.  For illustration purposes,
      // setting the prompt to 'consent' will force this consent
      // every time, forcing a refresh_token to be returned.
      prompt: ((process.env.NODE_ENV !== "production") ? 'consent' : undefined)
    });

    res.redirect(authorizeUrl);

  })

  router.get(redirectPath, async function(req, res, next){


    try {
      const { code } = req.query;

      if (typeof code === "undefined") throw new BadRequest(`OAuth callback must have "code" query param`);

      const oac = oaClient();

      const { tokens } = await oac.getToken(code);

      oac.setCredentials(tokens);

      const url = `https://www.googleapis.com/plus/v1/people/me`;

      const { data } = await oac.request({ url });

      const email = data.emails.find(email=>email.type === "account").value;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        await User.create({ 
          email,
          GoogleAccount: tokens
        },{ include: [ GoogleAccount ] });
      }

      const jwt = sign({ data: email });

      res.cookie('jwt', JSON.stringify(jwt), { maxAge: 60*1000, httpOnly: false });

      res.redirect(302, '/');


    } catch(e) {
      logger.error(e);
      next(e);
    }
  });
  return router;
}



