const Sequelize = require('sequelize');
const { Op } = Sequelize;

module.exports ={
  Name: 'User',
  Properties: {
    email: {
      type: Sequelize.STRING,
      //>TODO: tests --> allowNull: false,
      validate: {
        isEmail: true,
      },
      unique: true,
    },
  },
  Init({ Account, Post, GoogleAccount }) {
    this.hasOne(GoogleAccount);
  },
}

