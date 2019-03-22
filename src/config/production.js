/* eslint-disable no-process-env */
const parent = require('./global')

module.exports = {
  ...parent,
  // Heroku rolls it's own HTTPS
  httpsAllow: false,
  // Heroku provides port number
  httpPort: process.env.PORT,
  // Allow Mongo logs
  logMongoAllow: true,
  logMongoCollection: 'generic-api-production',
}
