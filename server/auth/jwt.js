const jwtToken = require('jsonwebtoken');
const config = require('config');
const { Router } = require('express');
const { get } = require('lodash');
const { User } = require('../models');
const logger = require('../lib/logger')
const { Forbidden } = require('http-errors');
const expressJwt = require('../lib/expressJwt');

function sign({ data, secret = config.get('JWT_SECRET'), expiry = config.get('JWT_EXPIRY') } = {}){
  return jwtToken.sign({ data },secret,{ expiresIn: expiry });
}

function middleware({ protect, secret = config.get('JWT_SECRET') }){
  const router = new Router();
  const deserialize = ({ email })=>User.findBy({ email });
  router.use( expressJwt.jwt({ secret, credentialsRequired: false }), async function(req,res,next){
    try {

      if (!get(req,'user.data') || !(req.user = await deserialize(req.user.data))) {
        return next();
      }
    } catch(e) {
      logger.error(e);
      return next(e);
    }
    protect(req,res,next);
  });
  return router;
};

module.exports = { sign, middleware };
