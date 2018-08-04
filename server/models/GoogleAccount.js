const Sequelize = require('sequelize');
const Haikunator = require('haikunator');
const haikunator = new Haikunator();

module.exports = {
  Name: 'GoogleAccount',
  Properties: {
    refresh_token:{
      type: Sequelize.STRING,
    },
  },
}
