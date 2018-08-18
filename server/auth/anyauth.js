const { Router } = require('express');
const passport = require('passport');

module.exports = function AnyOAuth({ 
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


