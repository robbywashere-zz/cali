const express = require('express');
const { middleware: jwtMiddleware } = require('./auth/jwt');
const logger = require('./lib/logger');
const config = require('config');
const dbSync = require('./db/sync');
const { User, Account } = require('./models'); 
const { Unauthorized, NotFound } = require('http-errors'); 

const GoogleAuth = require('./auth');


function api(){
  const router = new express.Router();
  router.get('/me', (req,res)=>res.send(req.user))
  router.get('/', (req,res)=>res.send('Hello World'))
  return router
}


async function Server(){

  await dbSync(true);

  const app = express();

  app.use(require('body-parser').json());

  app.use(GoogleAuth.route({ login: '/login' }));

  app.use('/api',jwtMiddleware({ protect: api() }));

  app.use((err, req, res, next) => {
    if (config.get('NODE_ENV') !== 'production') logger.error(err);
    if (res.headersSent) {
      return next(err)
    }
    const status = err.status || 500;
    res.status(status);
    res.send({ error: { message: err.message, status  }})
  })

  return app;
}

if (require.main === module) {
  (async ()=>{
    try { 
      const PORT = config.get('PORT');
      const app = await Server();
      app.listen(PORT, ()=> logger.log(`Listening on ${PORT}`))
    } catch(e) {
      logger.error(`Could not start server \n ${e}`);
    }
  })()
}

module.exports = Server
