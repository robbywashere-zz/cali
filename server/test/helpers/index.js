const { User, Post, Account } = require("../../models");

function UserFactory(options){
  return User.create({
    email: "x@x.com",
    ...options
  })
}
module.exports = { UserFactory }
