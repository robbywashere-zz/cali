const { User, GoogleAccount, Account, Post } = require('../../models');
const assert = require('assert');
const dbSync = require('../../db/sync');

describe('User model', ()=>{

  beforeEach(()=>dbSync(true))


  it ('- should throw SequelizeValidationError on #.create(), when email is not provided', async ()=>{

    try {
      await User.create({})
    } catch(err) {
      assert.equal(err.name, "SequelizeValidationError")
      assert(err.errors.length);
      assert(err.errors.some( (e)=> e.path === "email" ))
    }

  });


  it (`- should have a google account`, async ()=>{
    const user = await User.create({
      email: 'x@x.com',
      GoogleAccount: {
        refresh_token: 'rt',
      }
    },{
      include: [GoogleAccount]
    });
    assert.equal(user.GoogleAccount.refresh_token, 'rt');
  });



})
