const jwtToken = require('jsonwebtoken');
const config = require('config');
const { Router } = require('express');
const { User } = require('../models');
const logger = require('../lib/logger')
const { Forbidden } = require('http-errors');
const expressJwt = require('./expressJwt');

function sign({ data, secret = config.get('JWT_SECRET'), expiry = config.get('JWT_EXPIRY') } = {}){
  return jwtToken.sign({ data },secret,{ expiresIn: expiry });
}

function middleware({ protect, deserializeBy = "email", secret = config.get('JWT_SECRET') }){
  const router = new Router();
  router.use( expressJwt.jwt({ secret, credentialsRequired: false }), async function(req,res,next){
    const finduser = ()=> User.findOne({ where: { [deserializeBy]: req.user.data[deserializeBy] } });
    try {
      if (!req.user || !(req.user = await finduser())) {
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
