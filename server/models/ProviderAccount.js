const Sequelize = require('sequelize');

module.exports = {
  Name: 'ProviderAccount',
  Properties: {
    refresh_token:{
      type: Sequelize.STRING,
    },
    provider: {
      type: Sequelize.STRING
    }
  },
}
