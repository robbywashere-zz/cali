require('dotenv').config();

module.exports = {
  NODE_ENV: 'development',
  BASE_URL: process.env.BASE_URL,
  PORT: process.env.PORT || 3000,
  G_CLIENT_ID: process.env.G_CLIENT_ID,
  G_CLIENT_SECRET: process.env.G_CLIENT_SECRET,
  G_REDIRECT_URL: process.env.G_REDIRECT_URL,
  G_REDIRECT_PATH: process.env.G_REDIRECT_PATH,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY,
}

