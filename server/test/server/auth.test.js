const express = require('express');

const expressJwt = require('../../lib/expressJwt');

const assert = require('assert');

const sinon = require('sinon');

const models = require('../../models');

//const { middleware } = require('../../auth/jwt');

const request = require('supertest');

const server = require('../../server');

describe('server auth', function(){


  describe('server middleware',function(){




  });


  describe('server module', function(){

    let sandbox;
    beforeEach(()=>{
      sandbox = sinon.createSandbox();
    });
    afterEach(()=>{
      sandbox.restore()
    })

    it (`should skip a "protect'ed" route when req.user is undefined`, async function(){

      const app = await server();
      app.get('/teapot',function(req,res){
        res.sendStatus(418);
      });
      await request(app).get('/teapot').expect(418);
    })

    it (`should throw not found`, async function(){
      const app = await server();
      await request(app).get('/notfound').expect(404);
    })


    it (`should allow "protect'ed" route when req.user is defined when getting /me`, async function(){

      const email = 'x@x.com';

      sandbox.stub(models.User,'findBy').callsFake(()=>({ email }));
      
      sandbox.stub(expressJwt,'jwt').returns((req,res,next)=>{
        req.user = { data: { email } };
        next();
      });

      const app = await server();

      app.get('/',function(req,res){
        throw new Error('this shouldnt happen')
      })

      const resp = await request(app).get('/api/me').expect(200);

      assert.equal(models.User.findBy.getCall(0).args[0].email,email)

      assert.equal(resp.body.email, email);

    })

  })

});



